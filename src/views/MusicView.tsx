import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  ChevronDown,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Search,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import Equalizer from '@/components/Equalizer';
import { useAudio } from '@/audio/AudioProvider';
import { tracks, type TrackItem } from '@/siteData';
import { loadYouTubeApi, YT_ERROR_TEXT, YT_STATE, type YTPlayer } from '@/lib/youtube';

// The YouTube player lives in a tiny off-screen container: only its audio is used.
const PLAYER_SIZE = 1;

type SortKey = 'default' | 'title-asc' | 'artist-asc';
type RepeatMode = 'off' | 'all' | 'one';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'artist-asc', label: 'Artist (A-Z)' },
];

const collator = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });

const COMPARATORS: Record<SortKey, ((a: TrackItem, b: TrackItem) => number) | null> = {
  default: null,
  'title-asc': (a, b) => collator(a.title, b.title),
  'artist-asc': (a, b) => collator(a.artist, b.artist) || collator(a.title, b.title),
};

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])';
const VOLUME_KEY = 'novoumy:player-volume';

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

const playable = (track: TrackItem) => track.youtubeId.trim() !== '';

const LINK_PILL =
  'rounded bg-[#1e1f22] px-2 py-1.5 font-pixel text-[8px] uppercase leading-none text-[#dbdee1] outline-none transition-colors hover:bg-[#404249] hover:text-[#f2f3f5] focus-visible:ring-2 focus-visible:ring-[#5865f2]';

function loadVolume(): number {
  try {
    const value = Number(window.localStorage.getItem(VOLUME_KEY));
    if (window.localStorage.getItem(VOLUME_KEY) !== null && Number.isFinite(value)) return Math.min(100, Math.max(0, value));
  } catch {
    // storage unavailable
  }
  return 80;
}

interface MusicViewProps {
  onClose: () => void;
}

// Full-screen music library + persistent player bar. Rendered through a portal
// into <body>, exactly like the media library.
export default function MusicView({ onClose }: MusicViewProps) {
  const { setBgmSuppressed } = useAudio();
  const suppressRef = useRef(setBgmSuppressed);
  suppressRef.current = setBgmSuppressed;

  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('all');
  const [sort, setSort] = useState<SortKey>('default');

  // --- player state -------------------------------------------------------
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [volume, setVolume] = useState(loadVolume);
  const [muted, setMuted] = useState(false);
  const [failed, setFailed] = useState<Record<number, string>>({});
  const [durations, setDurations] = useState<Record<number, number>>({});
  const [apiError, setApiError] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);
  const pendingRef = useRef<string | null>(null);
  const scrubbing = useRef(false);
  const chainRef = useRef(false); // true while auto-skipping through the queue
  const historyRef = useRef<number[]>([]);

  const searched = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return tracks;
    return tracks.filter((track) =>
      normalize(`${track.title} ${track.artist} ${track.album ?? ''}`).includes(needle),
    );
  }, [query]);

  const genreOptions = useMemo(() => {
    const seen: string[] = [];
    for (const track of tracks) if (!seen.includes(track.genre)) seen.push(track.genre);
    return [{ label: 'All', value: 'all' }, ...seen.map((g) => ({ label: g, value: g }))];
  }, []);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: searched.length };
    for (const track of searched) result[track.genre] = (result[track.genre] ?? 0) + 1;
    return result;
  }, [searched]);

  const visible = useMemo(() => {
    const filtered = genre === 'all' ? searched : searched.filter((track) => track.genre === genre);
    const compare = COMPARATORS[sort];
    return compare ? [...filtered].sort(compare) : filtered;
  }, [searched, genre, sort]);

  // Next/previous move through what is currently listed (and can actually play).
  const queue = useMemo(() => visible.filter((track) => playable(track) && !failed[track.id]), [visible, failed]);

  const current = useMemo(() => tracks.find((track) => track.id === currentId) ?? null, [currentId]);

  // What the showcase and player bar display: the loaded track, else the first one listed.
  const featured = current ?? visible[0] ?? tracks[0];

  // Event handlers registered once with YouTube read the latest values from here.
  const live = useRef({ queue, current: currentId, shuffle, repeat, position });
  live.current = { queue, current: currentId, shuffle, repeat, position };

  // --- loading a track ----------------------------------------------------
  const startTrack = useCallback((track: TrackItem, fromChain = false) => {
    if (!playable(track)) return;
    chainRef.current = fromChain;
    const previous = live.current.current;
    if (previous !== null && previous !== track.id) historyRef.current.push(previous);
    setCurrentId(track.id);
    setPosition(0);
    setDuration(0);
    setPlaying(true);
    suppressRef.current(true); // pause the site's background loop
    if (playerRef.current && readyRef.current) playerRef.current.loadVideoById(track.youtubeId);
    else pendingRef.current = track.youtubeId;
  }, []);

  const advance = useCallback(
    (manual: boolean) => {
      const { queue: q, current: cur, shuffle: shuf, repeat: rep } = live.current;
      if (q.length === 0) return;
      const index = q.findIndex((track) => track.id === cur);
      let next: TrackItem | undefined;
      if (shuf) {
        const pool = q.length > 1 ? q.filter((track) => track.id !== cur) : q;
        next = pool[Math.floor(Math.random() * pool.length)];
      } else if (index === -1) {
        next = q[0];
      } else if (index < q.length - 1) {
        next = q[index + 1];
      } else if (manual || rep === 'all') {
        next = q[0];
      }
      if (next) startTrack(next, !manual);
      else {
        setPlaying(false);
        setPosition(0);
      }
    },
    [startTrack],
  );

  const previous = useCallback(() => {
    const { queue: q, current: cur, position: pos } = live.current;
    const player = playerRef.current;
    if (pos > 3 && player) {
      player.seekTo(0, true);
      setPosition(0);
      return;
    }
    const lastId = historyRef.current.pop();
    const fromHistory = lastId === undefined ? undefined : q.find((track) => track.id === lastId);
    if (fromHistory) {
      // startTrack would push the current id back onto the history; drop it again.
      startTrack(fromHistory);
      historyRef.current.pop();
      return;
    }
    const index = q.findIndex((track) => track.id === cur);
    const target = index > 0 ? q[index - 1] : q[q.length - 1];
    if (target) startTrack(target);
  }, [startTrack]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player || !readyRef.current) return;
    if (live.current.current === null) {
      if (live.current.queue[0]) startTrack(live.current.queue[0]);
      return;
    }
    if (playing) player.pauseVideo();
    else player.playVideo();
  }, [playing, startTrack]);

  // --- YouTube player lifecycle ------------------------------------------
  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    if (!host) return;
    const mount = document.createElement('div');
    host.appendChild(mount);

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled) return;
        playerRef.current = new YT.Player(mount, {
          width: PLAYER_SIZE,
          height: PLAYER_SIZE,
          playerVars: {
            playsinline: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              if (cancelled || !playerRef.current) return;
              readyRef.current = true;
              playerRef.current.setVolume(volumeRef.current);
              if (mutedRef.current) playerRef.current.mute();
              if (pendingRef.current) {
                playerRef.current.loadVideoById(pendingRef.current);
                pendingRef.current = null;
              }
            },
            onStateChange: (event) => {
              if (cancelled) return;
              if (event.data === YT_STATE.PLAYING) {
                chainRef.current = false;
                setPlaying(true);
                const length = playerRef.current?.getDuration() ?? 0;
                if (length > 0) {
                  setDuration(length);
                  const id = live.current.current;
                  if (id !== null) setDurations((map) => (map[id] === length ? map : { ...map, [id]: length }));
                }
              } else if (event.data === YT_STATE.PAUSED) {
                setPlaying(false);
              } else if (event.data === YT_STATE.ENDED) {
                if (live.current.repeat === 'one' && playerRef.current) {
                  playerRef.current.seekTo(0, true);
                  playerRef.current.playVideo();
                } else {
                  advance(false);
                }
              }
            },
            onError: (event) => {
              if (cancelled) return;
              const id = live.current.current;
              setPlaying(false);
              if (id === null) return;
              setFailed((map) => ({ ...map, [id]: YT_ERROR_TEXT[event.data] ?? 'This video cannot be played here.' }));
              // When skipping through the queue, move on to the next track that works.
              if (chainRef.current) {
                live.current.queue = live.current.queue.filter((track) => track.id !== id);
                advance(false);
              }
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) setApiError(true);
      });

    return () => {
      cancelled = true;
      readyRef.current = false;
      try {
        playerRef.current?.destroy();
      } catch {
        // already gone
      }
      playerRef.current = null;
      mount.remove();
      suppressRef.current(false); // let the site's background loop resume
    };
  }, [advance]);

  // Volume and mute live in refs too, so onReady can apply them.
  const volumeRef = useRef(volume);
  const mutedRef = useRef(muted);
  useEffect(() => {
    volumeRef.current = volume;
    mutedRef.current = muted;
    const player = playerRef.current;
    if (player && readyRef.current) {
      player.setVolume(volume);
      if (muted || volume === 0) player.mute();
      else player.unMute();
    }
    try {
      window.localStorage.setItem(VOLUME_KEY, String(volume));
    } catch {
      // ignore
    }
  }, [volume, muted]);

  // Progress: poll the player while a track is playing.
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player || !readyRef.current || scrubbing.current) return;
      setPosition(player.getCurrentTime() || 0);
      const length = player.getDuration() || 0;
      if (length > 0) setDuration((old) => (old === length ? old : length));
    }, 250);
    return () => window.clearInterval(timer);
  }, [playing]);

  // --- dialog plumbing (same behaviour as the media library) --------------
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) searchRef.current?.focus();
    else dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === '/' && document.activeElement !== searchRef.current) {
        const tag = (document.activeElement as HTMLElement | null)?.tagName;
        if (tag !== 'INPUT' && tag !== 'SELECT') {
          event.preventDefault();
          searchRef.current?.focus();
        }
        return;
      }
      if (event.key === 'Tab' && dialogRef.current) {
        const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && (active === first || active === dialogRef.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    listScrollRef.current?.scrollTo({ top: 0 });
  }, [query, genre, sort]);

  const resetAll = () => {
    setQuery('');
    setGenre('all');
    searchRef.current?.focus();
  };

  // --- seek bar -----------------------------------------------------------
  const commitSeek = (seconds: number) => {
    scrubbing.current = false;
    playerRef.current?.seekTo(seconds, true);
    setPosition(seconds);
  };

  const shownDuration = duration || (current ? durations[current.id] ?? 0 : 0);
  const seekMax = Math.max(1, Math.floor(shownDuration));
  const seekFill = shownDuration > 0 ? Math.min(100, (position / shownDuration) * 100) : 0;
  const effectiveVolume = muted ? 0 : volume;
  const VolumeIcon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 50 ? Volume1 : Volume2;
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;
  const currentError = current ? failed[current.id] : undefined;

  const durationLabel = (track: TrackItem) =>
    track.duration ?? (durations[track.id] ? formatTime(durations[track.id]) : '--:--');

  const ctrl =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#b5bac1] outline-none transition-colors hover:text-[#f2f3f5] focus-visible:ring-2 focus-visible:ring-[#5865f2] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[#b5bac1]';

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Music library"
      tabIndex={-1}
      className="media-dark animate-tab-in fixed inset-0 z-[100] flex h-dvh w-screen flex-col bg-[#313338] text-[#f2f3f5] outline-none"
    >
      {/* Hidden YouTube player (official IFrame API) */}
      <div
        ref={hostRef}
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 left-0 overflow-hidden opacity-0"
        style={{ width: PLAYER_SIZE, height: PLAYER_SIZE }}
      />

      {/* Title bar */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#1e1f22] bg-[#2b2d31] px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8 lg:px-12">
        <div onClick={onClose} className="flex min-w-0 cursor-pointer items-baseline gap-3 sm:gap-4">
          <h2 className="min-w-0 truncate text-[11px] uppercase sm:text-[14px]">
            <button
              type="button"
              aria-label="Close music library"
              className="cursor-pointer truncate border-0 bg-transparent p-0 text-left uppercase text-[#f2f3f5] outline-none [font:inherit] focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-4"
            >
              &gt; Music library
            </button>
          </h2>
          <span className="hidden shrink-0 font-pixel text-[8px] uppercase text-[#949ba4] sm:inline" aria-live="polite">
            // {visible.length} / {tracks.length} tracks
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close music library"
          className="pixel-btn !bg-[#1e1f22] !text-[#f2f3f5] hover:!bg-[#404249]"
        >
          <X size={14} strokeWidth={3} aria-hidden="true" />
          <span>Close</span>
        </button>
      </header>

      {/* Split screen: now-playing showcase (left) + queue sidebar (right) */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Showcase */}
        <section
          aria-label="Now playing"
          className="relative flex shrink-0 items-center gap-4 overflow-hidden border-b border-[#1e1f22] bg-[#313338] px-4 py-4 sm:gap-6 sm:px-8 lg:min-h-0 lg:flex-1 lg:flex-col lg:justify-center lg:gap-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-8"
        >
          {/* Ambient light: a heavily blurred copy of the cover, so the glow always matches its colours. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <img
              key={`glow-${featured.id}`}
              src={featured.coverUrl}
              alt=""
              decoding="async"
              className="glow-in absolute left-1/2 top-1/2 h-[150%] w-[150%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover opacity-50 blur-[80px] saturate-150"
            />
            <div className="absolute inset-0 bg-[#1e1f22]/35" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,31,34,0)_0%,#313338_85%)]" />
          </div>

          <div
            style={{ '--art': 'max(240px, min(620px, 100%, calc(100dvh - 24rem)))' } as CSSProperties}
            className="relative z-10 w-28 shrink-0 sm:w-36 lg:w-[var(--art)]"
          >
            {/* Tighter glow right behind the card */}
            <img
              key={`halo-${featured.id}`}
              src={featured.coverUrl}
              alt=""
              aria-hidden="true"
              decoding="async"
              className="glow-in absolute inset-0 h-full w-full scale-105 object-cover opacity-70 blur-2xl saturate-150"
            />
            <img
              key={featured.id}
              src={featured.coverUrl}
              alt={`${featured.title} cover art`}
              decoding="async"
              className="animate-tab-in relative aspect-square w-full bg-[#1e1f22] object-cover shadow-[0_0_0_4px_#1e1f22,10px_10px_0_4px_#5865f2]"
            />
          </div>

          <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-2 lg:w-[max(var(--art),24rem)] lg:max-w-full lg:flex-none lg:gap-4">
            <div className="flex items-center gap-3">
              <span className="font-pixel text-[9px] uppercase text-[#b5bac1] lg:text-[11px]">
                {!current ? 'Select a track' : playing ? 'Now playing' : 'Paused'}
              </span>
              {current && playing && <Equalizer live />}
            </div>
            <h3 className="break-words text-[13px] font-bold leading-[1.5] sm:text-[16px] lg:text-[26px]">{featured.title}</h3>
            <p className="truncate text-[28px] leading-none text-[#f2f3f5] sm:text-[32px] lg:text-[44px]">{featured.artist}</p>
            {featured.album && (
              <p className="truncate text-[22px] leading-none text-[#b5bac1] sm:text-[24px] lg:text-[30px]">{featured.album}</p>
            )}
            <div>
              <span className="inline-block rounded-sm bg-[#5865f2] px-3 py-2 font-pixel text-[9px] uppercase leading-none text-white lg:text-[11px]">
                {featured.genre}
              </span>
            </div>
          </div>
        </section>

        {/* Queue sidebar */}
        <aside aria-label="Up next" className="flex min-h-0 flex-1 flex-col bg-[#2b2d31] lg:w-[340px] lg:flex-none xl:w-[380px]">
          <div className="flex shrink-0 flex-col gap-3 border-b border-[#1e1f22] px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <h3 className="font-pixel text-[9px] uppercase text-[#f2f3f5]">Up next</h3>
              <span className="font-pixel text-[8px] uppercase text-[#949ba4]" aria-live="polite">
                {visible.length} / {tracks.length}
              </span>
            </div>

            <div className="flex gap-2">
              <label className="relative flex min-w-0 flex-1 items-center rounded border border-transparent bg-[#1e1f22] focus-within:border-[#5865f2]">
                <span className="sr-only">Search tracks, artists, or albums</span>
                <Search size={16} strokeWidth={3} aria-hidden="true" className="pointer-events-none absolute left-3 text-[#949ba4]" />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search tracks, artists, or albums..."
                  autoComplete="off"
                  spellCheck={false}
                  enterKeyHint="search"
                  className="h-10 w-full bg-transparent pl-9 pr-9 font-body text-[21px] leading-none text-[#f2f3f5] outline-none placeholder:text-[#949ba4] [&::-webkit-search-cancel-button]:hidden"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      searchRef.current?.focus();
                    }}
                    aria-label="Clear search"
                    className="absolute right-1.5 flex h-7 w-7 items-center justify-center rounded text-[#949ba4] hover:bg-[#404249] hover:text-[#f2f3f5]"
                  >
                    <X size={14} strokeWidth={3} aria-hidden="true" />
                  </button>
                )}
              </label>

              <label className="relative flex w-[8.5rem] shrink-0 items-center rounded border border-transparent bg-[#1e1f22] focus-within:border-[#5865f2] hover:bg-[#404249]">
                <span className="sr-only">Sort by</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortKey)}
                  className="h-10 w-full cursor-pointer appearance-none bg-transparent pl-3 pr-8 font-body text-[20px] leading-none text-[#f2f3f5] outline-none"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#1e1f22] text-[#f2f3f5]">
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} strokeWidth={3} aria-hidden="true" className="pointer-events-none absolute right-2.5 text-[#949ba4]" />
              </label>
            </div>

            <div role="group" aria-label="Filter by genre" className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 py-0.5">
              {genreOptions.map((option) => {
                const active = option.value === genre;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setGenre(option.value)}
                    className={[
                      'flex shrink-0 items-center gap-2 rounded px-2.5 py-2 font-pixel text-[8px] uppercase transition-colors duration-150',
                      active
                        ? 'bg-[#5865f2] text-white'
                        : 'bg-[#1e1f22] text-[#dbdee1] hover:bg-[#404249] hover:text-[#f2f3f5]',
                    ].join(' ')}
                  >
                    {option.label}
                    <span className={active ? 'text-white/80' : 'text-[#949ba4]'}>{counts[option.value] ?? 0}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div ref={listScrollRef} className="pixel-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 sm:px-3">
            {apiError && (
              <p className="mb-2 rounded border border-[#ed4245] bg-[#313338] px-3 py-2 text-[18px] text-[#dbdee1]">
                The YouTube player could not be loaded (blocked or offline). Tracks can&apos;t be played right now, but
                the links still work.
              </p>
            )}

            {visible.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <p className="font-pixel text-[10px] uppercase leading-[1.8] text-[#f2f3f5]">No results</p>
                <p className="text-[#949ba4]">
                  {query.trim() ? `Nothing matches "${query.trim()}"` : 'Nothing here yet'}
                  {genre !== 'all' ? ' in this genre.' : '.'}
                </p>
                <button type="button" onClick={resetAll} className="pixel-btn !bg-[#5865f2] !text-white hover:!bg-[#4752c4]">
                  Reset search &amp; filters
                </button>
              </div>
            ) : (
              <ul className="flex flex-col gap-1">
                {visible.map((track, index) => {
                  const isCurrent = track.id === currentId;
                  const canPlay = playable(track) && !failed[track.id];
                  const rowError = failed[track.id];
                  const muteText = isCurrent ? 'text-white/80' : 'text-[#949ba4]';
                  return (
                    <li
                      key={track.id}
                      className={[
                        'group rounded-md transition-colors duration-150',
                        isCurrent ? 'bg-[#5865f2] text-white' : 'hover:bg-[#3a3c42]',
                      ].join(' ')}
                    >
                      <button
                        type="button"
                        disabled={!canPlay}
                        onClick={() => (isCurrent ? togglePlay() : startTrack(track))}
                        aria-label={`${isCurrent && playing ? 'Pause' : 'Play'} ${track.title} by ${track.artist}`}
                        title={
                          rowError ??
                          (playable(track) ? undefined : 'No youtubeId set for this track yet, so it cannot be played here.')
                        }
                        className="flex w-full min-w-0 items-center gap-3 rounded-md px-2 pb-1 pt-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#5865f2] enabled:cursor-pointer disabled:cursor-not-allowed"
                      >
                        <span className={['relative h-11 w-11 shrink-0', canPlay ? '' : 'opacity-50'].join(' ')}>
                          <img src={track.coverUrl} alt="" loading="lazy" decoding="async" className="h-full w-full rounded-sm bg-[#1e1f22] object-cover" />
                          <span
                            className={[
                              'absolute inset-0 flex items-center justify-center rounded-sm bg-black/55 font-pixel text-[8px] text-white',
                              isCurrent || rowError ? 'flex' : 'hidden group-hover:flex',
                            ].join(' ')}
                          >
                            {rowError ? (
                              <AlertTriangle size={16} aria-hidden="true" className="text-[#faa61a]" />
                            ) : isCurrent && playing ? (
                              <Equalizer live />
                            ) : canPlay ? (
                              <Play size={14} fill="currentColor" aria-hidden="true" />
                            ) : (
                              index + 1
                            )}
                          </span>
                        </span>
                        <span className={['flex min-w-0 flex-1 flex-col gap-1', canPlay ? '' : 'opacity-60'].join(' ')}>
                          <span className="truncate text-[9px] leading-[1.6] sm:text-[10px]">{track.title}</span>
                          <span className={['truncate text-[19px] leading-none', muteText].join(' ')}>{track.artist}</span>
                        </span>
                        <span className={['shrink-0 font-pixel text-[8px] tabular-nums', muteText].join(' ')}>{durationLabel(track)}</span>
                      </button>
                      <div className="flex items-center gap-1.5 px-2 pb-2 pl-[3.75rem]">
                        <a href={track.spotifyUrl} target="_blank" rel="noopener noreferrer" aria-label={`${track.title} on Spotify`} className={LINK_PILL}>
                          [&nbsp;Spotify&nbsp;]
                        </a>
                        <a href={track.geniusUrl} target="_blank" rel="noopener noreferrer" aria-label={`${track.title} lyrics on Genius`} className={LINK_PILL}>
                          [&nbsp;Genius&nbsp;]
                        </a>
                        <a href={track.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label={`${track.title} on YouTube`} className={LINK_PILL}>
                          [&nbsp;YT&nbsp;]
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {/* Persistent player bar (always docked) */}
      <footer className="shrink-0 border-t border-[#1e1f22] bg-[#2b2d31] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-8 lg:px-12">
        <div className="grid items-center gap-x-6 gap-y-2 md:grid-cols-[minmax(0,1fr)_minmax(320px,1.6fr)_minmax(0,1fr)]">
          {/* Left: mini thumbnail, title, artist */}
          <div className="flex min-w-0 items-center gap-3">
            <img src={featured.coverUrl} alt="" className="h-12 w-12 shrink-0 rounded-sm bg-[#1e1f22] object-cover sm:h-14 sm:w-14" />
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate text-[9px] leading-[1.6] sm:text-[10px]" aria-live="polite">
                {featured.title}
              </span>
              {currentError ? (
                <span className="truncate text-[18px] leading-none text-[#faa61a]">{currentError}</span>
              ) : (
                <span className="truncate text-[20px] leading-none text-[#949ba4]">{featured.artist}</span>
              )}
            </div>
          </div>

          {/* Center: transport + seek */}
          <div className="flex min-w-0 flex-col items-center gap-0.5">
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <button type="button" onClick={() => setShuffle((value) => !value)} aria-pressed={shuffle} aria-label="Shuffle" className={`${ctrl} ${shuffle ? '!text-[#5865f2]' : ''}`}>
                <Shuffle size={16} strokeWidth={2.5} aria-hidden="true" />
              </button>
              <button type="button" onClick={previous} disabled={!current} aria-label="Previous track" className={ctrl}>
                <SkipBack size={18} fill="currentColor" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                disabled={!!currentError || (!current && queue.length === 0)}
                aria-label={playing ? 'Pause' : 'Play'}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f2f3f5] text-[#1e1f22] outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#5865f2] disabled:opacity-40 disabled:hover:scale-100"
              >
                {playing ? <Pause size={18} fill="currentColor" aria-hidden="true" /> : <Play size={18} fill="currentColor" aria-hidden="true" className="translate-x-px" />}
              </button>
              <button type="button" onClick={() => advance(true)} disabled={queue.length === 0} aria-label="Next track" className={ctrl}>
                <SkipForward size={18} fill="currentColor" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setRepeat((mode) => (mode === 'off' ? 'all' : mode === 'all' ? 'one' : 'off'))}
                aria-label={`Repeat: ${repeat}`}
                aria-pressed={repeat !== 'off'}
                className={`${ctrl} ${repeat !== 'off' ? '!text-[#5865f2]' : ''}`}
              >
                <RepeatIcon size={16} strokeWidth={2.5} aria-hidden="true" />
              </button>
            </div>

            <div className="flex w-full items-center gap-3">
              <input
                type="range"
                className="player-range"
                min={0}
                max={seekMax}
                step={1}
                value={Math.min(Math.floor(position), seekMax)}
                disabled={!current || shownDuration <= 0}
                aria-label="Seek"
                aria-valuetext={`${formatTime(position)} of ${formatTime(shownDuration)}`}
                style={{ '--fill': `${seekFill}%` } as CSSProperties}
                onPointerDown={() => {
                  scrubbing.current = true;
                }}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setPosition(value);
                  if (!scrubbing.current) commitSeek(value); // keyboard
                }}
                onPointerUp={(event) => commitSeek(Number((event.target as HTMLInputElement).value))}
                onPointerCancel={() => {
                  scrubbing.current = false;
                }}
              />
              <span className="shrink-0 whitespace-nowrap text-right font-pixel text-[8px] tabular-nums text-[#949ba4]">
                {formatTime(position)} / {formatTime(shownDuration)}
              </span>
            </div>
          </div>

          {/* Right: volume + external links */}
          <div className="hidden min-w-0 items-center justify-end gap-4 md:flex">
            <div className="flex w-28 shrink-0 items-center gap-2 xl:w-40">
              <button
                type="button"
                onClick={() => setMuted((value) => !value)}
                aria-pressed={effectiveVolume === 0}
                aria-label={effectiveVolume === 0 ? 'Unmute' : 'Mute'}
                className={ctrl}
              >
                <VolumeIcon size={18} strokeWidth={2.5} aria-hidden="true" />
              </button>
              <input
                type="range"
                className="player-range"
                min={0}
                max={100}
                step={1}
                value={effectiveVolume}
                aria-label="Player volume"
                aria-valuetext={`${effectiveVolume}%`}
                style={{ '--fill': `${effectiveVolume}%` } as CSSProperties}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setVolume(value);
                  setMuted(value === 0);
                }}
              />
            </div>
            <div className="hidden flex-wrap items-center justify-end gap-2 lg:flex">
              <a href={featured.spotifyUrl} target="_blank" rel="noopener noreferrer" className={LINK_PILL}>
                Spotify
              </a>
              <a href={featured.geniusUrl} target="_blank" rel="noopener noreferrer" className={LINK_PILL}>
                Genius
              </a>
              <a href={featured.youtubeUrl} target="_blank" rel="noopener noreferrer" className={LINK_PILL}>
                YouTube
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>,
    document.body,
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ExternalLink, Search, X } from 'lucide-react';
import RetroOverlay from '@/components/RetroOverlay';
import { games, type GameItem, type GamePlatform } from '@/siteData';

// Turns the free-form `status` in siteData into a badge label.
//   '100%'            -> [ 100% COMPLETED ]
//   '40%'             -> [ 40% PROGRESS ]
//   'forever playing' -> [ FOREVER PLAYING ]
//   'mastered'        -> [ MASTERED ]
function badgeFor(status: string) {
  const text = status.trim();
  const percent = /^(\d{1,3})\s*%$/.exec(text);
  if (percent) {
    const value = Math.min(100, Number(percent[1]));
    return value === 100 ? '100% COMPLETED' : `${value}% PROGRESS`;
  }
  return text.toUpperCase();
}

type PlatformFilter = 'all' | GamePlatform;
type StatusFilter = 'all' | 'completed' | 'progress' | 'playing';
type SortKey = 'title-asc' | 'title-desc' | 'progress-desc' | 'progress-asc';

const PLATFORM_FILTERS: { label: string; value: PlatformFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'PC', value: 'PC' },
  { label: 'Mobile', value: 'MOBILE' },
  { label: 'PC & Mobile', value: 'PC & MOBILE' },
];

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'Any status', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'In progress', value: 'progress' },
  { label: 'Playing', value: 'playing' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'title-asc', label: 'Alphabetical (A - Z)' },
  { value: 'title-desc', label: 'Alphabetical (Z - A)' },
  { value: 'progress-desc', label: 'Progress (Highest first)' },
  { value: 'progress-asc', label: 'Progress (Lowest first)' },
];

// Percent complete, or null for open-ended statuses such as "forever playing".
function progressOf(status: string): number | null {
  const percent = /^(\d{1,3})\s*%$/.exec(status.trim());
  if (percent) return Math.min(100, Number(percent[1]));
  return /master/i.test(status) ? 100 : null;
}

function statusOf(status: string): Exclude<StatusFilter, 'all'> {
  const value = progressOf(status);
  if (value === 100) return 'completed';
  if (value !== null) return 'progress';
  return 'playing';
}

const byTitle = (a: GameItem, b: GameItem) =>
  a.title.localeCompare(b.title, undefined, { sensitivity: 'base', numeric: true });

// Games without a percentage (e.g. "forever playing") always sort to the end.
const byProgress = (dir: 1 | -1) => (a: GameItem, b: GameItem) => {
  const pa = progressOf(a.status);
  const pb = progressOf(b.status);
  if (pa === null && pb === null) return byTitle(a, b);
  if (pa === null) return 1;
  if (pb === null) return -1;
  return (pa - pb) * dir || byTitle(a, b);
};

const COMPARATORS: Record<SortKey, (a: GameItem, b: GameItem) => number> = {
  'title-asc': byTitle,
  'title-desc': (a, b) => byTitle(b, a),
  'progress-desc': byProgress(-1),
  'progress-asc': byProgress(1),
};

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

// Launcher-style library: a grid of game art; clicking one slides a detail panel
// in from the left (poster, title, status badge and your review).
export default function GamesView({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<GameItem | null>(null);
  // Keeps the last game mounted while the panel slides out.
  const [shown, setShown] = useState<GameItem | null>(null);
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState<PlatformFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('title-asc');
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" jumps to the search box, like the media library.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || document.activeElement === searchRef.current) return;
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT') return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const searched = useMemo(() => {
    const needle = normalize(query.trim());
    return needle ? games.filter((g) => normalize(g.title).includes(needle)) : games;
  }, [query]);

  // Each filter group shows the counts it would give with the other group applied.
  const platformCounts = useMemo(() => {
    const pool = status === 'all' ? searched : searched.filter((g) => statusOf(g.status) === status);
    const result: Record<string, number> = { all: pool.length };
    for (const g of pool) result[g.platform] = (result[g.platform] ?? 0) + 1;
    return result;
  }, [searched, status]);

  const statusCounts = useMemo(() => {
    const pool = platform === 'all' ? searched : searched.filter((g) => g.platform === platform);
    const result: Record<string, number> = { all: pool.length };
    for (const g of pool) {
      const key = statusOf(g.status);
      result[key] = (result[key] ?? 0) + 1;
    }
    return result;
  }, [searched, platform]);

  const visible = useMemo(() => {
    const filtered = searched.filter(
      (g) => (platform === 'all' || g.platform === platform) && (status === 'all' || statusOf(g.status) === status),
    );
    return [...filtered].sort(COMPARATORS[sort]);
  }, [searched, platform, status, sort]);

  const resetAll = () => {
    setQuery('');
    setPlatform('all');
    setStatus('all');
    searchRef.current?.focus();
  };

  const select = (game: GameItem) => {
    if (selected === game) {
      setSelected(null);
      return;
    }
    setSelected(game);
    setShown(game);
  };

  const pill = (active: boolean) =>
    [
      'flex shrink-0 items-center gap-2 border-2 px-3 py-2.5 font-pixel text-[9px] uppercase transition-colors duration-150',
      active
        ? 'border-transparent bg-[#CC97A3] text-[#1e1e1e]'
        : 'border-[#3c3c3c] bg-[#1e1e1e] text-[#d4d4d4] hover:border-[#CC97A3] hover:text-[#CC97A3]',
    ].join(' ');

  const toolbar = (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        <label className="relative flex min-w-0 flex-1 items-center border-2 border-[#3c3c3c] bg-[#1e1e1e] focus-within:border-[#CC97A3]">
          <span className="sr-only">Search titles</span>
          <Search size={18} strokeWidth={3} aria-hidden="true" className="pointer-events-none absolute left-3 text-[#8a8a8a]" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search titles..."
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            className="h-12 w-full bg-transparent pl-10 pr-10 font-body text-[24px] leading-none text-[#d4d4d4] outline-none placeholder:text-[#8a8a8a] [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                searchRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-2 flex h-8 w-8 items-center justify-center text-[#8a8a8a] hover:bg-[#333333] hover:text-[#d4d4d4]"
            >
              <X size={16} strokeWidth={3} aria-hidden="true" />
            </button>
          )}
        </label>

        <label className="relative flex shrink-0 items-center border-2 border-[#3c3c3c] bg-[#1e1e1e] hover:bg-[#333333] focus-within:border-[#CC97A3] lg:w-[300px]">
          <span className="sr-only">Sort by</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="h-12 w-full cursor-pointer appearance-none bg-transparent pl-3 pr-10 font-body text-[22px] leading-none text-[#d4d4d4] outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#1e1e1e] text-[#d4d4d4]">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={18} strokeWidth={3} aria-hidden="true" className="pointer-events-none absolute right-3 text-[#8a8a8a]" />
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
        <div role="group" aria-label="Filter by platform" className="-mx-1 flex flex-nowrap gap-2.5 overflow-x-auto px-1 py-1 sm:flex-wrap sm:overflow-visible">
          {PLATFORM_FILTERS.map((option) => (
            <button key={option.value} type="button" aria-pressed={option.value === platform} onClick={() => setPlatform(option.value)} className={pill(option.value === platform)}>
              {option.label}
              <span className={option.value === platform ? 'text-[#1e1e1e]/70' : 'text-[#8a8a8a]'}>{platformCounts[option.value] ?? 0}</span>
            </button>
          ))}
        </div>
        <span aria-hidden="true" className="hidden h-8 w-0.5 bg-[#7d5560] sm:block" />
        <div role="group" aria-label="Filter by status" className="-mx-1 flex flex-nowrap gap-2.5 overflow-x-auto px-1 py-1 sm:flex-wrap sm:overflow-visible">
          {STATUS_FILTERS.map((option) => (
            <button key={option.value} type="button" aria-pressed={option.value === status} onClick={() => setStatus(option.value)} className={pill(option.value === status)}>
              {option.label}
              <span className={option.value === status ? 'text-[#1e1e1e]/70' : 'text-[#8a8a8a]'}>{statusCounts[option.value] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <RetroOverlay
      label="Game library"
      meta={`${visible.length} / ${games.length} games`}
      onClose={onClose}
      toolbar={toolbar}
      sideOpen={selected !== null}
      side={shown && <GameDetail game={shown} onDismiss={() => setSelected(null)} />}
    >
      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-16 text-center">
          <p className="font-pixel text-[11px] uppercase leading-[1.8] text-[#d4d4d4]">No results</p>
          <p className="text-[#8a8a8a]">
            {query.trim() ? `Nothing matches "${query.trim()}"` : 'Nothing here yet'}
            {platform !== 'all' || status !== 'all' ? ' with these filters.' : '.'}
          </p>
          <button type="button" onClick={resetAll} className="r-btn">
            Reset search &amp; filters
          </button>
        </div>
      ) : (
        <ul className="grid w-full gap-6 pb-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr))] lg:gap-8">
          {visible.map((game) => {
            const active = game === selected;
            return (
              <li key={game.title} className="flex">
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => select(game)}
                  className={[
                    'r-box r-box-hover group flex w-full flex-col gap-3 p-2 text-left',
                    active ? 'r-box-active !border-[#CC97A3] shadow-[4px_4px_0_0_#7d5560]' : '',
                  ].join(' ')}
                >
                  <img
                    src={game.cover}
                    alt={`${game.title} cover`}
                    loading="lazy"
                    className="aspect-[3/4] w-full bg-[#1e1e1e] object-cover"
                  />
                  <div className="flex flex-col items-start gap-2 px-1 pb-1">
                    <span className="r-tag">[ {badgeFor(game.status)} ]</span>
                    <h3 className="text-[11px] leading-[1.6] text-[#d4d4d4]">{game.title}</h3>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </RetroOverlay>
  );
}

function GameDetail({ game, onDismiss }: { game: GameItem; onDismiss: () => void }) {
  return (
    <div className="flex min-h-full flex-col gap-5 p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="font-pixel text-[8px] uppercase text-[#8a8a8a]">// game_info</span>
        <button type="button" onClick={onDismiss} aria-label="Close details" className="r-btn !p-2">
          <X size={14} strokeWidth={3} aria-hidden="true" />
        </button>
      </div>

      <img
        src={game.cover}
        alt={`${game.title} poster`}
        className="aspect-[3/4] w-full border-2 border-[#CC97A3] bg-[#252526] object-cover shadow-[6px_6px_0_0_#7d5560]"
      />

      <div className="flex flex-col gap-3">
        <h3 className="r-glow text-[14px] leading-[1.5] text-[#CC97A3]">{game.title}</h3>
        <div className="flex flex-wrap gap-2">
          <span className="r-tag">[ {badgeFor(game.status)} ]</span>
          <span className="r-tag">{game.platform}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t-2 border-dashed border-[#7d5560] pt-4">
        <span className="font-pixel text-[8px] uppercase text-[#8a8a8a]">// review</span>
        <p className="text-[24px] leading-[1.3] text-[#d4d4d4]">&gt; {game.note}</p>
      </div>

      {game.link && (
        <a href={game.link} target="_blank" rel="noopener noreferrer" className="r-btn mt-auto !text-[9px]">
          {game.linkLabel ?? 'Store page'}
          <ExternalLink size={13} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

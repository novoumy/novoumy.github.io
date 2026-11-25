import { useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Headphones, Search, X, Youtube } from '@/components/PixelUiIcons';
import RetroOverlay from '@/components/RetroOverlay';
import type { TrackItem } from '@/siteData';
import { tracks } from '@/data/music';

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

// Music folder: spinning vinyl records with album art and live search.
export default function MusicView({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const id = requestAnimationFrame(() => searchRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || document.activeElement === searchRef.current) return;
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT') return;
      event.preventDefault();
      requestAnimationFrame(() => searchRef.current?.focus());
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const visible = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return tracks;
    return tracks.filter((track) =>
      [track.title, track.artist, track.album ?? ''].some((value) => normalize(value).includes(needle)),
    );
  }, [query]);

  useEffect(() => {
    bodyRef.current?.closest<HTMLElement>('.pixel-scroll')?.scrollTo({ top: 0 });
  }, [query]);

  const toolbar = (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        <label className="relative flex min-w-0 flex-1 items-center border-2 border-wine bg-r-bg focus-within:shadow-[4px_4px_0_0_var(--rose)]">
          <span className="sr-only">Search tracks</span>
          <Search size={18} strokeWidth={3} aria-hidden="true" className="pointer-events-none absolute left-3 text-r-dim" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tracks..."
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            className="h-12 w-full bg-transparent pl-10 pr-10 font-body text-[24px] leading-none text-r-text outline-none placeholder:text-r-dim [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                searchRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-2 flex h-8 w-8 items-center justify-center text-r-dim hover:bg-r-raised hover:text-r-text"
            >
              <X size={16} strokeWidth={3} aria-hidden="true" />
            </button>
          )}
        </label>
      </div>
    </div>
  );

  return (
    <RetroOverlay label="Music library" meta={`${visible.length} / ${tracks.length} records`} onClose={onClose} accent="music" toolbar={toolbar}>
      <div ref={bodyRef}>
        <aside className="pixel-tile mb-10 bg-r-bg">
          <h3 className="bg-wine px-3 py-2.5 text-[9px] uppercase leading-none text-cool-white sm:text-[10px]">&gt; record_crate</h3>
          <p className="px-3 py-3 text-[21px] leading-[1.3] text-r-text sm:px-4 sm:text-[22px]">
            all the songs I like are here.. enjoy! ^^
          </p>
        </aside>

        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-5 border-2 border-dashed border-rose px-5 py-16 text-center">
            <p className="font-pixel text-[11px] uppercase leading-[1.8] text-r-text">No results</p>
            <p className="text-r-dim">{query.trim() ? `Nothing matches "${query.trim()}".` : 'Nothing here yet.'}</p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                searchRef.current?.focus();
              }}
              className="r-btn"
            >
              Reset search
            </button>
          </div>
        ) : (
          <ul className="grid gap-x-8 gap-y-10 pb-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,460px),1fr))] max-sm:gap-y-8">
            {visible.map((track) => (
              <VinylCard key={track.id} track={track} />
            ))}
          </ul>
        )}
      </div>
    </RetroOverlay>
  );
}

function VinylCard({ track }: { track: TrackItem }) {
  const links = [
    { href: track.spotifyUrl, label: 'Spotify', aria: `${track.title} on Spotify`, Icon: Headphones },
    { href: track.geniusUrl, label: 'Genius', aria: `${track.title} lyrics on Genius`, Icon: FileText },
    { href: track.youtubeUrl, label: 'YouTube', aria: `${track.title} on YouTube`, Icon: Youtube },
  ];

  return (
    <li className="r-box grid gap-4 p-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-x-6 sm:gap-y-4 sm:p-5">
      <div className="vinyl-scene mx-auto sm:mx-0" aria-hidden="true">
        <div className="vinyl-record" />
        <img src={track.coverUrl} alt="" loading="lazy" decoding="async" className="vinyl-cover" />
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <h3 className="break-words text-[11px] leading-[1.6] text-r-text sm:text-[12px]">{track.title}</h3>
        <p className="truncate text-[24px] leading-none text-r-text sm:text-[26px]">{track.artist}</p>
        {track.album && <p className="truncate text-[19px] leading-none text-r-dim">{track.album}</p>}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:col-span-2 sm:gap-3">
        {links.map(({ href, label, aria, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={aria}
            className="r-link min-w-0 !px-2 !text-[7px] sm:!px-3 sm:!text-[8px]"
          >
            <Icon size={13} strokeWidth={2.5} aria-hidden="true" className="shrink-0 max-sm:hidden" />
            <span className="truncate">{label}</span>
          </a>
        ))}
      </div>
    </li>
  );
}

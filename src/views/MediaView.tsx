import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, SlidersHorizontal, X } from '@/components/PixelUiIcons';
import RetroSelect from '@/components/RetroSelect';
import RetroOverlay from '@/components/RetroOverlay';
import type { MediaItem } from '@/siteData';
import { media, mediaFilters } from '@/data/media';

type Filter = (typeof mediaFilters)[number]['value'];
type SortKey = 'title-asc' | 'title-desc' | 'year-desc' | 'year-asc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'title-asc', label: 'Alphabetical (A - Z)' },
  { value: 'title-desc', label: 'Alphabetical (Z - A)' },
  { value: 'year-desc', label: 'Year (Newest first)' },
  { value: 'year-asc', label: 'Year (Oldest first)' },
];

const byTitle = (a: MediaItem, b: MediaItem) =>
  a.title.localeCompare(b.title, undefined, { sensitivity: 'base', numeric: true });

const COMPARATORS: Record<SortKey, (a: MediaItem, b: MediaItem) => number> = {
  'title-asc': byTitle,
  'title-desc': (a, b) => byTitle(b, a),
  'year-desc': (a, b) => b.year - a.year || byTitle(a, b),
  'year-asc': (a, b) => a.year - b.year || byTitle(a, b),
};

// Lowercase and strip accents so "pokemon" finds "Pokémon".
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

interface MediaViewerProps {
  onClose: () => void;
}

// Full-screen media library. Rendered through a portal into <body> so it covers
// the whole viewport (the retro window is scaled with CSS zoom, which would
// otherwise shrink or offset a fixed overlay).
export default function MediaView({ onClose }: MediaViewerProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<SortKey>('title-asc');
  // Phones only: search + filters are tucked behind a toggle (desktop always shows them).
  const [filtersOpen, setFiltersOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Focus the search box on desktop (phones would pop the keyboard). Runs after the
  // window has taken focus itself, so it wins.
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const id = requestAnimationFrame(() => searchRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(id);
  }, []);

  // "/" jumps to search (Escape and focus trapping are handled by the window).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || document.activeElement === searchRef.current) return;
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT') return;
      event.preventDefault();
      setFiltersOpen(true);
      requestAnimationFrame(() => searchRef.current?.focus());
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Items matching the search text (before the category filter, so the filter
  // buttons can show how many results each category would give).
  const searched = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return media;
    return media.filter((item) => normalize(item.title).includes(needle));
  }, [query]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: searched.length };
    for (const item of searched) result[item.category] = (result[item.category] ?? 0) + 1;
    return result;
  }, [searched]);

  const visible = useMemo(() => {
    const filtered = filter === 'all' ? searched : searched.filter((item) => item.category === filter);
    return [...filtered].sort(COMPARATORS[sort]);
  }, [searched, filter, sort]);

  // Any change to what's shown starts the grid from the top again.
  useEffect(() => {
    bodyRef.current?.closest<HTMLElement>('.pixel-scroll')?.scrollTo({ top: 0 });
  }, [query, filter, sort]);

  const activeCount = (query.trim() ? 1 : 0) + (filter !== 'all' ? 1 : 0) + (sort !== 'title-asc' ? 1 : 0);

  const resetAll = () => {
    setQuery('');
    setFilter('all');
    searchRef.current?.focus();
  };

  const toolbar = (
    <div className="flex w-full flex-col gap-4">
      <button
        type="button"
        onClick={() => setFiltersOpen((open) => !open)}
        aria-expanded={filtersOpen}
        aria-controls="media-filters"
        className="r-btn w-full !justify-between sm:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={14} strokeWidth={3} aria-hidden="true" />
          Search &amp; filters
          {activeCount > 0 && <span className="r-tag !px-1.5 !py-1">{activeCount}</span>}
        </span>
        <span className="flex items-center gap-2 text-r-dim">
          {visible.length}/{media.length}
          <ChevronDown
            size={14}
            strokeWidth={3}
            aria-hidden="true"
            className={filtersOpen ? 'rotate-180' : ''}
          />
        </span>
      </button>

      <div id="media-filters" className={['flex flex-col gap-4', filtersOpen ? '' : 'max-sm:hidden'].join(' ')}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        <label className="relative flex min-w-0 flex-1 items-center border-2 border-wine bg-r-bg focus-within:shadow-[4px_4px_0_0_var(--rose)]">
          <span className="sr-only">Search titles</span>
          <Search size={18} strokeWidth={3} aria-hidden="true" className="pointer-events-none absolute left-3 text-r-dim" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search titles..."
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
              className="absolute right-2 flex h-8 w-8 items-center justify-center  text-r-dim hover:bg-r-raised hover:text-r-text"
            >
              <X size={16} strokeWidth={3} aria-hidden="true" />
            </button>
          )}
        </label>

        <RetroSelect label="Sort by" value={sort} options={SORT_OPTIONS} onChange={setSort} className="lg:w-[300px]" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Filter by category"
          className="-mx-1 flex flex-nowrap gap-2.5 overflow-x-auto px-1 py-1 sm:flex-wrap sm:overflow-visible"
        >
          {mediaFilters.map((option) => {
            const active = option.value === filter;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(option.value)}
                className={[
                  'flex shrink-0 items-center gap-2 border-2 px-3 py-2.5 font-pixel text-[9px] uppercase transition-colors duration-150',
                  active
                    ? 'border-wine bg-wine text-cool-white'
                    : 'border-rose bg-r-bg text-r-text hover:bg-rose hover:text-wine',
                ].join(' ')}
              >
                {option.label}
                <span className={active ? 'text-cool-white/70' : 'text-r-dim'}>{counts[option.value] ?? 0}</span>
              </button>
            );
          })}
        </div>
        <span className="shrink-0 font-pixel text-[8px] uppercase text-r-dim sm:hidden" aria-live="polite">
          {visible.length}/{media.length}
        </span>
      </div>
      </div>
    </div>
  );

  return (
    <RetroOverlay label="Media library" meta={`${visible.length} / ${media.length} titles`} onClose={onClose} toolbar={toolbar} accent="media">
      <div ref={bodyRef} className="w-full">
        {/* Intro card, same style as the boxes on the main page */}
        <aside className="pixel-tile mb-8 bg-r-bg lg:mb-10">
          <h3 className="bg-wine px-3 py-2.5 text-[9px] uppercase leading-none text-cool-white sm:text-[10px]">&gt; media_archive</h3>
          <div className="flex min-w-0 flex-col gap-1 px-3 py-3 sm:px-4">
            <p className="text-[21px] leading-[1.3] text-r-text sm:text-[22px]">
              Everything I&apos;ve watched, read, and binged—all in one place.
            </p>
            <p className="text-[18px] leading-[1.3] text-r-dim sm:text-[19px]">
              Note: This is a personal catalog and retrospective log, not a streaming site.
            </p>
          </div>
        </aside>

            {visible.length === 0 ? (
              <div className="flex flex-col items-center gap-5 border-2 border-dashed border-rose px-5 py-16 text-center">
                <p className="font-pixel text-[11px] uppercase leading-[1.8] text-r-text">No results</p>
                <p className="text-r-dim">
                  {query.trim() ? `Nothing matches "${query.trim()}"` : 'Nothing here yet'}
                  {filter !== 'all' ? ' in this category.' : '.'}
                </p>
                <button
                  type="button"
                  onClick={resetAll}
                  className="r-btn"
                >
                  Reset search &amp; filters
                </button>
              </div>
            ) : (
          <ul className="grid gap-x-5 gap-y-7 pb-4 [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))] sm:gap-x-6 sm:gap-y-8 sm:[grid-template-columns:repeat(auto-fill,minmax(180px,1fr))] lg:gap-x-8 lg:gap-y-10 lg:[grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] min-[1600px]:[grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
            {visible.map((item) => (
              <li key={`${item.category}-${item.title}-${item.year}`}>
                <MediaCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </RetroOverlay>
  );
}

// The whole card is a link: clicking opens the external page in a new tab.
function MediaCard({ item }: { item: MediaItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${item.title} (${item.year}), opens in a new tab`}
      className="group r-box r-box-hover flex h-full w-full flex-col gap-3 p-2.5 text-left outline-none sm:p-3 lg:gap-4 lg:p-4"
    >
      <div className="relative">
        <img
          src={item.poster}
          alt={`${item.title} poster`}
          loading="lazy"
          decoding="async"
          className="aspect-[2/3] w-full border-2 border-wine bg-r-panel object-cover"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="r-tag">{item.category}</span>
        <span className="r-tag">{item.year}</span>
      </div>
      <h3 className="text-[9px] leading-[1.6] text-r-text sm:text-[10px] lg:text-[13px]">{item.title}</h3>
    </a>
  );
}

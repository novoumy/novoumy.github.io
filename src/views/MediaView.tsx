import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';
import PixelBadge from '@/components/PixelBadge';
import { media, mediaFilters, type MediaItem } from '@/siteData';

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

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])';

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

  const dialogRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);

  // Lock page scroll, focus the search box (desktop only, so phones don't pop
  // the keyboard), and hand focus back to whatever opened the viewer.
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

  // Escape closes, "/" jumps to search, Tab stays inside the dialog.
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
    gridScrollRef.current?.scrollTo({ top: 0 });
  }, [query, filter, sort]);

  const resetAll = () => {
    setQuery('');
    setFilter('all');
    searchRef.current?.focus();
  };

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Media library"
      tabIndex={-1}
      className="retro-dark animate-tab-in fixed inset-0 z-[100] flex h-dvh w-screen flex-col bg-[#1e1e1e] text-[#d4d4d4] outline-none"
    >
      {/* Title bar */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-[#7d5560] bg-[#1e1e1e] px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8 lg:px-12">
        {/* Top-left area closes the library too (arrow + title). */}
        <div onClick={onClose} className="flex min-w-0 cursor-pointer items-baseline gap-3 sm:gap-4">
          <h2 className="min-w-0 truncate text-[11px] uppercase sm:text-[14px]">
            <button
              type="button"
              aria-label="Close media library"
              className="cursor-pointer truncate border-0 bg-transparent p-0 text-left uppercase text-[#d4d4d4] outline-none [font:inherit] focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-4"
            >
              &gt; Media library
            </button>
          </h2>
          <span className="hidden shrink-0 font-pixel text-[8px] uppercase text-[#8a8a8a] sm:inline" aria-live="polite">
            {visible.length} / {media.length} titles
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close media library"
          className="r-btn"
        >
          <X size={14} strokeWidth={3} aria-hidden="true" />
          <span>Close</span>
        </button>
      </header>

      {/* Search, filters and sorting */}
      <div className="shrink-0 border-b-2 border-[#7d5560] bg-[#1e1e1e] px-4 py-4 sm:px-8 lg:px-12">
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            <label className="relative flex min-w-0 flex-1 items-center  border-2 border-[#3c3c3c] bg-[#1e1e1e] focus-within:border-[#CC97A3]">
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
                  className="absolute right-2 flex h-8 w-8 items-center justify-center  text-[#8a8a8a] hover:bg-[#333333] hover:text-[#d4d4d4]"
                >
                  <X size={16} strokeWidth={3} aria-hidden="true" />
                </button>
              )}
            </label>

            <label className="relative flex shrink-0 items-center  border-2 border-[#3c3c3c] bg-[#1e1e1e] hover:bg-[#333333] focus-within:border-[#CC97A3] lg:w-[300px]">
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
                      'flex shrink-0 items-center gap-2 border-2 border-transparent px-3 py-2.5 font-pixel text-[9px] uppercase transition-colors duration-150',
                      active
                        ? 'bg-[#CC97A3] text-[#1e1e1e]'
                        : 'border-2 border-[#3c3c3c] bg-[#1e1e1e] text-[#d4d4d4] hover:border-[#CC97A3] hover:text-[#CC97A3]',
                    ].join(' ')}
                  >
                    {option.label}
                    <span className={active ? 'text-[#1e1e1e]/70' : 'text-[#8a8a8a]'}>{counts[option.value] ?? 0}</span>
                  </button>
                );
              })}
            </div>
            <span className="shrink-0 font-pixel text-[8px] uppercase text-[#8a8a8a] sm:hidden" aria-live="polite">
              {visible.length}/{media.length}
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable area: info embed on top, then the grid */}
      <div
        ref={gridScrollRef}
        className="pixel-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#1e1e1e] px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-5 sm:px-10 lg:px-12"
      >
        <div className="w-full">
          {/* Discord-style info embed */}
          <aside className="mb-6 flex overflow-hidden border-2 border-[#3c3c3c] bg-[#252526] lg:mb-8">
            <div className="w-1 shrink-0 bg-[#CC97A3]" aria-hidden="true" />
            <div className="flex min-w-0 flex-col gap-2 px-4 py-3 sm:px-5 sm:py-4">
              <h3 className="text-[11px] font-bold uppercase leading-[1.4] text-[#d4d4d4] sm:text-[12px]">Media archive</h3>
              <p className="text-[21px] leading-[1.3] text-[#d4d4d4] sm:text-[22px]">
                Everything I&apos;ve watched, read, and binged—all in one place.
              </p>
              <p className="text-[18px] leading-[1.3] text-[#8a8a8a] sm:text-[19px]">
                Note: This is a personal catalog and retrospective log, not a streaming site.
              </p>
            </div>
          </aside>

          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-5 py-16 text-center">
              <p className="font-pixel text-[11px] uppercase leading-[1.8] text-[#d4d4d4]">No results</p>
              <p className="text-[#8a8a8a]">
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
      </div>
    </div>,
    document.body,
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
          className="aspect-[2/3] w-full  bg-[#1e1e1e] object-cover"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="r-tag">{item.category}</span>
        <span className="r-tag">{item.year}</span>
      </div>
      <h3 className="text-[9px] leading-[1.6] text-[#d4d4d4] sm:text-[10px] lg:text-[13px]">{item.title}</h3>
    </a>
  );
}

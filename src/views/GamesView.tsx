import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ChevronDown, ExternalLink, Search, SlidersHorizontal, X } from 'lucide-react';
import RetroOverlay from '@/components/RetroOverlay';
import { minecraftFrame } from '@/data/minecraftIcons';
import {
  formatDate,
  isCompleted,
  isUnplayed,
  libraryStats,
  loadLibrary,
  matchesFilter,
  type Achievement,
  type FilterKey,
  type Library,
  type LibraryGame,
} from '@/lib/steam';

type SortKey = 'played' | 'recent' | 'completion' | 'az';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'played', label: 'Most played' },
  { value: 'recent', label: 'Recently played' },
  { value: 'completion', label: 'Completion %' },
  { value: 'az', label: 'A-Z' },
];

const FILTERS: { value: FilterKey; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: '100% completed' },
  { value: 'progress', label: 'In progress' },
  { value: 'unplayed', label: 'Unplayed' },
];

const PAGE = 60; // cards / achievements rendered per "page" (keeps big libraries snappy)

const SEGMENTS = 'repeating-linear-gradient(90deg, transparent 0 6px, var(--r-bg) 6px 8px)';

const byTitle = (a: LibraryGame, b: LibraryGame) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' });

function sortGames(games: LibraryGame[], sort: SortKey): LibraryGame[] {
  const list = [...games];
  switch (sort) {
    case 'played':
      return list.sort((a, b) => b.playtimeHours - a.playtimeHours || byTitle(a, b));
    case 'recent':
      return list.sort((a, b) => b.lastPlayed - a.lastPlayed || b.playtimeHours - a.playtimeHours || byTitle(a, b));
    case 'completion':
      return list.sort((a, b) => {
        const pa = a.achievements ? a.achievements.percent : -1;
        const pb = b.achievements ? b.achievements.percent : -1;
        return pb - pa || b.playtimeHours - a.playtimeHours || byTitle(a, b);
      });
    default:
      return list.sort(byTitle);
  }
}

// ---- small building blocks ------------------------------------------------------------------

// Tries each URL in turn (Steam doesn't have every art size for every game), then a text placeholder.
function Art({ sources, alt, className = '', title }: { sources: string[]; alt: string; className?: string; title: string }) {
  const [index, setIndex] = useState(0);
  if (index >= sources.length) {
    return (
      <div className={`flex items-center justify-center bg-r-panel p-2 text-center font-pixel text-[8px] uppercase leading-[1.6] text-r-dim ${className}`}>
        {title}
      </div>
    );
  }
  return (
    <img
      src={sources[index]}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      data-fallback={index > 0}
      onError={() => setIndex((value) => value + 1)}
      className={className}
    />
  );
}

function ProgressBar({ percent, complete }: { percent: number; complete: boolean }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="h-3 w-full border-2 border-rose bg-r-bg p-[1px]"
    >
      <div
        className={`h-full ${complete ? 'bg-wine' : 'bg-rose'}`}
        style={{ width: `${percent}%`, backgroundImage: SEGMENTS }}
      />
    </div>
  );
}

function Stat({ short, label, value }: { short: string; label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 border-2 border-wine bg-r-panel px-2.5 py-2 sm:px-4 sm:py-3">
      <p className="truncate font-pixel text-[7px] uppercase text-r-dim sm:text-[8px]">
        <span className="sm:hidden">{short}</span>
        <span className="hidden sm:inline">{label}</span>
      </p>
      <p className="mt-1.5 truncate font-pixel text-[10px] text-wine sm:mt-2 sm:text-[16px]">{value}</p>
    </div>
  );
}

function progressLabel(game: LibraryGame): string {
  if (game.achievements) return `${game.achievements.unlocked}/${game.achievements.total} • ${game.achievements.percent}%`;
  if (game.manual) return 'Not tracked';
  return isUnplayed(game) ? 'Not played' : 'No achievements';
}

// ---- library grid card ----------------------------------------------------------------------
function GameCard({ game, onOpen }: { game: LibraryGame; onOpen: (key: string) => void }) {
  const ach = game.achievements;
  const complete = isCompleted(game);
  return (
    <li className="flex">
      <button
        type="button"
        data-key={game.key}
        onClick={() => onOpen(game.key)}
        aria-label={`Open ${game.title}`}
        className="r-box r-box-hover group flex w-full flex-col gap-2.5 p-2 text-left outline-none focus:outline-none focus-visible:outline-none max-sm:p-2.5"
      >
        <span className="relative block aspect-[2/3] w-full overflow-hidden border border-r-line bg-r-bg">
          <Art
            sources={game.covers}
            alt=""
            title={game.title}
            className={`h-full w-full object-cover data-[fallback=true]:object-contain ${isUnplayed(game) ? 'opacity-70' : ''}`}
          />
          <span className="r-tag absolute bottom-1.5 left-1.5 !px-1.5 !py-1 !text-[7px] sm:!text-[8px]">{game.playtimeLabel}</span>
          {complete && (
            <span className="r-tag absolute right-1.5 top-1.5 !border-wine !bg-wine !px-1.5 !py-1 !text-[7px] !text-cool-white sm:!text-[8px]">100%</span>
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col justify-between gap-2 px-0.5 pb-0.5">
          <h3 className="line-clamp-2 break-words text-[9px] leading-[1.6] text-r-text sm:text-[10px]">{game.title}</h3>
          <span className="flex flex-col gap-1.5">
            {ach ? <ProgressBar percent={ach.percent} complete={complete} /> : <span className="h-3 w-full border-2 border-dashed border-rose" aria-hidden="true" />}
            <span className={`font-pixel text-[7px] uppercase leading-[1.4] sm:text-[8px] ${complete ? 'text-wine' : 'text-r-dim'}`}>
              {progressLabel(game)}
            </span>
          </span>
        </span>
      </button>
    </li>
  );
}

// ---- details screen -------------------------------------------------------------------------
type AchFilter = 'all' | 'unlocked' | 'locked';

function AchievementItem({ item }: { item: Achievement }) {
  const description = item.description || (item.hidden && !item.unlocked ? 'Hidden achievement.' : '');
  return (
    <li
      className={[
        'flex gap-3 border-2 p-2.5',
        item.unlocked ? 'border-wine bg-r-panel' : 'border-rose bg-r-bg',
      ].join(' ')}
    >
      <Art
        sources={item.iconSources?.length ? item.iconSources : [item.unlocked ? item.iconUrl : item.iconGrayUrl || item.iconUrl].filter(Boolean)}
        alt=""
        title="?"
        className={`h-14 w-14 shrink-0 border-2 ${item.pixelIcon ? 'bg-r-bg object-contain p-1.5 [image-rendering:pixelated]' : 'object-cover'} ${item.unlocked ? 'border-wine' : 'border-rose opacity-50 grayscale'}`}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h4 className={`break-words font-pixel text-[9px] leading-[1.5] ${item.unlocked ? 'text-r-text' : 'text-r-dim'}`}>
          {item.hidden && !item.unlocked ? 'Hidden achievement' : item.name}
        </h4>
        {description && <p className={`break-words text-[19px] leading-[1.15] ${item.unlocked ? 'text-r-dim' : 'text-r-dim/70'}`}>{description}</p>}
        <p className={`mt-auto pt-1 font-pixel text-[7px] uppercase ${item.unlocked ? 'text-wine' : 'text-r-dim/70'}`}>
          {item.unlocked ? `Unlocked${item.unlockTime ? ` ${formatDate(item.unlockTime)}` : ''}` : 'Locked'}
        </p>
      </div>
    </li>
  );
}

// In-game advancement look, used for Minecraft only (styles: .mc-* in index.css).
function McAchievement({ item }: { item: Achievement }) {
  const kind = minecraftFrame(item.id);
  const description = item.description || (item.hidden && !item.unlocked ? 'Hidden advancement.' : '');
  return (
    <li className="mc-tile" data-kind={kind} data-locked={!item.unlocked}>
      <div className="mc-frame" data-kind={kind}>
        <Art sources={item.iconSources ?? []} alt="" title="?" className="mc-icon" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="mc-title">{item.hidden && !item.unlocked ? 'Hidden advancement' : item.name}</h4>
        {description && <p className="mc-desc">{description}</p>}
      </div>
    </li>
  );
}

function Achievements({ game }: { game: LibraryGame }) {
  const mc = game.title === 'Minecraft';
  const [filter, setFilter] = useState<AchFilter>('all');
  const [limit, setLimit] = useState(PAGE);
  const ach = game.achievements;

  const list = useMemo(() => {
    if (!ach) return [];
    const unlocked = ach.list.filter((item) => item.unlocked).sort((a, b) => b.unlockTime - a.unlockTime);
    const locked = ach.list.filter((item) => !item.unlocked);
    return filter === 'unlocked' ? unlocked : filter === 'locked' ? locked : [...unlocked, ...locked];
  }, [ach, filter]);

  if (!ach) {
    const message = game.manual
      ? "Achievements aren't tracked for this entry."
      : isUnplayed(game)
        ? 'Not played yet. Once it has playtime, the next Steam sync will pull its achievements.'
        : 'No achievements to show: this game has none on Steam, or its stats are private.';
    return <p className="border-2 border-dashed border-rose px-4 py-6 text-[22px] leading-tight text-r-dim">&gt; {message}</p>;
  }

  const counts: Record<AchFilter, number> = { all: ach.total, unlocked: ach.unlocked, locked: ach.total - ach.unlocked };
  const shown = list.slice(0, limit);

  return (
    <div className={`flex flex-col gap-4 ${mc ? 'mc-panel' : ''}`}>
      <div role="group" aria-label="Filter achievements" className="flex flex-wrap gap-2.5">
        {(['all', 'unlocked', 'locked'] as AchFilter[]).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => {
              setFilter(value);
              setLimit(PAGE);
            }}
            className={mc ? 'mc-btn' : pillClass(filter === value)}
          >
            {value}
            <span className={mc ? 'mc-count' : filter === value ? 'text-r-bg/70' : 'text-r-dim'}>{counts[value]}</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="border-2 border-dashed border-rose px-4 py-6 text-[22px] text-r-dim">&gt; nothing here.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {shown.map((item) => (mc ? <McAchievement key={item.id} item={item} /> : <AchievementItem key={item.id} item={item} />))}
        </ul>
      )}
      {shown.length < list.length && (
        <button type="button" onClick={() => setLimit((value) => value + PAGE)} className={`${mc ? 'mc-btn' : 'r-btn'} self-center`}>
          Show more ({list.length - shown.length})
        </button>
      )}
    </div>
  );
}

function pillClass(active: boolean) {
  return [
    'flex shrink-0 items-center gap-2 border-2 px-3 py-2.5 font-pixel text-[9px] uppercase transition-colors duration-150',
    active ? 'border-wine bg-wine text-cool-white' : 'border-rose bg-r-bg text-r-text hover:bg-rose hover:text-wine',
  ].join(' ');
}

function GameDetails({ game, onBack }: { game: LibraryGame; onBack: () => void }) {
  const ach = game.achievements;
  const complete = isCompleted(game);
  const backRef = useRef<HTMLButtonElement>(null);
  useEffect(() => backRef.current?.focus({ preventScroll: true }), []);

  return (
    <div className="flex flex-col gap-8">
      <button ref={backRef} type="button" onClick={onBack} className="r-btn self-start">
        <ArrowLeft size={14} strokeWidth={3} aria-hidden="true" />
        <span>Library</span>
      </button>

      <section aria-label={`${game.title} details`} className="relative overflow-hidden border-2 border-wine bg-r-panel">
        <Art
          sources={game.heroes}
          alt=""
          title=""
          className="absolute inset-0 h-full w-full object-cover opacity-30 data-[fallback=true]:scale-110 data-[fallback=true]:blur-sm"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-r-bg via-r-bg/85 to-r-bg/30" />

        <div className="relative flex flex-col gap-5 p-4 pt-24 sm:p-8 sm:pt-40">
          <div className="flex items-end gap-4 sm:gap-7">
            <div className="w-[104px] shrink-0 sm:w-[190px]">
              <div className="aspect-[2/3] w-full border-2 border-wine bg-r-bg shadow-[6px_6px_0_0_var(--rose)]">
                <Art sources={game.covers} alt={`${game.title} cover art`} title={game.title} className="h-full w-full object-cover data-[fallback=true]:object-contain" />
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <h2 className="r-glow break-words text-[13px] uppercase leading-[1.5] text-wine sm:text-[22px]">{game.title}</h2>
              <div className="flex flex-wrap gap-2">
                <span className="r-tag">{game.playtimeLabel}</span>
                {game.platforms?.map((platform) => (
                  <span key={platform} className="r-tag !text-r-dim">
                    {platform}
                  </span>
                ))}
                {game.lastPlayed > 0 && (
                  <span className="r-tag max-w-full !text-r-dim max-sm:!whitespace-normal max-sm:!leading-[1.5]">Last played {formatDate(game.lastPlayed)}</span>
                )}
                {complete && (
                  <span className="r-tag !border-wine !bg-wine !text-cool-white">
                    100% completed
                  </span>
                )}
              </div>
              {game.note && <p className="hidden text-[22px] leading-tight text-r-dim sm:block">&quot;{game.note}&quot;</p>}
            </div>
          </div>

          {game.note && <p className="text-[22px] leading-tight text-r-dim sm:hidden">&quot;{game.note}&quot;</p>}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-8">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3 font-pixel text-[8px] uppercase text-r-dim">
                <span>Completion</span>
                <span className={complete ? 'text-wine' : undefined}>{progressLabel(game)}</span>
              </div>
              {ach ? <ProgressBar percent={ach.percent} complete={complete} /> : <div className="h-3 w-full border-2 border-dashed border-rose" aria-hidden="true" />}
            </div>
            <a
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
              className="r-btn !px-5 !py-4"
            >
              <span>[ {game.urlLabel} ]</span>
              <ExternalLink size={14} strokeWidth={3} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section aria-label="Achievements" className="flex flex-col gap-4">
        <h3 className="r-glow text-[11px] uppercase text-wine sm:text-[13px]">
          &gt; achievements{ach ? ` // ${ach.unlocked}/${ach.total}` : ''}
        </h3>
        <Achievements key={game.key} game={game} />
      </section>
    </div>
  );
}

// ---- the view ---------------------------------------------------------------------------------
export default function GamesView({ onClose }: { onClose: () => void }) {
  const [library, setLibrary] = useState<Library | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('played');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [filtersOpen, setFiltersOpen] = useState(false); // phones only: filters collapse behind a toggle
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);

  const searchRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const savedScroll = useRef(0);

  useEffect(() => {
    let alive = true;
    void loadLibrary().then((result) => alive && setLibrary(result));
    return () => {
      alive = false;
    };
  }, []);

  const all = useMemo(() => library?.games ?? [], [library]);
  const stats = useMemo(() => libraryStats(all), [all]);
  const counts = useMemo(() => {
    const result: Record<FilterKey, number> = { all: all.length, completed: 0, progress: 0, unplayed: 0 };
    for (const game of all) {
      if (isCompleted(game)) result.completed += 1;
      else if (isUnplayed(game)) result.unplayed += 1;
      else result.progress += 1;
    }
    return result;
  }, [all]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sortGames(
      all.filter((game) => matchesFilter(game, filter) && (!needle || game.title.toLowerCase().includes(needle))),
      sort,
    );
  }, [all, query, filter, sort]);

  useEffect(() => setLimit(PAGE), [query, filter, sort]);

  // Reveal the next page of cards as the end of the grid scrolls into view.
  const hasMore = limit < visible.length;
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver((entries) => entries[0]?.isIntersecting && setLimit((value) => value + PAGE), { rootMargin: '600px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, limit]);

  const selected = selectedKey ? (all.find((game) => game.key === selectedKey) ?? null) : null;

  // Keep the scroll position when going into a game and back out again.
  const scroller = () => bodyRef.current?.closest<HTMLElement>('.pixel-scroll') ?? null;
  const open = (key: string) => {
    savedScroll.current = scroller()?.scrollTop ?? 0;
    setSelectedKey(key);
    requestAnimationFrame(() => scroller()?.scrollTo({ top: 0 }));
  };
  const back = () => {
    const key = selectedKey;
    setSelectedKey(null);
    requestAnimationFrame(() => {
      scroller()?.scrollTo({ top: savedScroll.current });
      const target = bodyRef.current?.querySelector<HTMLElement>(`[data-key="${key}"]`);
      target?.focus({ preventScroll: true });
      target?.blur();
    });
  };

  // "/" jumps to search (desktop habit shared with the media library).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.key !== '/' || selected || target?.closest('input, select, textarea')) return;
      event.preventDefault();
      setFiltersOpen(true);
      requestAnimationFrame(() => searchRef.current?.focus());
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  const activeCount = (query.trim() ? 1 : 0) + (filter !== 'all' ? 1 : 0) + (sort !== 'played' ? 1 : 0);

  const statTiles = (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-4 lg:max-w-3xl">
      <Stat short="Games" label="Total games" value={stats.count.toLocaleString('en-US')} />
      <Stat
        short="Hours"
        label="Total playtime"
        value={
          <>
            {Math.round(stats.hours).toLocaleString('en-US')}
            {stats.approximate ? '+' : ''}
            <span className="hidden sm:inline"> HRS</span>
          </>
        }
      />
      <Stat short="Trophies" label="Achievements unlocked" value={stats.total > 0 ? `${stats.unlocked.toLocaleString('en-US')}` : '0'} />
    </div>
  );

  const toolbar = (
    <div className="flex w-full flex-col gap-4">
      <div className="hidden sm:block">{statTiles}</div>

      <button
        type="button"
        onClick={() => setFiltersOpen((value) => !value)}
        aria-expanded={filtersOpen}
        aria-controls="games-filters"
        className="r-btn w-full !justify-between sm:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={14} strokeWidth={3} aria-hidden="true" />
          Search &amp; filters
          {activeCount > 0 && <span className="r-tag !px-1.5 !py-1">{activeCount}</span>}
        </span>
        <span className="flex items-center gap-2 text-r-dim">
          {visible.length}/{all.length}
          <ChevronDown size={14} strokeWidth={3} aria-hidden="true" className={filtersOpen ? 'rotate-180' : ''} />
        </span>
      </button>

      <div id="games-filters" className={['flex flex-col gap-4', filtersOpen ? '' : 'max-sm:hidden'].join(' ')}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
          <label className="relative flex min-w-0 flex-1 items-center border-2 border-wine bg-r-bg focus-within:shadow-[4px_4px_0_0_var(--rose)]">
            <span className="sr-only">Search games</span>
            <Search size={18} strokeWidth={3} aria-hidden="true" className="pointer-events-none absolute left-3 text-r-dim" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search games..."
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

          <label className="relative flex shrink-0 items-center border-2 border-wine bg-r-bg focus-within:shadow-[4px_4px_0_0_var(--rose)] hover:bg-r-raised lg:w-[300px]">
            <span className="sr-only">Sort by</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="h-12 w-full cursor-pointer appearance-none bg-transparent pl-3 pr-10 font-body text-[22px] leading-none text-r-text outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-r-bg text-r-text">
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={18} strokeWidth={3} aria-hidden="true" className="pointer-events-none absolute right-3 text-r-dim" />
          </label>
        </div>

        <div className="flex items-center gap-x-6">
          <div role="group" aria-label="Filter games" className="-mx-1 flex flex-nowrap gap-2.5 overflow-x-auto px-1 py-1 sm:flex-wrap sm:overflow-visible">
            {FILTERS.map((option) => (
              <button key={option.value} type="button" aria-pressed={filter === option.value} onClick={() => setFilter(option.value)} className={pillClass(filter === option.value)}>
                {option.label}
                <span className={filter === option.value ? 'text-r-bg/70' : 'text-r-dim'}>{counts[option.value]}</span>
              </button>
            ))}
          </div>
          <span className="ml-auto hidden shrink-0 font-pixel text-[8px] uppercase text-r-dim sm:inline" aria-live="polite">
            {visible.length}/{all.length}
          </span>
        </div>
      </div>
    </div>
  );

  const synced = library?.syncedAt ? ` • synced ${formatDate(Date.parse(library.syncedAt) / 1000)}` : '';

  return (
    <RetroOverlay
      label="Game library"
      meta={library ? `${all.length} games${synced}` : undefined}
      onClose={onClose}
      onBack={selected ? back : undefined}
      toolbar={selected ? undefined : toolbar}
      accent="games"
    >
      <div ref={bodyRef}>
        {!library ? (
          <p className="r-caret text-[24px] leading-none text-r-dim">&gt; reading library</p>
        ) : selected ? (
          <GameDetails key={selected.key} game={selected} onBack={back} />
        ) : (
          <>
            <div className="mb-6 sm:hidden">{statTiles}</div>

            {library.steamCount === 0 && (
              <p className="mb-6 border-2 border-dashed border-rose px-4 py-4 text-[21px] leading-tight text-r-dim">
                &gt; steam library not synced yet. Run the &quot;Sync Steam library&quot; action in GitHub (Actions tab) and it will fill in
                automatically.
              </p>
            )}

            {visible.length === 0 ? (
              <div className="flex flex-col items-start gap-4 border-2 border-dashed border-r-line px-5 py-8">
                <p className="text-[24px] leading-tight text-r-text">&gt; no games match that.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setFilter('all');
                  }}
                  className="r-btn"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <ul className="grid w-full grid-cols-[repeat(2,minmax(0,1fr))] gap-x-3 gap-y-5 pb-4 sm:gap-5 sm:[grid-template-columns:repeat(auto-fill,minmax(176px,1fr))] lg:gap-6">
                {visible.slice(0, limit).map((game) => (
                  <GameCard key={game.key} game={game} onOpen={open} />
                ))}
              </ul>
            )}
            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center pb-4 pt-2">
                <button type="button" onClick={() => setLimit((value) => value + PAGE)} className="r-btn">
                  Show more ({visible.length - limit})
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </RetroOverlay>
  );
}


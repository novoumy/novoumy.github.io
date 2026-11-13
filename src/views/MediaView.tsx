import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, ExternalLink, X } from 'lucide-react';
import PixelBadge from '@/components/PixelBadge';
import { media, mediaFilters, type MediaItem } from '@/siteData';

type Filter = (typeof mediaFilters)[number]['value'];

const WIDE_QUERY = '(min-width: 640px)';

function useColumnCount() {
  const [columns, setColumns] = useState(() => (window.matchMedia(WIDE_QUERY).matches ? 3 : 2));

  useEffect(() => {
    const query = window.matchMedia(WIDE_QUERY);
    const onChange = (event: MediaQueryListEvent) => setColumns(event.matches ? 3 : 2);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return columns;
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export default function MediaView() {
  const [filter, setFilter] = useState<Filter>('all');
  const [openItem, setOpenItem] = useState<MediaItem | null>(null);
  const columns = useColumnCount();

  const visible = filter === 'all' ? media : media.filter((item) => item.category === filter);
  const rows = chunk(visible, columns);

  const changeFilter = (value: Filter) => {
    setFilter(value);
    setOpenItem(null);
  };

  const toggleItem = (item: MediaItem) => {
    setOpenItem((current) => (current === item ? null : item));
  };

  return (
    <div className="flex flex-col gap-6">
      <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
        {mediaFilters.map((option) => {
          const active = option.value === filter;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => changeFilter(option.value)}
              className={[
                'pixel-tile px-3 py-2 font-pixel text-[9px] uppercase transition-colors duration-150',
                active ? 'bg-wine text-cool-white' : 'bg-cool-white text-wine hover:bg-rose',
              ].join(' ')}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p>Nothing here yet.</p>
      ) : (
        <div className="flex flex-col">
          {rows.map((row) => (
            <MediaRow
              key={row[0].title}
              row={row}
              columns={columns}
              openItem={openItem}
              onToggle={toggleItem}
              onClose={() => setOpenItem(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface MediaRowProps {
  row: MediaItem[];
  columns: number;
  openItem: MediaItem | null;
  onToggle: (item: MediaItem) => void;
  onClose: () => void;
}

function MediaRow({ row, columns, openItem, onToggle, onClose }: MediaRowProps) {
  const openInRow = row.find((item) => item === openItem) ?? null;
  // Keeps the last opened review mounted while the drawer animates closed.
  const [shown, setShown] = useState<MediaItem | null>(openInRow);

  useEffect(() => {
    if (openInRow) setShown(openInRow);
  }, [openInRow]);

  return (
    <div>
      <ul className="grid gap-5 pb-5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {row.map((item) => (
          <li key={item.title}>
            <MediaCard item={item} isOpen={item === openItem} onToggle={() => onToggle(item)} />
          </li>
        ))}
      </ul>
      <ExpandPanel open={openInRow !== null}>
        {shown && <MediaDetail item={shown} onClose={onClose} />}
      </ExpandPanel>
    </div>
  );
}

function ExpandPanel({ open, children }: { open: boolean; children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    wrapperRef.current?.toggleAttribute('inert', !open);
  }, [open]);

  const scrollOpenedIntoView = () => {
    if (open) wrapperRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  return (
    <div
      ref={wrapperRef}
      onTransitionEnd={scrollOpenedIntoView}
      className="grid transition-[grid-template-rows] duration-300 ease-out"
      style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

interface MediaCardProps {
  item: MediaItem;
  isOpen: boolean;
  onToggle: () => void;
}

function MediaCard({ item, isOpen, onToggle }: MediaCardProps) {
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={onToggle}
      className={[
        'pixel-tile pixel-tile-interactive group flex h-full w-full flex-col gap-3 p-3 text-left',
        isOpen ? 'bg-rose' : 'bg-cool-white',
      ].join(' ')}
    >
      <div className="relative">
        <img
          src={item.poster}
          alt={`${item.title} poster`}
          loading="lazy"
          className="aspect-[2/3] w-full object-cover"
        />
        <span className="absolute right-2 top-2">
          <PixelBadge>{item.category}</PixelBadge>
        </span>
      </div>
      <h3 className="text-[10px] leading-[1.6]">{item.title}</h3>
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="font-pixel text-[10px] text-wine">{item.rating}/10</span>
        <span className="flex items-center gap-1 font-pixel text-[8px] uppercase text-wine">
          Review
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </div>
    </button>
  );
}

interface MediaDetailProps {
  item: MediaItem;
  onClose: () => void;
}

function MediaDetail({ item, onClose }: MediaDetailProps) {
  return (
    <div className="pixel-tile mx-1 my-1 flex flex-col gap-4 bg-rose p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <PixelBadge>{item.category}</PixelBadge>
        <span className="font-pixel text-[10px] text-wine">{item.rating}/10</span>
      </div>
      <h3 className="text-[11px] leading-[1.6] sm:text-xs">{item.title}</h3>
      <p className="bg-cool-white p-4 leading-[1.5]">{item.review}</p>
      <div className="flex flex-wrap items-center gap-3">
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="pixel-btn px-4 py-3 text-[9px]">
          Open on {item.linkLabel}
          <ExternalLink size={14} aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={onClose}
          className="pixel-tile flex items-center gap-2 bg-cool-white px-3 py-3 font-pixel text-[9px] uppercase text-wine"
        >
          <X size={14} aria-hidden="true" />
          Close
        </button>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, ExternalLink, X } from 'lucide-react';
import PixelBadge from '@/components/PixelBadge';
import { games, type GameItem } from '@/siteData';

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

// Same grid and portrait (2:3) cover shape as the Media tab. Clicking a card
// opens a details panel under its row (only one open at a time).
export default function GamesView() {
  const [openItem, setOpenItem] = useState<GameItem | null>(null);
  const columns = useColumnCount();
  const rows = chunk(games, columns);

  const toggleItem = (item: GameItem) => {
    setOpenItem((current) => (current === item ? null : item));
  };

  return (
    <div className="flex flex-col">
      {rows.map((row) => (
        <GameRow
          key={row[0].title}
          row={row}
          columns={columns}
          openItem={openItem}
          onToggle={toggleItem}
          onClose={() => setOpenItem(null)}
        />
      ))}
    </div>
  );
}

interface GameRowProps {
  row: GameItem[];
  columns: number;
  openItem: GameItem | null;
  onToggle: (item: GameItem) => void;
  onClose: () => void;
}

function GameRow({ row, columns, openItem, onToggle, onClose }: GameRowProps) {
  const openInRow = row.find((item) => item === openItem) ?? null;
  // Keeps the last opened game mounted while the panel animates closed.
  const [shown, setShown] = useState<GameItem | null>(openInRow);

  useEffect(() => {
    if (openInRow) setShown(openInRow);
  }, [openInRow]);

  return (
    <div>
      <ul className="grid gap-5 pb-5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {row.map((item) => (
          <li key={item.title}>
            <GameCard item={item} isOpen={item === openItem} onToggle={() => onToggle(item)} />
          </li>
        ))}
      </ul>
      <ExpandPanel open={openInRow !== null}>
        {shown && <GameDetail item={shown} onClose={onClose} />}
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

interface GameCardProps {
  item: GameItem;
  isOpen: boolean;
  onToggle: () => void;
}

function GameCard({ item, isOpen, onToggle }: GameCardProps) {
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
          src={item.cover}
          alt={`${item.title} cover`}
          loading="lazy"
          className="aspect-[2/3] w-full object-cover"
        />
        <span className="absolute right-2 top-2">
          <PixelBadge>{item.status}</PixelBadge>
        </span>
      </div>
      <h3 className="text-[10px] leading-[1.6]">{item.title}</h3>
      <span className="mt-auto flex items-center justify-end gap-1 font-pixel text-[8px] uppercase text-wine">
        Details
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </span>
    </button>
  );
}

interface GameDetailProps {
  item: GameItem;
  onClose: () => void;
}

function GameDetail({ item, onClose }: GameDetailProps) {
  return (
    <div className="pixel-tile mx-1 my-1 flex flex-col gap-4 bg-rose p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <PixelBadge>{item.status}</PixelBadge>
      </div>
      <h3 className="text-[11px] leading-[1.6] sm:text-xs">{item.title}</h3>
      {item.note && <p className="bg-cool-white p-4 leading-[1.5]">{item.note}</p>}
      <div className="flex flex-wrap items-center gap-3">
        {item.link && (
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="pixel-btn px-4 py-3 text-[9px]">
            {item.linkLabel ?? 'Store'}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}
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

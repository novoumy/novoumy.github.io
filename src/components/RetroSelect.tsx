import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

export interface RetroSelectOption<T extends string> {
  value: T;
  label: string;
}

interface RetroSelectProps<T extends string> {
  value: T;
  options: RetroSelectOption<T>[];
  onChange: (value: T) => void;
  label: string; // accessible name, e.g. "Sort by"
  className?: string;
}

// Pixel glyphs (crisp, drawn on tiny grids, coloured with currentColor).
const CHEVRON = ['#.....#', '##...##', '.##.##.', '..###..', '...#...'];
const CHECK = ['......#', '.....##', '#...##.', '##.##..', '.###...', '..#....'];

function Glyph({ rows, px, className }: { rows: string[]; px: number; className?: string }) {
  const w = rows[0].length;
  const d = rows
    .flatMap((row, y) => [...row].map((c, x) => (c === '#' ? `M${x} ${y}h1v1h-1z` : '')))
    .join('');
  return (
    <svg
      viewBox={`0 0 ${w} ${rows.length}`}
      width={w * px}
      height={rows.length * px}
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d={d} />
    </svg>
  );
}

// Custom listbox that replaces the native <select>: same field size and look as the search box next to
// it, a stepped pixel-outline menu in the site's rose / wine palette, full keyboard support, and
// 48px touch rows. Click / tap outside, Escape or Tab closes it.
export default function RetroSelect<T extends string>({ value, options, onChange, label, className = '' }: RetroSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const uid = useId();
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const current = options[selectedIndex];

  const openMenu = () => {
    setActive(selectedIndex);
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };
  const choose = (index: number) => {
    onChange(options[index].value);
    close();
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  // Keep the highlighted row visible (long lists / small screens).
  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const last = options.length - 1;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        openMenu();
      }
      return;
    }
    switch (event.key) {
      case 'ArrowDown': event.preventDefault(); setActive((i) => Math.min(last, i + 1)); break;
      case 'ArrowUp': event.preventDefault(); setActive((i) => Math.max(0, i - 1)); break;
      case 'Home': event.preventDefault(); setActive(0); break;
      case 'End': event.preventDefault(); setActive(last); break;
      case 'Enter':
      case ' ': event.preventDefault(); choose(active); break;
      case 'Escape': event.preventDefault(); event.stopPropagation(); close(); break;
      case 'Tab': setOpen(false); break;
    }
  };

  return (
    <div ref={rootRef} className={['relative shrink-0', className].join(' ')} onKeyDown={onKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${uid}-list`}
        aria-label={`${label}: ${current?.label ?? ''}`}
        onClick={() => (open ? close(false) : openMenu())}
        className={[
          'flex h-12 w-full cursor-pointer items-center justify-between gap-3 border-2 border-wine pl-3 pr-3 text-left font-body text-[22px] leading-none text-r-text outline-none',
          open ? 'bg-r-raised shadow-[4px_4px_0_0_var(--rose)]' : 'bg-r-bg hover:bg-r-raised focus-visible:shadow-[4px_4px_0_0_var(--rose)]',
        ].join(' ')}
      >
        <span className="min-w-0 truncate">{current?.label}</span>
        <Glyph rows={CHEVRON} px={2} className={['shrink-0 text-wine', open ? 'rotate-180' : ''].join(' ')} />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={`${uid}-list`}
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 top-full z-40 mt-2 max-h-[60vh] overflow-y-auto border-2 border-wine bg-r-bg p-1 shadow-[4px_4px_0_0_var(--wine),0_-2px_0_0_var(--wine),0_2px_0_0_var(--wine)]"
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            const highlighted = index === active;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={selected}
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') setActive(index); }}
                onClick={() => choose(index)}
                className={[
                  'flex min-h-12 cursor-pointer select-none items-center gap-3 px-3 font-body text-[22px] leading-none',
                  selected
                    ? 'bg-wine text-cool-white'
                    : highlighted
                      ? 'bg-rose text-wine'
                      : 'text-r-text',
                ].join(' ')}
              >
                <span className="flex w-[14px] shrink-0 justify-center">
                  {selected && <Glyph rows={CHECK} px={2} />}
                </span>
                <span className="min-w-0 truncate">{option.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

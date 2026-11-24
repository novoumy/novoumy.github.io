import type { CSSProperties } from 'react';
import SpecPixelIcon from '@/components/SpecPixelIcon';
import { ArrowUpRight } from '@/components/PixelUiIcons';
import { specGroups } from '@/siteData';

// Pixel icon per part, matched on the start of the part's label (so "SSD 1" / "SSD 2" both work).
const PART_ICONS: [prefix: string, icon: string][] = [
  ['cpu', 'cpu'],
  ['cooler', 'cooler'],
  ['gpu', 'gpu'],
  ['mobo', 'mobo'],
  ['ram', 'ram'],
  ['ssd', 'ssd'],
  ['psu', 'psu'],
  ['case', 'case'],
  ['monitor', 'monitor'],
  ['keyboard', 'keyboard'],
  ['mouse', 'mouse'],
  ['mic', 'mic'],
  ['phone', 'phone'],
  ['tablet', 'tablet'],
  ['earbuds', 'earbuds'],
  ['controller', 'controller'],
];

const iconFor = (label: string): string => {
  const key = label.toLowerCase();
  return PART_ICONS.find(([prefix]) => key.startsWith(prefix))?.[1] ?? 'cpu';
};

// Retro RPG inventory: one grid of equipment slots per category.
// Every slot is a clean pixel-bordered box with an unboxed pixel icon; no filled icon tiles.
export default function SpecsView() {
  let slotIndex = 0;

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-9 pb-3 max-sm:gap-8">
      {/* Equipment categories */}
      {specGroups.map((group) => (
        <section key={group.title} className="min-w-0 w-full max-w-full">
          {/* Same divider as the Socials menu */}
          <div className="mb-5 flex items-center gap-3">
            <span aria-hidden="true" className="h-1 flex-1 bg-rose" />
            <h2 className="font-pixel text-[8px] uppercase leading-none">{group.title}</h2>
            <span aria-hidden="true" className="h-1 flex-1 bg-rose" />
          </div>

          <ul className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
            {group.parts.map((part) => {
              const i = ++slotIndex;
              return (
                <li key={part.label} className="min-w-0" style={{ ['--i' as string]: i } as CSSProperties}>
                  <a
                    href={part.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${part.name} on ${part.linkLabel}, opens in a new tab`}
                    className="spec-card pixel-tile pixel-tile-interactive group relative box-border flex h-full min-w-0 items-center gap-4 bg-pink-soft p-4 pr-9 outline-none [--card-accent:var(--cool-white)] hover:bg-rose focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-wine"
                    style={{ ['--i' as string]: i } as CSSProperties}
                  >
                    <SpecPixelIcon name={iconFor(part.label)} size={48} className="spec-icon shrink-0" />

                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="truncate font-pixel text-[8px] uppercase leading-none text-wine/70">{part.label}</span>
                      <span className="break-words text-[21px] leading-[1.05] [overflow-wrap:anywhere]">{part.name}</span>
                      {part.detail && (
                        <span className="break-words text-[18px] leading-tight opacity-70 [overflow-wrap:anywhere]">{part.detail}</span>
                      )}
                    </span>

                    <ArrowUpRight
                      size={18}
                      aria-hidden="true"
                      className="absolute right-2 top-2 opacity-60 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

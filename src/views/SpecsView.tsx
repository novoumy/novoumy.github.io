import type { CSSProperties } from 'react';
import SpecPixelIcon from '@/components/SpecPixelIcon';
import { specGroups, specHighlights } from '@/siteData';

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

// Icons for the summary stats at the top.
const HIGHLIGHT_ICONS: Record<string, string> = {
  ram: 'ram',
  vram: 'gpu',
  storage: 'ssd',
  refresh: 'monitor',
};

const pad2 = (n: number) => String(n).padStart(2, '0');

// Section heading: "> TITLE ━━━━━━━━ 04 SLOTS"
function SectionHeading({ title, note }: { title: string; note: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h2 className="min-w-0 font-pixel text-[10px] uppercase leading-snug sm:text-[11px]">
        <span className="text-lavender">&gt; </span>
        {title}
      </h2>
      <span aria-hidden="true" className="h-1 min-w-4 flex-1 bg-rose" />
      <span className="shrink-0 font-pixel text-[7px] uppercase leading-none text-lavender">{note}</span>
    </div>
  );
}

// Retro RPG inventory: a stats panel, then one grid of equipment slots per category.
// Every slot is a clean pixel-bordered box with an unboxed pixel icon; no filled icon tiles.
export default function SpecsView() {
  let slotIndex = 0;

  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-9 pb-3 max-sm:gap-8">
      {/* Player stats */}
      <section aria-label="System summary" className="min-w-0">
        <SectionHeading title="Player stats" note="Lv. 2025" />
        <ul
          className="spec-card pixel-tile grid grid-cols-2 gap-x-4 gap-y-6 bg-cool-white p-5 sm:grid-cols-4 max-sm:p-4"
          style={{ ['--i' as string]: 0 } as CSSProperties}
        >
          {specHighlights.map((stat) => (
            <li key={stat.label} className="min-w-0 border-l-4 border-rose pl-3">
              <p className="flex items-center gap-2">
                <SpecPixelIcon name={HIGHLIGHT_ICONS[stat.label.toLowerCase()] ?? 'cpu'} size={36} className="shrink-0" />
                <span className="font-pixel text-[7px] uppercase leading-none text-lavender">{stat.label}</span>
              </p>
              <p className="mt-3 flex items-baseline gap-1.5 leading-none">
                <span className="font-pixel text-[22px] sm:text-[26px]">{stat.value}</span>
                <span className="font-pixel text-[9px] uppercase text-lavender">{stat.unit}</span>
              </p>
              <p className="mt-2 text-[17px] leading-none opacity-70">{stat.sub}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Equipment categories */}
      {specGroups.map((group) => (
        <section key={group.title} className="min-w-0 w-full max-w-full">
          <SectionHeading title={group.title} note={`${pad2(group.parts.length)} slots`} />

          <ul className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
            {group.parts.map((part) => {
              const i = ++slotIndex;
              return (
                <li key={part.label} className="min-w-0" style={{ ['--i' as string]: i } as CSSProperties}>
                  <a
                    href={part.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${part.name} on ${part.linkLabel}`}
                    className="spec-card pixel-tile pixel-tile-interactive box-border flex h-full min-w-0 items-center gap-4 bg-cool-white p-4 outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-wine"
                    style={{ ['--i' as string]: i } as CSSProperties}
                  >
                    <SpecPixelIcon name={iconFor(part.label)} size={48} className="spec-icon shrink-0" />

                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="truncate font-pixel text-[8px] uppercase leading-none text-lavender">{part.label}</span>
                      <span className="break-words text-[21px] leading-[1.05] [overflow-wrap:anywhere]">{part.name}</span>
                      {part.detail && (
                        <span className="break-words text-[18px] leading-tight opacity-70 [overflow-wrap:anywhere]">{part.detail}</span>
                      )}
                      <span className="mt-0.5 font-pixel text-[7px] uppercase leading-none text-lavender">[ {part.linkLabel} ]</span>
                    </span>
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

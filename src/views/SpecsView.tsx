import type { CSSProperties } from 'react';
import {
  Box,
  CircuitBoard,
  Cpu,
  ExternalLink,
  Fan,
  HardDrive,
  Keyboard,
  MemoryStick,
  Mic,
  Monitor,
  MonitorPlay,
  Mouse,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { specGroups, specHighlights } from '@/siteData';

// Icon per part, matched on the start of the part's label (so "SSD 1" / "SSD 2" both work).
const PART_ICONS: [prefix: string, icon: LucideIcon][] = [
  ['cpu', Cpu],
  ['cooler', Fan],
  ['gpu', MonitorPlay],
  ['mobo', CircuitBoard],
  ['ram', MemoryStick],
  ['ssd', HardDrive],
  ['psu', Zap],
  ['case', Box],
  ['monitor', Monitor],
  ['keyboard', Keyboard],
  ['mouse', Mouse],
  ['mic', Mic],
];

const iconFor = (label: string): LucideIcon => {
  const key = label.toLowerCase();
  return PART_ICONS.find(([prefix]) => key.startsWith(prefix))?.[1] ?? Cpu;
};

// Icons for the summary tiles at the top.
const HIGHLIGHT_ICONS: Record<string, LucideIcon> = {
  ram: MemoryStick,
  vram: MonitorPlay,
  storage: HardDrive,
  refresh: Monitor,
};

const pad2 = (n: number) => String(n).padStart(2, '0');

export default function SpecsView() {

  let cardIndex = 0;

  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-8 pb-3 max-sm:gap-7">
      {/* System summary: one framed panel, title bar on top, 4px wine grid lines all the way round */}
      <section aria-label="System summary" className="pixel-tile spec-summary bg-cool-white">
        <div className="flex items-center justify-between bg-wine px-3 py-2 text-cool-white">
          <span className="font-pixel text-[8px] uppercase leading-none">System summary</span>
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 bg-rose" />
            <span className="h-2 w-2 bg-lavender" />
            <span className="h-2 w-2 bg-cool-white" />
          </span>
        </div>
        <ul className="grid grid-cols-2 gap-1 bg-wine sm:grid-cols-4">
          {specHighlights.map((stat, index) => {
            const Icon = HIGHLIGHT_ICONS[stat.label.toLowerCase()] ?? Cpu;
            return (
              <li
                key={stat.label}
                className="spec-card min-w-0 bg-cool-white px-3 pb-3.5 pt-3"
                style={{ ['--i' as string]: index } as CSSProperties}
              >
                <p className="flex items-center justify-between gap-2">
                  <span className="font-pixel text-[7px] uppercase leading-none text-lavender">{stat.label}</span>
                  <span className="grid h-6 w-6 shrink-0 place-items-center bg-rose text-wine">
                    <Icon size={14} strokeWidth={2.5} aria-hidden="true" />
                  </span>
                </p>
                <p className="mt-3 flex items-baseline gap-1.5 leading-none">
                  <span className="font-pixel text-[22px] sm:text-[26px]">{stat.value}</span>
                  <span className="font-pixel text-[9px] uppercase text-lavender">{stat.unit}</span>
                </p>
                <p className="mt-2 text-[17px] leading-none opacity-70">{stat.sub}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Component groups */}
      {specGroups.map((group, groupIndex) => (
        <section key={group.title} className="min-w-0 w-full max-w-full">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-7 w-9 shrink-0 place-items-center bg-wine font-pixel text-[9px] leading-none text-cool-white">
              {pad2(groupIndex + 1)}
            </span>
            <h2 className="min-w-0 font-pixel text-[10px] uppercase leading-snug sm:text-[11px]">{group.title}</h2>
            <span aria-hidden="true" className="h-1 min-w-4 flex-1 bg-rose/60" />
            <span className="shrink-0 font-pixel text-[7px] uppercase leading-none text-lavender">
              {pad2(group.parts.length)} parts
            </span>
          </div>

          <ul className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
            {group.parts.map((part) => {
              const Icon = iconFor(part.label);
              const i = cardIndex++;
              return (
                <li key={part.label} className="min-w-0" style={{ ['--i' as string]: i } as CSSProperties}>
                  <a
                    href={part.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${part.name} on ${part.linkLabel}`}
                    className="spec-card pixel-tile pixel-tile-interactive box-border flex h-full min-w-0 flex-col gap-3 bg-cool-white p-3 outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-wine"
                    style={{ ['--i' as string]: i } as CSSProperties}
                  >
                    <span className="flex items-center gap-3">
                      <span className="spec-icon grid h-10 w-10 shrink-0 place-items-center bg-rose text-wine">
                        <Icon size={20} strokeWidth={2.5} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-pixel text-[8px] uppercase leading-none text-lavender">
                        {part.label}
                      </span>
                      <span className="spec-link-mark shrink-0 grid h-5 w-5 place-items-center bg-rose/70 text-wine"><ExternalLink size={11} strokeWidth={2.5} aria-hidden="true" /></span>
                    </span>

                    <span className="min-w-0 flex-1 break-words text-[21px] leading-[1.05] [overflow-wrap:anywhere]">
                      {part.name}
                      {part.detail && (
                        <span className="mt-1.5 block break-words text-[18px] leading-tight opacity-70 [overflow-wrap:anywhere]">
                          {part.detail}
                        </span>
                      )}
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

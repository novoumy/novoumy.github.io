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
  Tablet,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { specGroups, specHighlights, specsSummary } from '@/siteData';

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
  ['pad', Tablet],
];

const iconFor = (label: string): LucideIcon => {
  const key = label.toLowerCase();
  return PART_ICONS.find(([prefix]) => key.startsWith(prefix))?.[1] ?? Cpu;
};

const pad2 = (n: number) => String(n).padStart(2, '0');

export default function SpecsView() {

  let cardIndex = 0;

  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-5 pb-3 max-sm:gap-4">
      {/* PC details */}
      <section className="pixel-tile box-border min-w-0 w-full max-w-full bg-cool-white">
        <h2 className="flex items-center justify-between gap-3 bg-wine px-3 py-2.5 text-[9px] uppercase leading-none text-cool-white max-sm:py-2 sm:text-[10px]">
          <span>&gt; PC DETAILS</span>
          <span className="shrink-0 text-rose">TINTED_LILAC</span>
        </h2>

        <dl className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-3 px-3 py-4 sm:grid-cols-2 xl:grid-cols-4">
          {specsSummary.map((row) => (
            <div key={row.label} className="min-w-0 border-2 border-wine/70 bg-cool-white px-2.5 py-2">
              <dt className="font-pixel text-[7px] uppercase leading-none text-lavender">{row.label}</dt>
              <dd className="mt-2 break-words text-[18px] leading-tight [overflow-wrap:anywhere]">{row.value}</dd>
            </div>
          ))}
        </dl>


        {/* Headline numbers */}
        <ul className="grid grid-cols-2 border-t-4 border-wine sm:grid-cols-4">
          {specHighlights.map((stat, index) => (
            <li
              key={stat.label}
              className={[
                'spec-card min-w-0 px-3 py-3.5',
                index % 2 === 1 ? 'border-l-4 border-wine' : '',
                index > 1 ? 'max-sm:border-t-4 max-sm:border-wine' : '',
                index > 0 ? 'sm:border-l-4 sm:border-wine' : '',
              ].join(' ')}
              style={{ ['--i' as string]: index } as CSSProperties}
            >
              <p className="font-pixel text-[7px] uppercase leading-none text-lavender">{stat.label}</p>
              <p className="mt-2.5 flex items-baseline gap-1.5 leading-none">
                <span className="font-pixel text-[22px] sm:text-[26px]">{stat.value}</span>
                <span className="font-pixel text-[9px] uppercase text-lavender">{stat.unit}</span>
              </p>
              <p className="mt-2 text-[17px] leading-none opacity-70">{stat.sub}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Component groups */}
      {specGroups.map((group, groupIndex) => (
        <section key={group.title} className="min-w-0 w-full max-w-full">
          <div className="mb-3 flex items-center gap-3">
            <span className="grid h-7 w-9 shrink-0 place-items-center bg-wine font-pixel text-[9px] leading-none text-cool-white">
              {pad2(groupIndex + 1)}
            </span>
            <h2 className="min-w-0 font-pixel text-[10px] uppercase leading-snug sm:text-[11px]">{group.title}</h2>
            <span aria-hidden="true" className="h-1 min-w-4 flex-1 bg-rose/60" />
            <span className="shrink-0 font-pixel text-[7px] uppercase leading-none text-lavender">
              {pad2(group.parts.length)} parts
            </span>
          </div>

          <ul className="grid min-w-0 grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
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
                    className="spec-card pixel-tile pixel-tile-interactive box-border flex h-full min-w-0 flex-col gap-2 bg-cool-white p-2.5 outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-wine"
                    style={{ ['--i' as string]: i } as CSSProperties}
                  >
                    <span className="flex items-center gap-3">
                      <span className="spec-icon grid h-8 w-8 shrink-0 place-items-center bg-rose text-wine">
                        <Icon size={20} strokeWidth={2.5} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-pixel text-[8px] uppercase leading-none text-lavender">
                        {part.label}
                      </span>
                      <span className="spec-link-mark shrink-0 grid h-5 w-5 place-items-center bg-rose/70 text-wine"><ExternalLink size={11} strokeWidth={2.5} aria-hidden="true" /></span>
                    </span>

                    <span className="min-w-0 flex-1 break-words text-[19px] leading-[1.12] [overflow-wrap:anywhere]">
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

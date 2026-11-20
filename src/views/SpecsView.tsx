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

export default function SpecsView({ frequency = 10 }: { frequency?: number }) {
  const [rig, ...rest] = specsSummary;
  const rigValue = ({ 6: 'DEEP_SEA', 8: 'MIDNIGHT_LOFI', 10: 'TINTED_LILAC', 12: 'SOLAR_GOLD', 14: 'OVERCLOCKED' } as Record<number, string>)[frequency] ?? 'TINTED_LILAC';
  const totalParts = specGroups.reduce((sum, group) => sum + group.parts.length, 0);
  let cardIndex = 0;

  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-8 pb-3 max-sm:gap-7">
      {/* Boot panel */}
      <section className="pixel-tile box-border min-w-0 w-full max-w-full bg-cool-white">
        <h2 className="flex items-center justify-between gap-3 bg-wine px-3 py-2.5 text-[9px] uppercase leading-none text-cool-white max-sm:py-2 sm:text-[10px]">
          <span>&gt; system_status</span>
          <span className="shrink-0 text-rose">{pad2(totalParts)} parts online</span>
        </h2>

        <div className="grid min-w-0 gap-x-8 gap-y-5 px-4 py-5 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] sm:items-center">
          {rig && (
            <div className="min-w-0">
              <p className="font-pixel text-[8px] uppercase leading-none text-lavender">{rig.label}</p>
              <p className="mt-3 break-words font-pixel text-[15px] uppercase leading-[1.25] sm:text-[19px] [overflow-wrap:anywhere]">
                {rig.label === 'RIG_ID' ? rigValue : rig.value}
              </p>
              <span aria-hidden="true" className="mt-4 block h-1 w-16 bg-rose" />
            </div>
          )}

          <dl className="min-w-0 text-[20px] leading-tight">
            {rest.map((row) => (
              <div key={row.label} className="flex min-w-0 items-baseline gap-2 py-0.5">
                <dt className="shrink-0 opacity-70">&gt; {row.label.toLowerCase()}</dt>
                <span aria-hidden="true" className="min-w-4 flex-1 translate-y-[-4px] border-b-4 border-dotted border-rose/70" />
                <dd className="flex min-w-0 items-center gap-2 break-words [overflow-wrap:anywhere]">
                  {row.label === 'STATUS' && (
                    <span aria-hidden="true" className="inline-block h-2.5 w-2.5 shrink-0 bg-wine animate-[blink_1s_steps(2)_infinite]" />
                  )}
                  {row.value}
                </dd>
              </div>
            ))}
            <div className="flex items-center gap-2 py-0.5 opacity-70">
              <span>&gt;</span>
              <span aria-hidden="true" className="inline-block h-4 w-2.5 bg-wine animate-[blink_1s_steps(2)_infinite]" />
            </div>
          </dl>
        </div>

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
                      <span className="shrink-0 font-pixel text-[7px] leading-none opacity-40">#{pad2(i + 1)}</span>
                    </span>

                    <span className="min-w-0 flex-1 break-words text-[21px] leading-[1.05] [overflow-wrap:anywhere]">
                      {part.name}
                      {part.detail && (
                        <span className="mt-1.5 block break-words text-[18px] leading-tight opacity-70 [overflow-wrap:anywhere]">
                          {part.detail}
                        </span>
                      )}
                    </span>

                    <span className="flex items-center justify-between gap-2 border-t-4 border-dashed border-rose/60 pt-2.5">
                      <span className="font-pixel text-[7px] uppercase leading-none opacity-50">find online</span>
                      <span className="spec-go inline-flex items-center gap-1.5 bg-rose px-2 py-1.5 font-pixel text-[7px] uppercase leading-none text-wine">
                        {part.linkLabel}
                        <ExternalLink size={9} strokeWidth={3} aria-hidden="true" />
                      </span>
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

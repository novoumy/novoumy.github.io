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

// Headline tiles get their own icon, matched on the stat label.
const STAT_ICONS: Record<string, LucideIcon> = {
  ram: MemoryStick,
  vram: MonitorPlay,
  storage: HardDrive,
  refresh: Monitor,
};

const iconFor = (label: string): LucideIcon => {
  const key = label.toLowerCase();
  return PART_ICONS.find(([prefix]) => key.startsWith(prefix))?.[1] ?? Cpu;
};

const pad2 = (n: number) => String(n).padStart(2, '0');

export default function SpecsView() {
  const [rig, ...rest] = specsSummary;
  const totalParts = specGroups.reduce((sum, group) => sum + group.parts.length, 0);
  let cardIndex = 0;

  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-9 pb-3 max-sm:gap-8">
      {/* ---------- Status window ---------- */}
      <section className="pixel-tile box-border min-w-0 w-full max-w-full bg-cool-white">
        <h2 className="flex h-9 items-center justify-between gap-3 bg-wine px-3 text-[9px] uppercase leading-none text-cool-white sm:text-[10px]">
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="block h-2 w-2 bg-rose" />
            system_status
          </span>
          <span className="shrink-0 text-rose">{pad2(totalParts)} parts online</span>
        </h2>

        <div className="grid min-w-0 gap-x-8 gap-y-5 px-5 py-6 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] sm:items-center max-sm:px-4">
          {rig && (
            <div className="flex min-w-0 items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center bg-rose text-wine max-sm:h-12 max-sm:w-12">
                <Cpu size={30} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-pixel text-[8px] uppercase leading-none text-lavender">{rig.label}</p>
                <p className="mt-3 break-words font-pixel text-[15px] uppercase leading-[1.25] sm:text-[18px] [overflow-wrap:anywhere]">
                  {rig.value}
                </p>
              </div>
            </div>
          )}

          <dl className="min-w-0 text-[20px] leading-tight">
            {rest.map((row) => (
              <div key={row.label} className="flex min-w-0 items-baseline gap-2 py-1">
                <dt className="shrink-0 opacity-70">{row.label.toLowerCase()}</dt>
                <span aria-hidden="true" className="min-w-4 flex-1 translate-y-[-4px] border-b-2 border-dotted border-rose" />
                <dd className="flex min-w-0 items-center gap-2 break-words [overflow-wrap:anywhere]">
                  {row.label === 'STATUS' && (
                    <span aria-hidden="true" className="inline-block h-2.5 w-2.5 shrink-0 bg-wine animate-[blink_1s_steps(2)_infinite]" />
                  )}
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Headline numbers */}
        <ul className="grid grid-cols-2 border-t-4 border-wine sm:grid-cols-4">
          {specHighlights.map((stat, index) => {
            const StatIcon = STAT_ICONS[stat.label.toLowerCase()] ?? Cpu;
            return (
              <li
                key={stat.label}
                className={[
                  'spec-card min-w-0 bg-rose/20 px-4 py-4',
                  index % 2 === 1 ? 'border-l-2 border-rose' : '',
                  index > 1 ? 'max-sm:border-t-2 max-sm:border-rose' : '',
                  index > 0 ? 'sm:border-l-2 sm:border-rose' : '',
                ].join(' ')}
                style={{ ['--i' as string]: index } as CSSProperties}
              >
                <p className="flex items-center justify-between gap-2 font-pixel text-[8px] uppercase leading-none text-lavender">
                  <span className="truncate">{stat.label}</span>
                  <StatIcon size={14} strokeWidth={2.5} aria-hidden="true" className="shrink-0 text-wine" />
                </p>
                <p className="mt-3 flex items-baseline gap-1.5 leading-none">
                  <span className="font-pixel text-[22px] sm:text-[26px]">{stat.value}</span>
                  <span className="font-pixel text-[9px] uppercase text-lavender">{stat.unit}</span>
                </p>
                <p className="mt-2 text-[18px] leading-none opacity-70">{stat.sub}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ---------- Component groups ---------- */}
      {specGroups.map((group, groupIndex) => (
        <section key={group.title} className="min-w-0 w-full max-w-full">
          <div className="mb-5 flex h-8 items-center gap-3">
            <span className="grid h-8 w-10 shrink-0 place-items-center bg-wine font-pixel text-[9px] leading-none text-cool-white">
              {pad2(groupIndex + 1)}
            </span>
            <h2 className="min-w-0 font-pixel text-[11px] uppercase leading-none">{group.title}</h2>
            <span aria-hidden="true" className="h-[3px] min-w-4 flex-1 bg-rose" />
            <span className="shrink-0 font-pixel text-[8px] uppercase leading-none text-lavender">
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
                    className="spec-card pixel-tile pixel-tile-interactive box-border flex h-full min-w-0 items-stretch gap-3 bg-cool-white p-3 outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-wine"
                    style={{ ['--i' as string]: i } as CSSProperties}
                  >
                    <span className="spec-icon grid h-14 w-14 shrink-0 place-items-center self-start bg-rose text-wine">
                      <Icon size={26} strokeWidth={2.5} aria-hidden="true" />
                    </span>

                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center justify-between gap-2 font-pixel text-[8px] uppercase leading-none text-lavender">
                        <span className="truncate">{part.label}</span>
                        <span className="shrink-0 opacity-50">#{pad2(i + 1)}</span>
                      </span>

                      <span className="mt-2.5 block break-words text-[22px] leading-[1.05] [overflow-wrap:anywhere]">
                        {part.name}
                      </span>
                      {part.detail && (
                        <span className="mt-1 block break-words text-[18px] leading-tight opacity-70 [overflow-wrap:anywhere]">
                          {part.detail}
                        </span>
                      )}

                      <span className="mt-auto flex justify-end pt-3">
                        <span className="spec-go inline-flex items-center gap-1.5 bg-rose px-2 py-1.5 font-pixel text-[7px] uppercase leading-none text-wine">
                          {part.linkLabel}
                          <ExternalLink size={9} strokeWidth={3} aria-hidden="true" />
                        </span>
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

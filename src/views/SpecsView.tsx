import { specGroups, specsSummary } from '@/siteData';

export default function SpecsView() {
  return (
    <div className="flex min-w-0 flex-col gap-6 pb-2 max-sm:gap-5 sm:gap-7">
      {/* System summary */}
      <section className="pixel-tile min-w-0 overflow-hidden bg-cool-white">
        <h2 className="bg-wine px-3 py-2.5 max-sm:py-2 text-[9px] uppercase leading-none text-cool-white sm:text-[10px]">
          &gt; system_status
        </h2>
        <dl className="flex min-w-0 flex-col gap-1 px-3 py-3 max-sm:py-2.5 text-[20px] leading-tight sm:flex-row sm:flex-wrap sm:gap-x-8">
          {specsSummary.map((row) => (
            <div key={row.label} className="flex min-w-0 gap-2">
              <dt className="shrink-0 opacity-70">{row.label}:</dt>
              <dd className="min-w-0 break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Component groups */}
      {specGroups.map((group) => (
        <section key={group.title} className="pixel-tile min-w-0 overflow-hidden bg-cool-white">
          <h2 className="bg-wine px-3 py-2.5 max-sm:py-2 text-[9px] uppercase leading-none text-cool-white sm:text-[10px]">
            {group.title}
          </h2>
          <ul className="min-w-0">
            {group.parts.map((part, index) => (
              <li
                key={part.label}
                className={[
                  'flex min-w-0 flex-col gap-1 px-3 py-3 max-sm:py-2.5 sm:flex-row sm:items-center sm:gap-4',
                  index > 0 ? 'border-t-4 border-rose/60' : '',
                ].join(' ')}
              >
                <span className="w-16 shrink-0 font-pixel text-[9px] uppercase leading-none text-lavender sm:w-20">
                  {part.label}
                </span>
                <span className="min-w-0 flex-1 break-words text-[20px] leading-tight">
                  {part.name}
                  {part.detail && <span className="block break-words opacity-70">{part.detail}</span>}
                </span>
                <a
                  href={part.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${part.name} on ${part.linkLabel}`}
                  className="mt-1 w-fit shrink-0 font-pixel text-[8px] uppercase leading-none hover:bg-wine hover:text-cool-white sm:mt-0 sm:whitespace-nowrap"
                >
                  [&nbsp;{part.linkLabel}&nbsp;]
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

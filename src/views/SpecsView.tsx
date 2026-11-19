import { specGroups, specsSummary } from '@/siteData';

export default function SpecsView() {
  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-6 overflow-x-hidden pb-2 max-sm:gap-5 sm:gap-7">
      {/* System summary */}
      <section className="pixel-tile box-border min-w-0 w-full max-w-full overflow-hidden bg-cool-white">
        <h2 className="bg-wine px-3 py-2.5 max-sm:py-2 text-[9px] uppercase leading-none text-cool-white sm:text-[10px]">
          &gt; system_status
        </h2>
        <dl className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-1 px-3 py-3 max-sm:py-2.5 text-[20px] leading-tight sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
          {specsSummary.map((row) => (
            <div key={row.label} className="flex min-w-0 gap-2">
              <dt className="shrink-0 opacity-70">{row.label}:</dt>
              <dd className="min-w-0 break-words [overflow-wrap:anywhere]">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Component groups */}
      {specGroups.map((group) => (
        <section key={group.title} className="pixel-tile box-border min-w-0 w-full max-w-full overflow-hidden bg-cool-white">
          <h2 className="bg-wine px-3 py-2.5 max-sm:py-2 text-[9px] uppercase leading-none text-cool-white sm:text-[10px]">
            {group.title}
          </h2>
          <ul className="min-w-0 w-full">
            {group.parts.map((part, index) => (
              <li
                key={part.label}
                className={[
                  'box-border grid min-w-0 w-full grid-cols-1 gap-x-4 gap-y-1 px-3 py-3 max-sm:py-2.5 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center',
                  index > 0 ? 'border-t-4 border-rose/60' : '',
                ].join(' ')}
              >
                <span className="shrink-0 font-pixel text-[9px] uppercase leading-none text-lavender sm:w-[4.5rem]">
                  {part.label}
                </span>
                <span className="min-w-0 break-words text-[20px] leading-tight [overflow-wrap:anywhere]">
                  {part.name}
                  {part.detail && <span className="block break-words opacity-70 [overflow-wrap:anywhere]">{part.detail}</span>}
                </span>
                <a
                  href={part.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${part.name} on ${part.linkLabel}`}
                  className="mt-1 inline-block w-fit max-w-full break-words font-pixel text-[8px] uppercase leading-none [overflow-wrap:anywhere] hover:bg-wine hover:text-cool-white sm:mt-0 sm:justify-self-end sm:text-right"
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

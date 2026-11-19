import { hero } from '@/siteData';

// Lines starting with ">" are the little terminal readout; everything else is prose.
const isBlank = (line: string) => line.replace(/\u00A0/g, '').trim() === '';
const prose = hero.bio.filter((line) => !isBlank(line) && !line.startsWith('>'));
const terminal = hero.bio.filter((line) => line.startsWith('>'));

// The base classes are the PC layout. On phones (max-[768px]) the window is a compact 4:3 card
// (see .win-section in index.css), so the same layout is scaled down with `cqw` (1cqw = 1% of the
// card's width) and font sizes are floored so they stay readable.
export default function MainView() {
  return (
    <div className="flex min-h-full flex-col gap-8 max-[768px]:gap-[1.5cqw]">
      <div className="grid grid-cols-[auto_1fr] items-start gap-x-7 gap-y-5 max-[768px]:gap-x-[3.5cqw] max-[768px]:gap-y-[1cqw]">
        <img
          src={hero.avatar}
          alt={hero.avatarAlt}
          className="pixel-frame row-span-2 aspect-square w-40 shrink-0 object-cover max-[768px]:w-[20cqw]"
        />
        <h1 className="min-w-0 break-words pt-1 text-3xl tracking-wide max-[768px]:pt-0 max-[768px]:text-[max(clamp(11px,3.3vw,12px),3.5cqw)]">
          {hero.name}
        </h1>

        {/* On phones this wrapper disappears so the bio and the terminal become grid items of their own. */}
        <div className="col-span-1 col-start-2 flex min-w-0 flex-col gap-4 max-[768px]:contents">
          {prose.map((paragraph) => (
            <p
              key={paragraph}
              className="leading-[1.5] max-[768px]:col-start-2 max-[768px]:min-w-0 max-[768px]:text-[max(clamp(10px,3.3vw,12px),2.75cqw)] max-[768px]:leading-[1.2]"
            >
              {paragraph}
            </p>
          ))}
          {terminal.length > 0 && (
            <div className="mt-6 flex flex-col gap-1 p-0 text-[22px] leading-[1.5] text-wine max-[768px]:col-span-2 max-[768px]:mt-[1cqw] max-[768px]:text-[max(clamp(9.5px,3vw,11px),2.75cqw)] max-[768px]:leading-[1.2]">
              {terminal.map((line) => (
                <p key={line} className="break-words">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      <ul data-stagger className="mt-auto grid grid-cols-3 gap-5 max-[768px]:gap-[2.2cqw]">
        {hero.badges.map((badge) => (
          <li key={badge.label} className="pixel-tile flex min-w-0 flex-col bg-cool-white">
            <span className="flex shrink-0 items-center justify-center bg-wine px-2 py-2 text-center font-pixel text-[9px] uppercase leading-tight text-cool-white max-[768px]:px-1 max-[768px]:py-[1cqw] max-[768px]:text-[max(7px,1.125cqw)]">
              {badge.label}
            </span>
            <span className="flex-1 px-3 py-3 text-center text-[20px] leading-tight max-[768px]:px-1 max-[768px]:py-[1cqw] max-[768px]:text-[max(clamp(11px,3.3vw,12px),2.5cqw)]">
              {badge.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

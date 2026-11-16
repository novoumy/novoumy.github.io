import { hero } from '@/siteData';

// Lines starting with ">" are the little terminal readout; everything else is prose.
const isBlank = (line: string) => line.replace(/\u00A0/g, '').trim() === '';
const prose = hero.bio.filter((line) => !isBlank(line) && !line.startsWith('>'));
const terminal = hero.bio.filter((line) => line.startsWith('>'));

export default function MainView() {
  return (
    <div className="flex min-h-full flex-col gap-6 max-sm:gap-4 max-sm:[@media(max-height:620px)]:!gap-3 sm:gap-8">
      {/* Phones: avatar + name side by side, bio full width below.
          sm and up: avatar on the left, name and bio stacked on the right. */}
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-5 max-sm:gap-y-3 sm:items-start sm:gap-x-7">
        <img
          src={hero.avatar}
          alt={hero.avatarAlt}
          className="pixel-frame aspect-square w-24 shrink-0 object-cover max-sm:w-20 max-sm:[@media(max-height:620px)]:!w-16 sm:row-span-2 sm:w-40"
        />
        <h1 className="min-w-0 break-words text-xl tracking-wide sm:pt-1 sm:text-3xl">{hero.name}</h1>

        <div className="col-span-2 flex min-w-0 flex-col gap-3 sm:col-span-1 sm:col-start-2 sm:gap-4">
          {prose.map((paragraph) => (
            <p key={paragraph} className="leading-[1.5] max-sm:text-[20px] max-sm:leading-[1.3] max-sm:[@media(max-height:620px)]:!text-[18px]">
              {paragraph}
            </p>
          ))}
          {terminal.length > 0 && (
            <div className="flex flex-col gap-1 p-0 text-[19px] leading-[1.3] max-sm:[@media(max-height:620px)]:!text-[17px] text-wine sm:bg-transparent sm:p-0 sm:text-[22px] sm:leading-[1.5] sm:text-wine sm:mt-6">
              {terminal.map((line) => (
                <p key={line} className="break-words">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Phones: one stat per row. sm and up: three tiles side by side. */}
      <ul className="mt-auto grid grid-cols-2 gap-4 max-sm:[@media(max-height:620px)]:!gap-3 sm:grid-cols-3 sm:gap-5">
        {hero.badges.map((badge) => (
          <li key={badge.label} className="pixel-tile flex min-w-0 flex-col bg-cool-white max-sm:odd:last:col-span-2 sm:flex-col">
            <span className="flex w-auto shrink-0 items-center justify-center bg-wine px-2 py-2 text-center font-pixel text-[8px] uppercase leading-tight text-cool-white sm:w-auto sm:text-[9px]">
              {badge.label}
            </span>
            <span className="flex-1 px-3 py-2 text-center text-[20px] leading-tight sm:py-3 sm:text-center">
              {badge.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

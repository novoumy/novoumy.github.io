import { hero } from '@/siteData';

export default function MainView() {
  return (
    <div className="flex min-h-full flex-col gap-6 sm:gap-8">
      <div className="flex items-start gap-5 sm:gap-7">
        <img
          src={hero.avatar}
          alt={hero.avatarAlt}
          className="pixel-frame aspect-square w-28 shrink-0 object-cover sm:w-40"
        />
        <div className="flex min-w-0 flex-col gap-4 pt-1">
          <h1 className="text-2xl tracking-wide sm:text-3xl">{hero.name}</h1>
          <div className="flex flex-col gap-3">
            {hero.bio.map((paragraph) => (
              <p key={paragraph} className="leading-[1.5]">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      <ul className="mt-auto grid grid-cols-3 gap-3 sm:gap-5">
        {hero.badges.map((badge) => (
          <li key={badge.label} className="pixel-tile flex min-w-0 flex-col bg-cool-white">
            <span className="truncate bg-wine px-2 py-2 text-center font-pixel text-[8px] uppercase leading-none text-cool-white sm:text-[9px]">
              {badge.label}
            </span>
            <span className="px-2 py-3 text-center text-[20px] leading-tight">{badge.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

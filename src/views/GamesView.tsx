import { ExternalLink } from 'lucide-react';
import PixelBadge from '@/components/PixelBadge';
import { games } from '@/siteData';

export default function GamesView() {
  return (
    <ul className="flex flex-col gap-4">
      {games.map((game) => (
        <li
          key={game.title}
          className="pixel-tile flex items-center gap-4 bg-cool-white p-3 sm:gap-5 sm:p-4"
        >
          <img
            src={game.cover}
            alt={`${game.title} cover`}
            loading="lazy"
            className="aspect-square w-20 shrink-0 object-cover sm:w-24"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-[11px] leading-[1.5] sm:text-xs">{game.title}</h3>
              <PixelBadge>{game.status}</PixelBadge>
            </div>
            <p className="leading-[1.3]">{game.note}</p>
          </div>
          {game.link && (
            <a
              href={game.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${game.title} store page`}
              className="pixel-btn shrink-0 px-3 py-2 text-[8px] sm:text-[9px]"
            >
              <ExternalLink size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Store</span>
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

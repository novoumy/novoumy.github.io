import { ExternalLink } from 'lucide-react';
import PixelBadge from '@/components/PixelBadge';
import { games } from '@/siteData';

// Same grid and portrait (2:3) cover shape as the Media tab.
export default function GamesView() {
  return (
    <ul className="grid grid-cols-2 gap-5 pb-5 sm:grid-cols-3">
      {games.map((game) => (
        <li key={game.title}>
          <div className="pixel-tile flex h-full flex-col gap-3 bg-cool-white p-3">
            <div className="relative">
              <img
                src={game.cover}
                alt={`${game.title} cover`}
                loading="lazy"
                className="aspect-[2/3] w-full object-cover"
              />
              <span className="absolute right-2 top-2">
                <PixelBadge>{game.status}</PixelBadge>
              </span>
            </div>
            <h3 className="text-[10px] leading-[1.6]">{game.title}</h3>
            <p className="leading-[1.2]">{game.note}</p>
            {game.link && (
              <a
                href={game.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${game.title} store page`}
                className="pixel-btn mt-auto px-3 py-2 text-[8px] sm:text-[9px]"
              >
                Store
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

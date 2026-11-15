import { useState } from 'react';
import { ExternalLink, X } from 'lucide-react';
import RetroOverlay from '@/components/RetroOverlay';
import { games, type GameItem } from '@/siteData';

// Turns the free-form `status` in siteData into a badge label.
//   '100%'            -> [ 100% COMPLETED ]
//   '40%'             -> [ 40% PROGRESS ]
//   'forever playing' -> [ FOREVER PLAYING ]
//   'mastered'        -> [ MASTERED ]
function badgeFor(status: string) {
  const text = status.trim();
  const percent = /^(\d{1,3})\s*%$/.exec(text);
  if (percent) {
    const value = Math.min(100, Number(percent[1]));
    return value === 100 ? '100% COMPLETED' : `${value}% PROGRESS`;
  }
  return text.toUpperCase();
}

// Launcher-style library: a grid of game art; clicking one slides a detail panel
// in from the left (poster, title, status badge and your review).
export default function GamesView({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<GameItem | null>(null);
  // Keeps the last game mounted while the panel slides out.
  const [shown, setShown] = useState<GameItem | null>(null);

  const select = (game: GameItem) => {
    if (selected === game) {
      setSelected(null);
      return;
    }
    setSelected(game);
    setShown(game);
  };

  const done = games.filter((g) => /^100\s*%$/.test(g.status.trim()) || /master/i.test(g.status)).length;

  return (
    <RetroOverlay
      label="Game library"
      meta={`${games.length} games · ${done} completed`}
      onClose={onClose}
      sideOpen={selected !== null}
      side={shown && <GameDetail game={shown} onDismiss={() => setSelected(null)} />}
    >
      <ul className="grid w-full gap-6 pb-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr))] lg:gap-8">
        {games.map((game) => {
          const active = game === selected;
          return (
            <li key={game.title} className="flex">
              <button
                type="button"
                aria-pressed={active}
                onClick={() => select(game)}
                className={[
                  'r-box r-box-hover group flex w-full flex-col gap-3 p-2 text-left',
                  active ? 'r-box-active !border-[#CC97A3] shadow-[4px_4px_0_0_#7d5560]' : '',
                ].join(' ')}
              >
                <div className="relative">
                  <img
                    src={game.cover}
                    alt={`${game.title} cover`}
                    loading="lazy"
                    className="aspect-[3/4] w-full border-2 border-[#7d5560] bg-[#1e1e1e] object-cover"
                  />
                  <span className="r-tag absolute right-2 top-2 shadow-[3px_3px_0_0_#000]">[ {badgeFor(game.status)} ]</span>
                </div>
                <h3 className="px-1 pb-1 text-[11px] leading-[1.6] text-[#d4d4d4]">{game.title}</h3>
              </button>
            </li>
          );
        })}
      </ul>
    </RetroOverlay>
  );
}

function GameDetail({ game, onDismiss }: { game: GameItem; onDismiss: () => void }) {
  return (
    <div className="flex min-h-full flex-col gap-5 p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="font-pixel text-[8px] uppercase text-[#8a8a8a]">// game_info</span>
        <button type="button" onClick={onDismiss} aria-label="Close details" className="r-btn !p-2">
          <X size={14} strokeWidth={3} aria-hidden="true" />
        </button>
      </div>

      <img
        src={game.cover}
        alt={`${game.title} poster`}
        className="aspect-[3/4] w-full border-2 border-[#CC97A3] bg-[#252526] object-cover shadow-[6px_6px_0_0_#7d5560]"
      />

      <div className="flex flex-col gap-3">
        <h3 className="r-glow text-[14px] leading-[1.5] text-[#CC97A3]">{game.title}</h3>
        <div>
          <span className="r-tag">[ {badgeFor(game.status)} ]</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t-2 border-dashed border-[#7d5560] pt-4">
        <span className="font-pixel text-[8px] uppercase text-[#8a8a8a]">// review</span>
        <p className="text-[24px] leading-[1.3] text-[#d4d4d4]">&gt; {game.note}</p>
      </div>

      {game.link && (
        <a href={game.link} target="_blank" rel="noopener noreferrer" className="r-btn mt-auto !text-[9px]">
          {game.linkLabel ?? 'Store page'}
          <ExternalLink size={13} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

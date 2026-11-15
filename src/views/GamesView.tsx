import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { games, type GameItem } from '@/siteData';

// Turns the free-form `status` in siteData into a badge label and a completion figure.
//   '100%'            -> [ 100% COMPLETED ]
//   '40%'             -> [ 40% PROGRESS ]
//   'forever playing' -> [ FOREVER PLAYING ]
//   'mastered'        -> [ MASTERED ]
function describeStatus(status: string) {
  const text = status.trim();
  const percent = /^(\d{1,3})\s*%$/.exec(text);
  if (percent) {
    const value = Math.min(100, Number(percent[1]));
    return {
      badge: value === 100 ? '100% COMPLETED' : `${value}% PROGRESS`,
      completion: `${value}%`,
      pct: value,
      gold: value === 100,
    };
  }
  const upper = text.toUpperCase();
  const ongoing = /playing/i.test(text);
  const mastered = /master/i.test(text);
  return {
    badge: upper,
    completion: ongoing ? 'ONGOING' : mastered ? '100%' : upper,
    pct: ongoing ? null : mastered ? 100 : null,
    gold: mastered,
  };
}

// Retro achievement showcase: big artwork cards with a status badge in the corner
// and a `[ DETAILS v ]` drawer with personal stats.
export default function GamesView() {
  const [openTitle, setOpenTitle] = useState<string | null>(null);
  const done = games.filter((g) => describeStatus(g.status).pct === 100).length;

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-[#7d5560] pb-4">
        <h2 className="r-glow text-[12px] uppercase text-[#CC97A3] sm:text-[14px]">&gt; game_library.exe</h2>
        <span className="font-pixel text-[8px] uppercase text-[#8a8a8a]">
          // {games.length} games · {done} completed
        </span>
      </header>

      <ul className="grid w-full gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr))]">
        {games.map((game) => (
          <li key={game.title} className="flex">
            <GameCard
              game={game}
              open={openTitle === game.title}
              onToggle={() => setOpenTitle((current) => (current === game.title ? null : game.title))}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

interface GameCardProps {
  game: GameItem;
  open: boolean;
  onToggle: () => void;
}

function GameCard({ game, open, onToggle }: GameCardProps) {
  const info = describeStatus(game.status);
  const drawerRef = useRef<HTMLDivElement>(null);
  // `inert` keeps the collapsed drawer out of the tab order (React 18 can't set it as a boolean prop).
  useEffect(() => {
    drawerRef.current?.toggleAttribute('inert', !open);
  }, [open]);
  const drawerId = `drawer-${game.title.replace(/\W+/g, '-').toLowerCase()}`;

  return (
    <article className={['r-box flex w-full flex-col', open ? 'r-box-active' : ''].join(' ')}>
      <div className="relative p-2 pb-0">
        <img
          src={game.cover}
          alt={`${game.title} cover`}
          loading="lazy"
          className="aspect-[3/4] w-full border-2 border-[#7d5560] bg-[#1e1e1e] object-cover"
        />
        <span
          className={[
            'r-tag absolute right-4 top-4 shadow-[3px_3px_0_0_#000]',
            '',
          ].join(' ')}
        >
          [ {info.badge} ]
        </span>
      </div>

      <h3 className="px-3 pb-3 pt-3 text-[11px] leading-[1.6] text-[#d4d4d4]">{game.title}</h3>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={drawerId}
        onClick={onToggle}
        className="mt-auto flex w-full items-center justify-between gap-2 border-t-2 border-[#7d5560] bg-[#1e1e1e] px-3 py-3 font-pixel text-[9px] uppercase text-[#CC97A3] outline-none transition-colors hover:bg-[#CC97A3] hover:text-[#1e1e1e] focus-visible:bg-[#CC97A3] focus-visible:text-[#1e1e1e]"
      >
        <span>[ Details {open ? '^' : 'v'} ]</span>
        <ChevronDown size={14} aria-hidden="true" className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div ref={drawerRef} id={drawerId} className="r-drawer" data-open={open}>
        <div>
          <dl className="grid grid-cols-2 gap-3 border-t-2 border-[#7d5560] bg-[#1e1e1e] p-3">
            <Stat label="Hours played" value={game.hours !== undefined ? `${game.hours} H` : '-- H'} />
            <Stat label="Completion" value={info.completion} />
            {info.pct !== null && (
              <div className="col-span-2">
                <div className="h-3 border-2 border-[#7d5560] bg-[#252526]" role="presentation">
                  <div className="h-full bg-[#CC97A3]" style={{ width: `${info.pct}%` }} />
                </div>
              </div>
            )}
            <div className="col-span-2 flex flex-col gap-1">
              <dt className="font-pixel text-[8px] uppercase text-[#8a8a8a]">// Review</dt>
              <dd className="text-[21px] leading-[1.25] text-[#d4d4d4]">&gt; {game.note}</dd>
            </div>
            {game.link && (
              <a
                href={game.link}
                target="_blank"
                rel="noopener noreferrer"
                className="r-btn col-span-2 !text-[9px]"
              >
                {game.linkLabel ?? 'Store page'}
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            )}
          </dl>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-pixel text-[8px] uppercase text-[#8a8a8a]">{label}</dt>
      <dd className="text-[26px] leading-none text-[#CC97A3]">{value}</dd>
    </div>
  );
}

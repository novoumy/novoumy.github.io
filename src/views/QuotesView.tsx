import { useCallback, useEffect, useRef, useState } from 'react';
import RetroOverlay from '@/components/RetroOverlay';
import { quotes } from '@/siteData';

// Pixel-art die (face showing five), drawn on a grid so it stays crisp at any size.
const PIPS: [number, number][] = [
  [2, 2],
  [8, 2],
  [5, 5],
  [2, 8],
  [8, 8],
];

function PixelDie({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" shapeRendering="crispEdges" className={className}>
      <rect x="0" y="0" width="12" height="12" fill="var(--r-accent)" />
      <rect x="1" y="1" width="10" height="10" fill="var(--r-bg)" />
      {PIPS.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="2" height="2" fill="var(--r-accent)" />
      ))}
    </svg>
  );
}

// How long a rolled quote stays highlighted (keep in sync with the quote-pulse animation in the CSS).
const SPOTLIGHT_MS = 3000;

// Quote log cards in a responsive grid, plus a big centered dice button that
// scrolls to and spotlights a random card for 3 seconds.
export default function QuotesView({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState<number | null>(null);
  const [rolls, setRolls] = useState(0); // bumped on every roll to replay the animations
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  // The highlight switches itself off after 3s; rolling again restarts the clock.
  useEffect(() => {
    if (rolls === 0) return;
    const timer = window.setTimeout(() => setActive(null), SPOTLIGHT_MS);
    return () => window.clearTimeout(timer);
  }, [rolls]);

  const roll = useCallback(() => {
    if (quotes.length === 0) return;
    let next = Math.floor(Math.random() * quotes.length);
    if (quotes.length > 1) while (next === active) next = Math.floor(Math.random() * quotes.length);
    setActive(next);
    setRolls((n) => n + 1);
    refs.current[next]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [active]);

  return (
    <RetroOverlay label="Quotes log" meta={`${quotes.length} entries`} onClose={onClose} accent="quotes">
      <div className="mb-8 flex justify-center pt-2 sm:mb-10">
        <button
          type="button"
          onClick={roll}
          data-sfx="roll"
          disabled={quotes.length === 0}
          className="r-btn group !gap-4 !px-6 !py-5 !text-[11px] !shadow-[6px_6px_0_0_var(--wine)] active:!shadow-none sm:!text-[13px]"
        >
          <span key={rolls} className={['block', rolls > 0 ? 'die-roll' : ''].join(' ')}>
            <PixelDie className="h-10 w-10 sm:h-12 sm:w-12" />
          </span>
          <span>[ Roll random quote ]</span>
        </button>
      </div>

      <ul className="grid w-full items-stretch gap-6 pb-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr))] lg:gap-8">
        {quotes.map((quote, index) => {
          const isActive = index === active;
          return (
            <li
              key={index}
              ref={(node) => {
                refs.current[index] = node;
              }}
              className="flex"
            >
              <figure
                key={isActive ? `on-${rolls}` : 'off'}
                className={[
                  'quote-card flex w-full flex-col border-2 border-wine bg-r-bg transition-opacity duration-300',
                  isActive ? 'quote-pulse' : active !== null ? 'opacity-40' : '',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3 bg-wine px-4 py-2 font-pixel text-[8px] uppercase text-cool-white">
                  <span>LOG_{String(index + 1).padStart(3, '0')}.TXT</span>
                  <span aria-hidden="true" className="block h-2 w-2 bg-rose" />
                </div>
                <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-4">
                  <span aria-hidden="true" className="r-glow font-pixel text-[26px] leading-none text-rose">
                    &ldquo;
                  </span>
                  <blockquote className="-mt-2 flex-1 text-[27px] leading-[1.25] text-r-text">{quote.text}</blockquote>
                  <figcaption className="mt-2 font-pixel text-[9px] uppercase leading-[1.6] text-wine">
                    -- {quote.author}
                  </figcaption>
                </div>
              </figure>
            </li>
          );
        })}
      </ul>
    </RetroOverlay>
  );
}

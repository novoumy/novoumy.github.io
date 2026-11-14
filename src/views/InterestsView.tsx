import { useEffect, useRef, useState, type ComponentType } from 'react';
import { TAB_ICONS } from '@/lib/icons';
import { interests, type InterestId } from '@/siteData';
import GamesView from '@/views/GamesView';
import MediaView from '@/views/MediaView';
import MusicView from '@/views/MusicView';
import QuotesView from '@/views/QuotesView';

const SECTIONS: Record<InterestId, ComponentType> = {
  media: MediaView,
  games: GamesView,
  music: MusicView,
  quotes: QuotesView,
};

// Interests is a tiny "desktop": a 2x2 grid of folders. Opening one swaps the
// content of this same window (no pop-ups); the back button returns to the grid.
export default function InterestsView() {
  const [openId, setOpenId] = useState<InterestId | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Each swap starts at the top of the window.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    rootRef.current?.closest('.pixel-scroll')?.scrollTo({ top: 0 });
  }, [openId]);

  if (openId) {
    const Section = SECTIONS[openId];
    return (
      <div ref={rootRef} key={openId} className="animate-tab-in flex min-h-full flex-col gap-5">
        <div>
          <button type="button" onClick={() => setOpenId(null)} className="pixel-btn">
            &lt; Back to interests
          </button>
        </div>
        <Section />
      </div>
    );
  }

  return (
    <div ref={rootRef} key="hub" className="animate-tab-in flex min-h-full flex-col gap-5">
      <p className="leading-none">&gt; select a folder to open //</p>
      <ul className="grid flex-1 grid-cols-2 auto-rows-fr gap-4 pb-2 sm:gap-6">
        {interests.map((item) => {
          const Icon = TAB_ICONS[item.icon];
          return (
            <li key={item.id} className="flex min-w-0">
              <button
                type="button"
                onClick={() => setOpenId(item.id)}
                aria-label={`Open ${item.label}`}
                className="pixel-tile pixel-tile-interactive group flex min-h-[170px] w-full min-w-0 flex-col bg-cool-white text-left"
              >
                <span className="truncate bg-wine px-2 py-2 text-center font-pixel text-[8px] uppercase leading-none text-cool-white sm:text-[10px] sm:py-3">
                  {item.label}
                </span>
                <span className="flex flex-1 flex-col items-center justify-center gap-3 px-2 py-4 text-center">
                  <span className="pixel-tile flex h-14 w-14 items-center justify-center bg-rose text-wine transition-colors group-hover:bg-wine group-hover:text-cool-white sm:h-20 sm:w-20">
                    <Icon className="h-7 w-7 sm:h-10 sm:w-10" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  <span className="text-[19px] leading-tight sm:text-[22px]">{item.subtitle}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

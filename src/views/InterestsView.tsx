import { useEffect, useRef, type ComponentType } from 'react';
import PixelIcon from '@/components/PixelIcon';
import { interests, type InterestId } from '@/siteData';
import GamesView from '@/views/GamesView';
import MediaView from '@/views/MediaView';
import MusicView from '@/views/MusicView';
import QuotesView from '@/views/QuotesView';

// Media is not in this map: it opens as a full-screen overlay (see below).
const SECTIONS: Record<Exclude<InterestId, 'media'>, ComponentType> = {
  games: GamesView,
  music: MusicView,
  quotes: QuotesView,
};

// Interests is a tiny "desktop": a 2x2 grid of folders. Opening one swaps the
// content of this same window (no pop-ups); the back button returns to the grid.
// Which folder is open lives in the URL hash (see App.tsx), so it survives reloads and can be shared.
interface InterestsViewProps {
  openId: InterestId | null;
  onOpen: (id: InterestId | null) => void;
}

export default function InterestsView({ openId, onOpen }: InterestsViewProps) {
  const setOpenId = onOpen;
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

  const hub = (
    <div ref={rootRef} key="hub" className="animate-tab-in flex min-h-full flex-col gap-6">
      <p className="leading-none">&gt; select a folder to open //</p>
      <ul className="grid grid-cols-2 content-start gap-x-4 gap-y-8 sm:grid-cols-4">
        {interests.map((item) => (
          <li key={item.id} className="flex justify-center">
            <button
              type="button"
              onClick={() => setOpenId(item.id)}
              aria-label={`Open ${item.label}`}
              className="group flex w-full max-w-[150px] flex-col items-center gap-3 outline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-wine"
            >
              <PixelIcon
                name={item.id}
                className="h-20 w-20 transition-transform duration-150 [transition-timing-function:steps(2)] group-hover:-translate-y-1 group-active:translate-y-0 sm:h-24 sm:w-24"
              />
              <span className="px-2 py-1 font-pixel text-[10px] uppercase leading-none transition-colors duration-150 group-hover:bg-wine group-hover:text-cool-white sm:text-[11px]">
                {item.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  // Media: the folder grid stays in place behind a full-screen overlay.
  if (openId === 'media') {
    return (
      <>
        {hub}
        <MediaView onClose={() => setOpenId(null)} />
      </>
    );
  }

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

  return hub;
}

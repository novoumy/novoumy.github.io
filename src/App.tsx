import { useEffect, useState, type ComponentType } from 'react';
import PixelBackdrop from '@/components/PixelBackdrop';
import PixelTabBar from '@/components/PixelTabBar';
import SoundToggle from '@/components/SoundToggle';
import GamesView from '@/views/GamesView';
import MainView from '@/views/MainView';
import MediaView from '@/views/MediaView';
import MusicView from '@/views/MusicView';
import QuotesView from '@/views/QuotesView';
import SocialsView from '@/views/SocialsView';
import { site, tabs, type TabId } from '@/siteData';
import { useStageScale } from '@/lib/useStageScale';

const VIEWS: Record<TabId, ComponentType> = {
  main: MainView,
  media: MediaView,
  games: GamesView,
  music: MusicView,
  quotes: QuotesView,
  socials: SocialsView,
};

const enabledTabs = tabs.filter((tab) => tab.enabled);

export default function App() {
  const [activeId, setActiveId] = useState<TabId>(() => enabledTabs[0]?.id ?? 'main');
  const ActiveView = VIEWS[activeId];

  useEffect(() => {
    document.title = site.title;
  }, []);

  const scale = useStageScale();
  const staged = scale !== null;

  return (
    <div className="relative h-dvh overflow-hidden bg-lavender">
      <PixelBackdrop />
      <main className={['relative z-10 flex h-full', staged ? 'items-center justify-center' : 'p-3'].join(' ')}>
        {/* Big screens: fixed 800px window scaled up. Phones/small windows: window fills the screen. */}
        <div
          className={
            staged
              ? 'w-[800px] shrink-0 pb-2 pr-2'
              : 'mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col pb-2 pr-2'
          }
          style={staged ? { zoom: scale } : undefined}
        >
          <div className="flex items-end justify-between gap-2">
            <PixelTabBar tabs={enabledTabs} activeId={activeId} onSelect={setActiveId} />
            <SoundToggle />
          </div>
          <section
            role="tabpanel"
            className={[
              'pixel-frame relative mt-1 flex flex-col bg-cool-white text-wine',
              staged ? 'aspect-[4/3]' : 'min-h-0 flex-1',
            ].join(' ')}
          >
            <div key={activeId} className="pixel-scroll animate-tab-in min-h-0 flex-1 overflow-y-auto p-5 sm:p-8">
              <ActiveView />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

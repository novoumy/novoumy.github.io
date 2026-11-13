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

  return (
    <div className="relative min-h-dvh overflow-hidden bg-lavender">
      <PixelBackdrop />
      <main className="relative z-10 flex min-h-dvh items-center justify-center p-4">
        <div className="w-[min(800px,calc((100dvh_-_6rem)*4/3),calc(100vw_-_2rem))] pb-2 pr-2">
          <div className="flex items-end justify-between gap-2">
            <PixelTabBar tabs={enabledTabs} activeId={activeId} onSelect={setActiveId} />
            <SoundToggle />
          </div>
          <section
            role="tabpanel"
            className="pixel-frame relative mt-1 flex aspect-[4/3] flex-col bg-cool-white text-wine"
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

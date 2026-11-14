import { useEffect, useState, type ComponentType } from 'react';
import PixelBackdrop from '@/components/PixelBackdrop';
import PixelTabBar from '@/components/PixelTabBar';
import SoundToggle from '@/components/SoundToggle';
import MainView from '@/views/MainView';
import InterestsView from '@/views/InterestsView';
import SocialsView from '@/views/SocialsView';
import SpecsView from '@/views/SpecsView';
import { site, tabs, type TabId } from '@/siteData';
import { useStageScale } from '@/lib/useStageScale';

const VIEWS: Record<TabId, ComponentType> = {
  main: MainView,
  socials: SocialsView,
  interests: InterestsView,
  specs: SpecsView,
};

const enabledTabs = tabs.filter((tab) => tab.enabled);

export default function App() {
  const [activeId, setActiveId] = useState<TabId>(() => enabledTabs[0]?.id ?? 'main');
  // Bumped when the active tab is clicked again, so Interests returns to its grid.
  const [resetCount, setResetCount] = useState(0);
  const ActiveView = VIEWS[activeId];

  const selectTab = (id: TabId) => {
    if (id === activeId) setResetCount((n) => n + 1);
    else setActiveId(id);
  };

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
          {/* Phones: slim title bar with the sound toggle above the tabs. */}
          <div className="mb-4 flex items-center justify-between pl-1 pr-1 min-[860px]:hidden">
            <span className="font-pixel text-[10px] uppercase text-cool-white [text-shadow:2px_2px_0_var(--wine)]">
              &gt; {site.title}
            </span>
            <SoundToggle className="flex" />
          </div>
          <div className="flex items-end justify-between gap-2">
            <PixelTabBar tabs={enabledTabs} activeId={activeId} onSelect={selectTab} />
            <SoundToggle className="hidden min-[860px]:flex" />
          </div>
          <section
            role="tabpanel"
            className={[
              'pixel-frame relative mt-1 flex flex-col bg-cool-white text-wine',
              staged ? 'aspect-[4/3]' : 'min-h-0 flex-1',
            ].join(' ')}
          >
            <div key={`${activeId}-${resetCount}`} className="pixel-scroll animate-tab-in min-h-0 flex-1 overflow-y-auto p-5 sm:p-8">
              <ActiveView />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

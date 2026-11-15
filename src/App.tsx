import { useEffect, useState, type ComponentType } from 'react';
import PixelBackdrop from '@/components/PixelBackdrop';
import PixelTabBar from '@/components/PixelTabBar';
import SoundToggle from '@/components/SoundToggle';
import MainView from '@/views/MainView';
import InterestsView from '@/views/InterestsView';
import SocialsView from '@/views/SocialsView';
import SpecsView from '@/views/SpecsView';
import { site, tabs, type InterestId, type TabId } from '@/siteData';
import { useStageScale } from '@/lib/useStageScale';
import { hashFor, parseHash, type Route } from '@/lib/route';

const VIEWS: Record<Exclude<TabId, 'interests'>, ComponentType> = {
  main: MainView,
  socials: SocialsView,
  specs: SpecsView,
};

const enabledTabs = tabs.filter((tab) => tab.enabled);

// The URL hash is the single source of truth for which tab / folder is open.
function setHash(route: Route) {
  const next = hashFor(route);
  if (window.location.hash.replace(/^#\/?/, '').toLowerCase() !== next) window.location.hash = next;
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash);
  // Bumped when the active tab is clicked again, so the tab returns to its start state.
  const [resetCount, setResetCount] = useState(0);
  const activeId = route.tab;

  // Keep the view in sync with the URL hash (direct links, reloads, back/forward).
  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Clicking a tab only changes the hash; the listener above updates the view.
  const selectTab = (id: TabId) => {
    if (id === activeId) setResetCount((n) => n + 1);
    setHash({ tab: id, interest: null });
  };

  const openInterest = (id: InterestId | null) => setHash({ tab: 'interests', interest: id });

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
              {route.tab === 'interests' ? (
                <InterestsView openId={route.interest} onOpen={openInterest} />
              ) : (
                (() => {
                  const ActiveView = VIEWS[route.tab];
                  return <ActiveView />;
                })()
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

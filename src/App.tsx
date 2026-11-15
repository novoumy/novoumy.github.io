import { useEffect, useState, type ReactNode } from 'react';
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
import { preloadInterestViews } from '@/lib/preload';

const sameRoute = (a: Route, b: Route) => a.tab === b.tab && a.interest === b.interest;

const enabledTabs = tabs.filter((tab) => tab.enabled);

type Panel = {
  id: TabId;
  render: (route: Route, openInterest: (id: InterestId | null) => void) => ReactNode;
};

const ALL_PANELS: Panel[] = [
  { id: 'main', render: () => <MainView /> },
  { id: 'socials', render: () => <SocialsView /> },
  {
    id: 'interests',
    render: (route, openInterest) => (
      <InterestsView openId={route.tab === 'interests' ? route.interest : null} onOpen={openInterest} />
    ),
  },
  { id: 'specs', render: () => <SpecsView /> },
];

const PANELS = ALL_PANELS.filter((panel) => enabledTabs.some((tab) => tab.id === panel.id));

// The URL hash is the single source of truth for which tab / folder is open.
function setHash(route: Route) {
  const next = hashFor(route);
  if (window.location.hash.replace(/^#\/?/, '').toLowerCase() !== next) window.location.hash = next;
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash);
  const activeId = route.tab;

  // Keep the view in sync with the URL hash (direct links, reloads, back/forward).
  useEffect(() => {
    // Returning the previous object when nothing changed skips a pointless re-render.
    const onHashChange = () => setRoute((prev) => {
      const next = parseHash();
      return sameRoute(prev, next) ? prev : next;
    });
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Update the view immediately (no waiting on the async hashchange event), then mirror to the URL.
  const navigate = (next: Route) => {
    setRoute((prev) => (sameRoute(prev, next) ? prev : next));
    setHash(next);
  };

  // Already on this tab: do nothing (no state change, no hash write, no sound).
  const selectTab = (id: TabId) => {
    if (id === activeId) return;
    navigate({ tab: id, interest: null });
  };

  const openInterest = (id: InterestId | null) => navigate({ tab: 'interests', interest: id });

  // Warm the heavy folder views once the first paint is done, so opening them is instant.
  useEffect(() => preloadInterestViews(), []);

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
            className={[
              'pixel-frame relative mt-1 flex flex-col bg-cool-white text-wine',
              staged ? 'aspect-[4/3]' : 'min-h-0 flex-1',
            ].join(' ')}
          >
            {/* Every tab stays mounted and is only shown/hidden, so switching is instant:
                no remount, no re-fetch, no fade. Animations live inside the pages. */}
            {PANELS.map(({ id, render }) => (
              <div
                key={id}
                role="tabpanel"
                hidden={id !== activeId}
                className="pixel-scroll min-h-0 flex-1 overflow-y-auto p-5 sm:p-8"
              >
                {render(route, openInterest)}
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}

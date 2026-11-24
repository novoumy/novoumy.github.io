import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { animatePanelIn } from '@/lib/motion';
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
import { loadInterestView, preloadInterestViews } from '@/lib/preload';
import { folderMorph } from '@/lib/morph';

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

  // Track the route synchronously so browser back/forward and clicks share one transition path.
  const routeRef = useRef(route);

  const transitionTo = useCallback((next: Route, writeHash: boolean) => {
    const previous = routeRef.current;
    if (sameRoute(previous, next)) {
      if (writeHash) setHash(next);
      return;
    }

    routeRef.current = next;
    const folderChange =
      previous.tab === 'interests' &&
      next.tab === 'interests' &&
      previous.interest !== next.interest &&
      (previous.interest !== null || next.interest !== null);

    if (folderChange) {
      // Load the folder before powering the old screen off, so the new window is ready to expand.
      void (next.interest ? loadInterestView(next.interest) : Promise.resolve()).then(() => {
        if (!sameRoute(routeRef.current, next)) return;
        return folderMorph(() => {
          if (sameRoute(routeRef.current, next)) flushSync(() => setRoute(next));
        }, next.interest ? 'folder' : 'hub', next.interest ?? previous.interest);
      });
    } else {
      // Leaving a folder for Main / Specs / Socials is a normal tab switch, never a CRT transition.
      setRoute(next);
    }

    if (writeHash) setHash(next);
  }, []);

  // Keep the view in sync with the URL hash (direct links, reloads, back/forward).
  useEffect(() => {
    const onHashChange = () => transitionTo(parseHash(), false);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [transitionTo]);

  const navigate = (next: Route) => transitionTo(next, true);

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

  // Tab swap animation: the new panel wipes in from the side you're moving towards.
  const panelRefs = useRef<Partial<Record<TabId, HTMLDivElement | null>>>({});
  const previousTab = useRef<TabId | null>(null);
  useEffect(() => {
    const order = PANELS.map((panel) => panel.id);
    const from = previousTab.current;
    previousTab.current = activeId;
    const panel = panelRefs.current[activeId];
    if (!panel) return;
    // Arriving from the 404 morph: that page already drew this window, so don't fade it in a second time.
    if (from === null) {
      try {
        const morphed = sessionStorage.getItem('novoumy:from404') === '1';
        sessionStorage.removeItem('novoumy:from404');
        if (morphed) return;
      } catch { /* storage blocked */ }
    }
    const direction = from === null ? 0 : order.indexOf(activeId) > order.indexOf(from) ? 1 : -1;
    animatePanelIn(panel, direction);
  }, [activeId]);

  const scale = useStageScale();
  const staged = scale !== null;

  return (
    <div className="relative h-dvh overflow-hidden bg-lavender">
      <PixelBackdrop />
      <main
        className={[
          'relative z-10 flex h-full',
          staged ? 'items-center justify-center' : 'px-3 py-8 max-[859px]:items-center max-[859px]:px-3 max-[859px]:py-8',
        ].join(' ')}
      >
        {/* Big screens: fixed 800px window scaled up. Phones/small windows: window fills the screen. */}
        <div
          className={
            staged
              ? 'w-[800px] shrink-0 pb-2 pr-2'
              : 'mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col pb-2 pr-2 max-[859px]:max-h-[46rem]'
          }
          style={staged ? { zoom: scale } : undefined}
          data-crt-stage
        >
          <div className="flex items-end justify-between gap-2">
            <PixelTabBar tabs={enabledTabs} activeId={activeId} onSelect={selectTab} />
            <SoundToggle className="flex" />
          </div>
          <section
            data-compact={activeId === 'main'}
            className={[
              'relative mt-1 flex flex-col bg-wine text-wine',
              staged ? 'aspect-[4/3]' : 'win-section min-h-0 flex-1',
            ].join(' ')}
          >
            {/* Every tab stays mounted and is only shown/hidden, so switching is instant:
                no remount, no re-fetch, no fade. Animations live inside the pages. */}
            {/* CRT scan sweep across the window on every tab swap (decorative). */}
            <div key={activeId} aria-hidden="true" className="panel-sweep" />
            {PANELS.map(({ id, render }) => (
              <div
                key={id}
                ref={(el) => {
                  panelRefs.current[id] = el;
                }}
                role="tabpanel"
                hidden={id !== activeId}
                data-no-fade={id === 'main' ? '' : undefined}
                className={[
                  'pixel-scroll m-1 min-h-0 flex-1 overscroll-contain',
                  id === 'main' ? 'relative overflow-hidden p-0' : 'overflow-y-auto p-4 max-sm:p-3 sm:p-7',
                ].join(' ')}
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

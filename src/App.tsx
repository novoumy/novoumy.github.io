import { useEffect, useRef, useState, type ReactNode } from 'react';
import { animatePanelIn } from '@/lib/motion';
import { OverlayHostContext } from '@/components/OverlayHost';
import PixelBackdrop from '@/components/PixelBackdrop';
import PixelTabBar from '@/components/PixelTabBar';
import SoundToggle from '@/components/SoundToggle';
import ClickDiskIndicator from '@/components/ClickDiskIndicator';
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

// The URL hash is the single source of truth for which tab / folder is open.
function setHash(route: Route) {
  const next = hashFor(route);
  if (window.location.hash.replace(/^#\/?/, '').toLowerCase() !== next) window.location.hash = next;
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash);
  const activeId = route.tab;
  const [crt, setCrt] = useState(false);
  // The window element folder views morph inside of (instead of covering the whole page).
  const [host, setHost] = useState<HTMLElement | null>(null);
  const tabOrigin = useRef(50);
  const panelRefs = useRef<Partial<Record<TabId, HTMLDivElement | null>>>({});
  const previousTab = useRef<TabId | null>(null);

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
  const selectTab = (id: TabId, clientX?: number) => {
    if (id === activeId) return;
    // Where (as % of the window width) the clicked tab sits: the page wipe radiates from there.
    const rect = host?.getBoundingClientRect();
    tabOrigin.current =
      rect && rect.width && clientX !== undefined ? Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)) : 50;
    navigate({ tab: id, interest: null });
  };

  const openInterest = (id: InterestId | null) => navigate({ tab: 'interests', interest: id });

  // Warm the heavy folder views once the first paint is done, so opening them is instant.
  useEffect(() => preloadInterestViews(), []);

  useEffect(() => {
    document.title = site.title;
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('crt-on', crt);
  }, [crt]);

  const panels: Panel[] = [
    { id: 'main', render: () => <MainView onToggleCrt={() => setCrt((v) => !v)} /> },
    { id: 'socials', render: () => <SocialsView /> },
    {
      id: 'interests',
      render: (r, open) => <InterestsView openId={r.tab === 'interests' ? r.interest : null} onOpen={open} />,
    },
    { id: 'specs', render: () => <SpecsView /> },
  ];
  const visiblePanels = panels.filter((panel) => enabledTabs.some((tab) => tab.id === panel.id));

  // Tab swap animation: the new panel wipes in from the clicked tab, towards the side you're moving.
  useEffect(() => {
    const order = visiblePanels.map((panel) => panel.id);
    const from = previousTab.current;
    previousTab.current = activeId;
    const panel = panelRefs.current[activeId];
    if (!panel) return;
    const direction = from === null ? 0 : order.indexOf(activeId) > order.indexOf(from) ? 1 : -1;
    animatePanelIn(panel, direction, from === null ? 50 : tabOrigin.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const scale = useStageScale();
  const staged = scale !== null;

  return (
    <div className="relative h-dvh overflow-hidden bg-lavender">
      <PixelBackdrop />
      <main
        className={[
          'relative z-10 flex h-full',
          staged ? 'items-center justify-center' : 'p-3 max-[859px]:items-center max-[859px]:px-3 max-[859px]:py-6 max-[859px]:[@media(max-height:620px)]:py-3',
        ].join(' ')}
      >
        {/* Big screens: fixed 800px window scaled up. Phones/small windows: window fills the screen. */}
        <div
          className={
            staged
              ? 'w-[800px] shrink-0 pb-2 pr-2'
              : 'mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col pb-2 pr-2 max-[859px]:max-h-[46rem] max-[768px]:h-auto max-[859px]:pb-20'
          }
          style={staged ? { zoom: scale } : undefined}
        >
          <div className="flex items-end justify-between gap-2">
            <PixelTabBar tabs={enabledTabs} activeId={activeId} onSelect={selectTab} />
            <SoundToggle className="hidden min-[860px]:flex" />
          </div>
          <section
            ref={setHost}
            data-compact={activeId === 'main'}
            className={[
              
              'pixel-frame relative mt-1 flex min-h-0 flex-col bg-cool-white text-wine',
              staged ? 'aspect-[4/3]' : 'win-section min-h-0 flex-1',
            ].join(' ')}
          >
            {/* Every tab stays mounted and is only shown/hidden, so switching is instant:
                no remount, no re-fetch, no fade. Animations live inside the pages. */}
            {/* CRT scan bar sweeping down the window on every tab swap (decorative). */}
            <div key={activeId} aria-hidden="true" className="panel-sweep" />
            <OverlayHostContext.Provider value={host}>
            {visiblePanels.map(({ id, render }) => (
              <div
                key={id}
                ref={(el) => {
                  panelRefs.current[id] = el;
                }}
                role="tabpanel"
                hidden={id !== activeId}
                className="pixel-scroll min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-5 max-sm:p-4 sm:p-8"
              >
                {/* Main needs a full-height flex box; other panels stay in normal flow so their
                    content expands naturally and the panel itself scrolls. */}
                <div
                  className={
                    id === 'main'
                      ? 'flex h-full min-h-0 min-w-0 w-full max-w-full flex-col'
                      : 'min-w-0 w-full max-w-full'
                  }
                >
                  {render(route, openInterest)}
                </div>
              </div>
            ))}
            </OverlayHostContext.Provider>
          </section>
        </div>
        {!staged && (
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-end p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] min-[860px]:hidden">
            <div className="pointer-events-auto">
              <SoundToggle />
            </div>
          </div>
        )}
        <ClickDiskIndicator />
        {crt && <div className="crt-overlay" aria-hidden="true" />}
      </main>
    </div>
  );
}

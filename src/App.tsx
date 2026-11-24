import { useEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import PixelBackdrop from '@/components/PixelBackdrop';
import PixelTabBar from '@/components/PixelTabBar';
import SoundToggle from '@/components/SoundToggle';
import MainView from '@/views/MainView';
import InterestsView from '@/views/InterestsView';
import SocialsView from '@/views/SocialsView';
import SpecsView from '@/views/SpecsView';
import { site, tabs, type InterestId, type TabId } from '@/siteData';
import { useStage } from '@/lib/useStageScale';
import { hashFor, parseHash, type Route } from '@/lib/route';
import { loadInterestView, preloadInterestViews } from '@/lib/preload';
import { folderMorph } from '@/lib/morph';
import { animatePanelIn } from '@/lib/motion';

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

  // Keep the view in sync with the URL hash (direct links, reloads, back/forward).
  useEffect(() => {
    const onHashChange = () => {
      const next = parseHash();
      if (!sameRoute(targetRef.current, next)) go(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Update the view immediately (no waiting on the async hashchange event), then mirror to the URL.
  const routeRef = useRef(route);
  // The route we are heading to (a folder morph waits for its code before it lands).
  const targetRef = useRef(route);

  // Opening / closing a folder morphs the main window into the folder window (and back)
  // instead of popping an overlay on top. The folder code is loaded first so the morph
  // lands on real content.
  const go = (next: Route) => {
    targetRef.current = next;
    const prev = routeRef.current;
    const folderChange = prev.tab === 'interests' && next.tab === 'interests' && prev.interest !== next.interest && (prev.interest !== null || next.interest !== null);
    const apply = () => {
      if (targetRef.current !== next) return; // a newer navigation won
      routeRef.current = next;
      flushSync(() => setRoute(next));
    };
    if (!folderChange) {
      apply();
      return;
    }
    const opening = next.interest;
    void (opening ? loadInterestView(opening) : Promise.resolve()).then(() =>
      folderMorph(apply, opening ? 'folder' : 'hub', opening ?? prev.interest),
    );
  };

  const navigate = (next: Route) => {
    if (sameRoute(targetRef.current, next)) return;
    go(next);
    setHash(next);
  };

  // Already on this tab: do nothing (no state change, no hash write, no sound).
  const selectTab = (id: TabId) => {
    if (id === targetRef.current.tab && !targetRef.current.interest) return;
    navigate({ tab: id, interest: null });
  };

  const openInterest = (id: InterestId | null) => navigate({ tab: 'interests', interest: id });

  // Tab switch: the new panel glides in from the side the tab sits on, its blocks staggered.
  const panelRefs = useRef<Partial<Record<TabId, HTMLDivElement | null>>>({});
  const lastTab = useRef(activeId);
  useEffect(() => {
    const prev = lastTab.current;
    lastTab.current = activeId;
    if (prev === activeId) return;
    const order = enabledTabs.map((tab) => tab.id);
    const direction = Math.sign(order.indexOf(activeId) - order.indexOf(prev)) || 1;
    const panel = panelRefs.current[activeId];
    if (panel) animatePanelIn(panel, direction);
  }, [activeId]);

  // Warm the heavy folder views once the first paint is done, so opening them is instant.
  useEffect(() => preloadInterestViews(), []);

  useEffect(() => {
    document.title = site.title;
  }, []);

  const panels: Panel[] = [
    { id: 'main', render: () => <MainView /> },
    { id: 'socials', render: () => <SocialsView /> },
    {
      id: 'interests',
      render: (r, open) => <InterestsView openId={r.tab === 'interests' ? r.interest : null} onOpen={open} />,
    },
    { id: 'specs', render: () => <SpecsView /> },
  ];
  const visiblePanels = panels.filter((panel) => enabledTabs.some((tab) => tab.id === panel.id));

  // Two fixed layouts only: 4:3 landscape (wide screens) and 3:4 portrait (narrow screens). Each is scaled to fit.
  const { mode, scale } = useStage();
  const portrait = mode === 'portrait';
  // While a folder is open it *is* the window: the main window is hidden, not left behind it.
  const folderOpen = route.tab === 'interests' && route.interest !== null;

  return (
    <div className="relative h-dvh overflow-hidden">
      <PixelBackdrop />
      <main className="relative z-10 flex h-full items-center justify-center">
        {/* Fixed-size window (800px wide 4:3, or 420px wide 3:4) scaled uniformly to fit the screen. */}
        <div
          className={['shrink-0 pb-2 pr-2', portrait ? 'w-[420px]' : 'w-[800px]'].join(' ')}
          style={{ zoom: scale }}
          data-folder-open={folderOpen}
          data-stage-mode={mode}
          data-crt-stage
        >
          <div className="relative z-30 flex w-full min-w-0 items-end justify-between gap-2 overflow-visible max-[859px]:gap-1">
            <PixelTabBar tabs={enabledTabs} activeId={activeId} onSelect={selectTab} />
            <SoundToggle className="flex shrink-0" />
          </div>
          <section
            data-compact={activeId === 'main'}
            className={[
              'pixel-frame relative mt-1 flex min-h-0 flex-col bg-cool-white text-wine',
              portrait ? 'aspect-[3/4]' : 'aspect-[4/3]',
            ].join(' ')}
          >
            {/* Every tab stays mounted and is only shown/hidden, so switching is instant:
                no remount, no re-fetch, no fade. Animations live inside the pages. */}
            {visiblePanels.map(({ id, render }) => (
              <div
                key={id}
                ref={(el) => {
                  panelRefs.current[id] = el;
                }}
                role="tabpanel"
                hidden={id !== activeId}
                data-no-fade={id === 'main' ? '' : undefined}
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
          </section>
        </div>
      </main>
    </div>
  );
}

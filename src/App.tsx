import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
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
import { animatePanelIn } from '@/lib/motion';

const sameRoute = (a: Route, b: Route) => a.tab === b.tab && a.interest === b.interest;
type VisualMode = 'light' | 'invert' | 'theme';

function getInitialVisualMode(): VisualMode {
  try {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('novoumy-theme') : null;
    // Older releases stored the original inverted palette as 'dark'.
    if (saved === 'dark' || saved === 'invert') return 'invert';
    if (saved === 'theme') return 'theme';
  } catch {
    // Use the default light palette when storage is unavailable.
  }
  return 'light';
}

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
  const [visualMode, setVisualMode] = useState<VisualMode>(getInitialVisualMode);

  // Apply the selected palette to <html> so every tab and portal-rendered folder shares it.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('theme-dark', visualMode === 'invert');
    root.classList.toggle('theme-soft', visualMode === 'theme');
    root.style.colorScheme = visualMode === 'light' ? 'light' : 'dark';
    try {
      window.localStorage.setItem('novoumy-theme', visualMode);
    } catch {
      // Theme still works for this session when storage is unavailable.
    }
  }, [visualMode]);

  // /theme toggles the softer palette; using it while inverted switches directly to it.
  const toggleTheme = () => {
    const next = visualMode === 'theme' ? 'light' : 'theme';
    setVisualMode(next);
    return next === 'theme';
  };

  // /invert preserves the original high-contrast inverted palette as a separate option.
  const toggleInvert = () => {
    const next = visualMode === 'invert' ? 'light' : 'invert';
    setVisualMode(next);
    return next === 'invert';
  };

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

  useEffect(() => {
    document.documentElement.classList.toggle('crt-on', crt);
  }, [crt]);

  const panels: Panel[] = [
    { id: 'main', render: () => <MainView onToggleTheme={toggleTheme} onToggleInvert={toggleInvert} /> },
    { id: 'socials', render: () => <SocialsView /> },
    {
      id: 'interests',
      render: (r, open) => <InterestsView openId={r.tab === 'interests' ? r.interest : null} onOpen={open} />,
    },
    { id: 'specs', render: () => <SpecsView /> },
  ];
  const visiblePanels = panels.filter((panel) => enabledTabs.some((tab) => tab.id === panel.id));

  const scale = useStageScale();
  const staged = scale !== null;
  // While a folder is open it *is* the window: the main window is hidden, not left behind it.
  const folderOpen = route.tab === 'interests' && route.interest !== null;

  return (
    <div className="relative h-dvh overflow-hidden bg-lavender">
      <PixelBackdrop />
      <main
        className={[
          'relative z-10 flex h-full',
          staged
            ? 'items-center justify-center'
            : 'px-3 py-8 max-[859px]:flex-col max-[859px]:items-center max-[859px]:justify-start max-[859px]:px-3 max-[859px]:py-8',
        ].join(' ')}
      >
        {/* Big screens: fixed 800px window scaled up. Phones/small windows: window fills the screen. */}
        <div
          className={
            staged
              ? 'w-[800px] shrink-0 pb-2 pr-2'
              : 'mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col pb-2 pr-2 max-[859px]:max-h-none max-[859px]:pb-0 max-[859px]:pr-0'
          }
          style={staged ? { zoom: scale } : undefined}
          data-folder-open={folderOpen}
          data-crt-stage
        >
          <div className="relative z-30 flex w-full min-w-0 items-end justify-between gap-2 overflow-visible">
            <PixelTabBar tabs={enabledTabs} activeId={activeId} onSelect={selectTab} />
            <SoundToggle className="flex shrink-0" />
          </div>
          <section
            data-compact={activeId === 'main'}
            className={[
              'pixel-frame relative mt-1 flex min-h-0 flex-col bg-cool-white text-wine',
              staged ? 'aspect-[4/3]' : 'win-section min-h-0 flex-1',
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
        {crt && <div className="crt-overlay" aria-hidden="true" />}
      </main>
    </div>
  );
}

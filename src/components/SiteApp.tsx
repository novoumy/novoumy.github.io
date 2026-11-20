import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { playSfx } from '@/audio/sfx';
import { animatePanelIn } from '@/lib/motion';
import PixelBackdrop from '@/components/PixelBackdrop';
import RadioStaticOverlay from '@/components/RadioStaticOverlay';
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

// The URL hash is the single source of truth for which tab / folder is open.
function setHash(route: Route) {
  const next = hashFor(route);
  if (window.location.hash.replace(/^#\/?/, '').toLowerCase() !== next) window.location.hash = next;
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash);
  const activeId = route.tab;
  const [frequency, setFrequency] = useState(() => {
    try {
      const saved = Number(window.localStorage.getItem('radio-frequency'));
      return [6, 8, 10, 12, 14].includes(saved) ? saved : 10;
    } catch {
      return 10;
    }
  });
  const [radioStage, setRadioStage] = useState<'idle' | 'surge' | 'shift' | 'reveal'>('idle');
  const pendingFrequency = useRef(frequency);
  const radioTimers = useRef<number[]>([]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.wavelength = String(frequency);
    try { window.localStorage.setItem('radio-frequency', String(frequency)); } catch { /* storage may be unavailable */ }
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeColor) themeColor.content = ({ 6: '#051324', 8: '#0d0618', 10: '#837a94', 12: '#9e472a', 14: '#050505' } as Record<number, string>)[frequency] ?? '#837a94';
  }, [frequency]);

  const tune = useCallback((next: number) => {
    const lockedFrequency = [6, 8, 10, 12, 14].includes(next) ? next : 10;
    if (lockedFrequency === pendingFrequency.current) return;
    pendingFrequency.current = lockedFrequency;
    radioTimers.current.forEach((timer) => window.clearTimeout(timer));
    radioTimers.current = [];
    setRadioStage('surge');
    document.documentElement.dataset.radioTransition = 'surge';
    playSfx('static');

    radioTimers.current.push(window.setTimeout(() => {
      setFrequency(pendingFrequency.current);
      setRadioStage('shift');
      document.documentElement.dataset.radioTransition = 'shift';
    }, 250));
    radioTimers.current.push(window.setTimeout(() => {
      setRadioStage('reveal');
      document.documentElement.dataset.radioTransition = 'reveal';
    }, 400));
    radioTimers.current.push(window.setTimeout(() => {
      setRadioStage('idle');
      delete document.documentElement.dataset.radioTransition;
    }, 750));
  }, []);

  useEffect(() => () => {
    radioTimers.current.forEach((timer) => window.clearTimeout(timer));
    delete document.documentElement.dataset.radioTransition;
  }, []);

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

  const panels: Panel[] = [
    { id: 'main', render: () => <MainView frequency={frequency} onTune={tune} /> },
    { id: 'socials', render: () => <SocialsView /> },
    { id: 'interests', render: (currentRoute, openInterest) => <InterestsView openId={currentRoute.tab === 'interests' ? currentRoute.interest : null} onOpen={openInterest} /> },
    { id: 'specs', render: () => <SpecsView frequency={frequency} /> },
  ];
  const visiblePanels = panels.filter((panel) => enabledTabs.some((tab) => tab.id === panel.id));

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
    const order = enabledTabs.map((tab) => tab.id);
    const from = previousTab.current;
    previousTab.current = activeId;
    const panel = panelRefs.current[activeId];
    if (!panel) return;
    const direction = from === null ? 0 : order.indexOf(activeId) > order.indexOf(from) ? 1 : -1;
    animatePanelIn(panel, direction);
  }, [activeId]);

  const scale = useStageScale();
  const staged = scale !== null;

  return (
    <div className="site-shell relative h-dvh overflow-hidden bg-lavender" data-radio-stage={radioStage}>
      <PixelBackdrop frequency={frequency} />
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
              : 'mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col pb-2 pr-2 max-[859px]:max-h-[46rem] max-[768px]:h-auto'
          }
          style={staged ? { zoom: scale } : undefined}
          data-crt-stage
          data-radio-frequency={frequency}
        >
          <div className="flex items-end justify-between gap-2">
            <PixelTabBar tabs={enabledTabs} activeId={activeId} onSelect={selectTab} />
            <SoundToggle className="flex" />
          </div>
          <section
            data-compact={activeId === 'main'}
            className={[
              'relative mt-1 flex flex-col bg-transparent text-wine',
              staged ? 'aspect-[4/3]' : 'win-section min-h-0 flex-1',
            ].join(' ')}
          >
            {/* Every tab stays mounted and is only shown/hidden, so switching is instant:
                no remount, no re-fetch, no fade. Animations live inside the pages. */}
            {/* CRT scan sweep across the window on every tab swap (decorative). */}
            <div key={activeId} aria-hidden="true" className="panel-sweep" />
            {visiblePanels.map(({ id, render }) => (
              <div
                key={id}
                ref={(el) => {
                  panelRefs.current[id] = el;
                }}
                role="tabpanel"
                hidden={id !== activeId}
                className="pixel-scroll m-1 min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 max-sm:p-3 sm:p-7"
              >
                {render(route, openInterest)}
              </div>
            ))}
          </section>
        </div>
      </main>
      <RadioStaticOverlay active={radioStage !== 'idle'} />
    </div>
  );
}

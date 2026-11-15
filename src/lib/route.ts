import { interests, tabs, type InterestId, type TabId } from '@/siteData';

export interface Route {
  tab: TabId;
  // Which Interests folder is open (null = the folder grid).
  interest: InterestId | null;
}

const enabledTabs = tabs.filter((tab) => tab.enabled);
const interestsEnabled = enabledTabs.some((tab) => tab.id === 'interests');

// Supported hashes:
//   #main  #socials  #interests  #specs      -> top-level tabs
//   #media #games #music #quotes              -> Interests tab with that folder open
//   #interests/games                          -> same as #games (also accepted)
// Anything unknown or empty falls back to the first tab.
export function parseHash(hash: string = window.location.hash): Route {
  const parts = hash
    .replace(/^#\/?/, '')
    .toLowerCase()
    .split('/')
    .filter(Boolean);
  const [first, second] = parts;

  const folder = (id: string | undefined) => interests.find((item) => item.id === id)?.id ?? null;

  if (interestsEnabled) {
    const direct = folder(first);
    if (direct) return { tab: 'interests', interest: direct };
    if (first === 'interests') return { tab: 'interests', interest: folder(second) };
  }

  const tab = enabledTabs.find((t) => t.id === first)?.id ?? enabledTabs[0]?.id ?? 'main';
  return { tab, interest: null };
}

// Canonical hash for a route: the folder name when one is open, else the tab name.
export function hashFor(route: Route): string {
  return route.tab === 'interests' && route.interest ? route.interest : route.tab;
}

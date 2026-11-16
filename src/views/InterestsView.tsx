import { lazy, Suspense, type ComponentType } from 'react';
import PixelIcon from '@/components/PixelIcon';
import RetroLoading from '@/components/RetroLoading';
import { interests, type InterestId } from '@/siteData';
import { loadGames, loadMedia, loadMusic, loadQuotes } from '@/lib/preload';

// Folder views are code-split and preloaded (idle + on hover), so opening one is
// normally instant; if the network is slow, RetroLoading shows instead of a fade.
type FolderView = ComponentType<{ onClose: () => void }>;
const FOLDERS: Record<InterestId, { View: FolderView; load: () => Promise<unknown> }> = {
  media: { View: lazy(loadMedia), load: loadMedia },
  music: { View: lazy(loadMusic), load: loadMusic },
  games: { View: lazy(loadGames), load: loadGames },
  quotes: { View: lazy(loadQuotes), load: loadQuotes },
};

// Interests is a tiny "desktop": a 2x2 grid of folders. Each folder opens as a
// full-screen overlay; its close button returns to the grid.
// Which folder is open lives in the URL hash (see App.tsx), so it survives reloads and can be shared.
interface InterestsViewProps {
  openId: InterestId | null;
  onOpen: (id: InterestId | null) => void;
}

export default function InterestsView({ openId, onOpen }: InterestsViewProps) {
  const setOpenId = onOpen;
  const open = openId ? FOLDERS[openId] : null;
  const label = interests.find((item) => item.id === openId)?.label ?? '';

  // The hub is always rendered in the same spot, so opening/closing a folder never remounts it.
  return (
    <>
      <div className="flex min-h-full flex-col gap-6">
        <p className="leading-none">&gt; select a folder to open //</p>
        <ul className="grid grid-cols-2 content-start gap-x-4 gap-y-8 max-sm:my-auto sm:grid-cols-4">
          {interests.map((item) => (
            <li key={item.id} className="flex justify-center">
              <button
                type="button"
                onClick={() => setOpenId(item.id)}
                onPointerEnter={() => void FOLDERS[item.id].load()}
                onFocus={() => void FOLDERS[item.id].load()}
                aria-label={`Open ${item.label}`}
                className="group flex w-full max-w-[150px] flex-col items-center gap-3 outline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-wine"
              >
                <PixelIcon
                  name={item.id}
                  className="h-20 w-20 transition-transform duration-150 [transition-timing-function:steps(2)] group-hover:-translate-y-1 group-active:translate-y-0 sm:h-24 sm:w-24"
                />
                <span className="px-2 py-1 font-pixel text-[10px] uppercase leading-none transition-colors duration-150 group-hover:bg-wine group-hover:text-cool-white sm:text-[11px]">
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {open && (
        <Suspense fallback={<RetroLoading label={label} onClose={() => setOpenId(null)} />}>
          <open.View onClose={() => setOpenId(null)} />
        </Suspense>
      )}
    </>
  );
}

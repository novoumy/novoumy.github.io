import { lazy, Suspense, useEffect } from 'react';
import PixelIcon from '@/components/PixelIcon';
import { interests, type InterestId } from '@/siteData';
import { loadGames, loadMedia, loadMusic, loadQuotes, loadedInterestView, type FolderView } from '@/lib/preload';

// Folder views are code-split and preloaded (idle + on hover), so opening one is
// instant; there is deliberately no loading overlay in the way.
const FOLDERS: Record<InterestId, { View: FolderView; load: () => Promise<unknown> }> = {
  media: { View: lazy(loadMedia), load: loadMedia },
  music: { View: lazy(loadMusic), load: loadMusic },
  games: { View: lazy(loadGames), load: loadGames },
  quotes: { View: lazy(loadQuotes), load: loadQuotes },
};

// Interests is a tiny "desktop": a 2x2 grid of folders. Opening one morphs the main
// window into the full-size folder window; its close button morphs it back.
// Which folder is open lives in the URL hash (see App.tsx), so it survives reloads and can be shared.
interface InterestsViewProps {
  openId: InterestId | null;
  onOpen: (id: InterestId | null) => void;
}

export default function InterestsView({ openId, onOpen }: InterestsViewProps) {
  const setOpenId = onOpen;
  const open = openId ? FOLDERS[openId] : null;

  useEffect(() => {
    if (!openId) return;
    void FOLDERS[openId].load();
  }, [openId]);

  // Closing morphs the folder window back into the main window (App runs the transition).
  const close = () => setOpenId(null);

  // The hub is always rendered in the same spot, so opening/closing a folder never remounts it.
  return (
    <>
      <div className="flex min-h-full flex-col gap-6">
        <p className="leading-none">&gt; select a folder to open //</p>
        <ul data-stagger className="grid grid-cols-2 content-start gap-x-4 gap-y-8 max-sm:my-auto sm:grid-cols-4">
          {interests.map((item) => (
            <li key={item.id} className={`accent-${item.id} flex justify-center`}>
              <button
                type="button"
                data-no-sfx
                data-folder-id={item.id}
                onClick={() => setOpenId(item.id)}
                onPointerEnter={() => void FOLDERS[item.id].load()}
                onFocus={() => void FOLDERS[item.id].load()}
                aria-label={`Open ${item.label}`}
                className="folder-btn group flex w-full max-w-[150px] flex-col items-center gap-3 outline-none outline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-wine"
              >
                <span className="pixel-icon-well pixel-icon-well-folder">
                  <PixelIcon name={item.id} tint className="folder-icon h-20 w-20 sm:h-24 sm:w-24" />
                </span>
                <span className="folder-label px-2 py-1 font-pixel text-[10px] uppercase leading-none transition-colors duration-150 group-hover:bg-rose group-hover:text-wine sm:text-[11px]">
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {open && openId && <OpenFolder View={loadedInterestView(openId) ?? open.View} onClose={close} />}
    </>
  );
}

// Already-loaded folders render straight away (no Suspense tick), so the morph has real content.
function OpenFolder({ View, onClose }: { View: FolderView; onClose: () => void }) {
  return (
    <Suspense fallback={null}>
      <View onClose={onClose} />
    </Suspense>
  );
}

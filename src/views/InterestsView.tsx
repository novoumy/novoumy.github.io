import { Component, lazy, Suspense, useEffect, useRef, type ComponentType, type ReactNode } from 'react';
import { playCloseMorph } from '@/lib/morph';
import { setFolderLoading } from '@/lib/folderLoading';
import PixelIcon from '@/components/PixelIcon';
import { interests, type InterestId } from '@/siteData';
import { loadGames, loadMedia, loadMusic, loadQuotes } from '@/lib/preload';

// Folder views are code-split and preloaded (idle + on hover), so opening one is
// instant. If a chunk is still downloading (slow device), the "reading disk" badge covers the wait
// and goes away as soon as the folder is ready.
type FolderView = ComponentType<{ onClose: () => void }>;
const FOLDERS: Record<InterestId, { View: FolderView; load: () => Promise<unknown> }> = {
  media: { View: lazy(loadMedia), load: loadMedia },
  music: { View: lazy(loadMusic), load: loadMusic },
  games: { View: lazy(loadGames), load: loadGames },
  quotes: { View: lazy(loadQuotes), load: loadQuotes },
};

// If a folder chunk fails to download, drop back to the grid instead of blanking the site.
class FolderBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    setFolderLoading(false);
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// Interests is a tiny "desktop": a 2x2 grid of folders. Opening one morphs the tile straight into
// that folder's view inside the window (no overlay); closing collapses it back into the tile.
// Which folder is open lives in the URL hash (see App.tsx), so it survives reloads and can be shared.
interface InterestsViewProps {
  openId: InterestId | null;
  onOpen: (id: InterestId | null) => void;
}

export default function InterestsView({ openId, onOpen }: InterestsViewProps) {
  const setOpenId = onOpen;
  const open = openId ? FOLDERS[openId] : null;
  const closing = useRef(false);

  useEffect(() => {
    if (!openId) {
      setFolderLoading(false);
      return;
    }
    void FOLDERS[openId].load();
  }, [openId]);

  // Collapses the folder back into its tile before it unmounts (button, header and Escape all land here).
  const close = () => {
    if (closing.current || !openId) return;
    closing.current = true;
    void playCloseMorph(openId).then(() => {
      closing.current = false;
      setOpenId(null);
    });
  };

  // The hub is always rendered in the same spot, so opening/closing a folder never remounts it.
  return (
    <>
      <div data-folder-hub className="flex min-h-full flex-col gap-6">
        <p className="leading-none">&gt; select a folder to open //</p>
        <ul data-stagger className="grid grid-cols-2 content-start gap-x-4 gap-y-8 max-sm:my-auto sm:grid-cols-4">
          {interests.map((item) => (
            <li key={item.id} className={`accent-${item.id} flex justify-center`}>
              <button
                type="button"
                data-disk-target
                data-folder-tile={item.id}
                onClick={() => setOpenId(item.id)}
                onPointerEnter={() => void FOLDERS[item.id].load()}
                onFocus={() => void FOLDERS[item.id].load()}
                aria-label={`Open ${item.label}`}
                className="group flex w-full max-w-[150px] flex-col items-center gap-3 outline-none outline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-wine"
              >
                <PixelIcon
                  name={item.id}
                  tint
                  className="h-20 w-20 transition-transform duration-150 [transition-timing-function:steps(2)] group-hover:-translate-y-1 group-active:translate-y-0 sm:h-24 sm:w-24"
                />
                <span className="px-2 py-1 font-pixel text-[10px] uppercase leading-none transition-colors duration-150 group-hover:bg-rose group-hover:text-wine sm:text-[11px]">
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {open && (
        <FolderBoundary key={openId} onFail={() => setOpenId(null)}>
          <Suspense fallback={null}>
            <open.View onClose={close} />
          </Suspense>
        </FolderBoundary>
      )}
    </>
  );
}

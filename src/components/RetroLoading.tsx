import { useEffect } from 'react';

// Crisp retro loader for a folder that is still downloading. It stays invisible for
// the first 150ms (so a preloaded/instant open never flashes it), then appears in a
// single hard frame: no opacity fade.
export default function RetroLoading({ label, onClose, accent }: { label: string; onClose: () => void; accent?: string | undefined }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`retro-theme r-desk retro-loading ${accent ? `accent-${accent}` : ''} fixed inset-0 z-[100] flex h-dvh w-screen items-center justify-center p-6`}
    >
      <div className="r-window pixel-frame flex w-full max-w-sm flex-col">
        <p className="r-titlebar px-4 py-3 font-pixel text-[10px] uppercase sm:text-[11px]">&gt; loading {label}</p>
        <div className="flex flex-col gap-3 px-5 py-6">
          <div className="h-5 w-full border-2 border-wine p-[2px]" aria-hidden="true">
            <div className="retro-loading-bar h-full bg-accent" />
          </div>
          <p className="r-caret text-[22px] leading-none text-r-dim">reading disk</p>
        </div>
      </div>
    </div>
  );
}

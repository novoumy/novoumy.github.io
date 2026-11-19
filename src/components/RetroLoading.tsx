import { useEffect } from 'react';

// Crisp retro loader for a folder that is still downloading. It stays invisible for
// the first 150ms (so a preloaded/instant open never flashes it), then appears in a
// single hard frame: no opacity fade.
export default function RetroLoading({ label, onClose, accent }: { label: string; onClose: () => void; accent?: string }) {
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
      className={`retro-dark retro-loading ${accent ? `accent-${accent}` : ''} fixed inset-0 z-[100] flex h-dvh w-screen flex-col items-center justify-center gap-5 bg-[#1e1e1e] text-accent`}
    >
      <p className="font-pixel text-[11px] uppercase sm:text-[14px]">&gt; loading {label}</p>
      <div className="h-4 w-48 border-2 border-accent p-[2px]" aria-hidden="true">
        <div className="retro-loading-bar h-full bg-accent" />
      </div>
    </div>
  );
}

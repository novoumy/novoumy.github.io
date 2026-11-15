import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

interface RetroOverlayProps {
  label: string; // e.g. 'Game library' (used for the title and aria labels)
  meta?: string; // e.g. '5 games'
  onClose: () => void;
  children: ReactNode;
  // Optional launcher-style detail panel that slides in from the left.
  toolbar?: ReactNode; // search / filter / sort strip under the header
  side?: ReactNode;
  sideOpen?: boolean;
}

// Full-viewport retro page shared by /games and /quotes. Same architecture as the
// media and music libraries: portalled into <body>, header bar on top, scrolling body below.
export default function RetroOverlay({ label, meta, onClose, children, toolbar, side, sideOpen = false }: RetroOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLElement>(null);

  // A closed panel stays out of the tab order and away from screen readers.
  useEffect(() => {
    sideRef.current?.toggleAttribute('inert', !sideOpen);
  }, [sideOpen]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'Tab' && dialogRef.current) {
        const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (node) => !node.closest('[inert]'),
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && (active === first || active === dialogRef.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      className="retro-dark animate-tab-in fixed inset-0 z-[100] flex h-dvh w-screen flex-col bg-[#1e1e1e] text-[#d4d4d4] outline-none"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-[#7d5560] bg-[#1e1e1e] px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8">
        <div onClick={onClose} className="flex min-w-0 cursor-pointer items-baseline gap-3 sm:gap-4">
          <h2 className="min-w-0 truncate text-[11px] uppercase sm:text-[14px]">
            <button
              type="button"
              aria-label={`Close ${label.toLowerCase()}`}
              className="r-glow cursor-pointer truncate border-0 bg-transparent p-0 text-left uppercase text-[#CC97A3] outline-none [font:inherit] focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-4"
            >
              &gt; {label}
            </button>
          </h2>
          {meta && <span className="hidden shrink-0 font-pixel text-[8px] uppercase text-[#8a8a8a] sm:inline">// {meta}</span>}
        </div>
        <button type="button" onClick={onClose} aria-label={`Close ${label.toLowerCase()}`} className="r-btn">
          <X size={14} strokeWidth={3} aria-hidden="true" />
          <span>Close</span>
        </button>
      </header>

      {toolbar && (
        <div className="shrink-0 border-b-2 border-[#7d5560] bg-[#1e1e1e] px-4 py-4 sm:px-8">{toolbar}</div>
      )}

      <div className="relative flex min-h-0 flex-1">
        {side && (
          <aside
            ref={sideRef}
            aria-hidden={!sideOpen}
            className={[
              'pixel-scroll absolute inset-y-0 left-0 z-20 w-full overflow-y-auto overscroll-contain border-r-2 border-[#7d5560] bg-[#1e1e1e] transition-transform duration-300 ease-out sm:w-[420px]',
              sideOpen ? 'translate-x-0' : '-translate-x-full',
            ].join(' ')}
          >
            {side}
          </aside>
        )}
        <div
          data-side={sideOpen ? 'open' : 'closed'}
          className="pixel-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#1e1e1e] px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 transition-[padding] duration-300 ease-out sm:px-8 lg:data-[side=open]:pl-[452px]"
        >
          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

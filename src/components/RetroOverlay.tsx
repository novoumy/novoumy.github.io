import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import PixelIcon from '@/components/PixelIcon';
import type { InterestId } from '@/siteData';

const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

interface RetroOverlayProps {
  label: string;
  meta?: string | undefined;
  onClose: () => void;
  children: ReactNode;
  toolbar?: ReactNode | undefined;
  side?: ReactNode | undefined;
  sideOpen?: boolean | undefined;
  accent?: InterestId | undefined;
  onBack?: (() => void) | undefined;
}

export default function RetroOverlay({ label, meta, onClose, children, toolbar, side, sideOpen = false, accent, onBack }: RetroOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLElement>(null);

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
        (onBack ?? onClose)();
        return;
      }
      if (event.key === 'Tab' && dialogRef.current) {
        const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (node) => !node.closest('[inert]'),
        );
        if (nodes.length === 0) return;
        const first = nodes[0]!;
        const last = nodes[nodes.length - 1]!;
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
  }, [onClose, onBack]);

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      className={[
        'retro-theme r-desk fixed inset-0 z-[100] flex h-dvh w-screen p-3 pb-5 pr-5 outline-none sm:p-6 sm:pb-8 sm:pr-8 lg:p-8 lg:pb-10 lg:pr-10',
        'pt-[max(0.75rem,env(safe-area-inset-top))] max-sm:pb-[max(1.25rem,env(safe-area-inset-bottom))]',
        accent ? `accent-${accent}` : '',
      ].join(' ')}
    >
      <div className="r-window pixel-frame animate-overlay-in relative mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col bg-[var(--r-bg,var(--cool-white))]">
        <header className="r-titlebar flex shrink-0 items-center justify-between gap-3 px-3 py-2.5 sm:px-5 sm:py-3">
          <div onClick={onClose} className="flex min-w-0 cursor-pointer items-center gap-3 sm:gap-4">
            {accent && (
              <span className="shrink-0 bg-cool-white p-1 max-sm:hidden" aria-hidden="true">
                <PixelIcon name={accent} tint className="block h-6 w-6" />
              </span>
            )}
            <h2 className="min-w-0 truncate text-[10px] uppercase sm:text-[13px]">
              <button
                type="button"
                aria-label={`Close ${label.toLowerCase()}`}
                className="cursor-pointer truncate border-0 bg-transparent p-0 text-left uppercase text-cool-white outline-none [font:inherit] focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-4"
              >
                &gt; {label}
              </button>
            </h2>
            {meta && <span className="hidden shrink-0 font-pixel text-[8px] uppercase text-rose sm:inline">// {meta}</span>}
          </div>
          <button type="button" onClick={onClose} aria-label={`Close ${label.toLowerCase()}`} className="r-close shrink-0">
            <X size={13} strokeWidth={3} aria-hidden="true" />
            <span>Close</span>
          </button>
        </header>

        {toolbar && <div className="shrink-0 border-b-4 border-rose/70 bg-r-panel px-4 py-4 max-sm:py-3 sm:px-7">{toolbar}</div>}

        <div className="relative flex min-h-0 flex-1">
          {side && (
            <aside
              ref={sideRef}
              aria-hidden={!sideOpen}
              className={[
                'pixel-scroll absolute inset-y-0 left-0 z-20 w-full overflow-y-auto overscroll-contain border-r-4 border-rose bg-r-bg transition-transform duration-300 ease-out sm:w-[420px]',
                sideOpen ? 'translate-x-0' : '-translate-x-full',
              ].join(' ')}
            >
              {side}
            </aside>
          )}
          <div
            data-side={sideOpen ? 'open' : 'closed'}
            className="pixel-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain bg-r-bg px-5 pb-8 pt-6 transition-[padding] duration-300 ease-out sm:px-8 lg:data-[side=open]:pl-[452px]"
          >
            <div className="w-full">{children}</div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
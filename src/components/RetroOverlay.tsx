import { useContext, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import PixelIcon from '@/components/PixelIcon';
import { OverlayHostContext } from '@/components/OverlayHost';
import { setFolderLoading } from '@/lib/folderLoading';
import { playOpenMorph } from '@/lib/morph';
import type { InterestId } from '@/siteData';

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
  // True while the folder's data is still loading; the "reading disk" badge stays until it is false.
  loading?: boolean | undefined;
}

// A folder view. It is no longer a page-wide overlay: it renders inside the main window and
// morphs out of its folder tile (see lib/morph.ts).
export default function RetroOverlay({ label, meta, onClose, children, toolbar, side, sideOpen = false, accent, onBack, loading = false }: RetroOverlayProps) {
  const host = useContext(OverlayHostContext);
  const rootRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    sideRef.current?.toggleAttribute('inert', !sideOpen);
  }, [sideOpen]);

  // Expand out of the tile before the first paint.
  useLayoutEffect(() => {
    if (rootRef.current && accent) playOpenMorph(rootRef.current, accent);
  }, [accent]);

  // Content is ready: dismiss the loading badge right away (after one paint so the view is really on screen).
  useEffect(() => {
    if (loading) return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setFolderLoading(false));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [loading]);

  // Never leave the badge behind when the folder goes away.
  useEffect(() => () => setFolderLoading(false), []);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    rootRef.current?.focus({ preventScroll: true });
    return () => {
      previouslyFocused?.focus?.({ preventScroll: true });
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.blur();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        (onBack ?? onClose)();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, onBack]);

  const node = (
    <div
      ref={rootRef}
      role="region"
      aria-label={label}
      tabIndex={-1}
      data-folder-overlay
      className={['retro-theme absolute inset-0 z-20 flex min-h-0 outline-none', accent ? `accent-${accent}` : ''].join(' ')}
    >
      <div data-morph-window className="r-window relative flex min-h-0 w-full flex-1 flex-col bg-[var(--r-bg,var(--cool-white))]">
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
            className="pixel-scroll min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-r-bg px-5 pb-8 pt-6 transition-[padding] duration-300 ease-out sm:px-8 lg:data-[side=open]:pl-[452px]"
          >
            <div className="min-w-0 w-full max-w-full">{children}</div>
          </div>
        </div>
      </div>
      {/* Solid colour that grows out of the folder tile first, then dissolves into the content. */}
      <div data-morph-skin aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 bg-rose opacity-0" />
    </div>
  );

  return host ? createPortal(node, host) : node;
}

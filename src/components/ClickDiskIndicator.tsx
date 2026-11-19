import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type Pop = {
  id: number;
  x: number;
  y: number;
  center: boolean;
};

const INTERACTIVE_SELECTOR = [
  'button',
  'a[href]',
  '[role="tab"]',
  '[role="button"]',
  'select',
  'summary',
  'label',
  '[data-disk-target]',
].join(',');

const OPT_OUT_SELECTOR = '[data-no-loading-disk], [data-no-disk], input, textarea';

const DURATION_MS = 850;

export default function ClickDiskIndicator() {
  const [pops, setPops] = useState<Pop[]>([]);

  useEffect(() => {
    let nextId = 1;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      const raw = event.target instanceof Element ? event.target : null;
      const target = raw?.closest(INTERACTIVE_SELECTOR);
      if (!target || target.closest(OPT_OUT_SELECTOR)) return;
      if (target instanceof HTMLButtonElement && target.disabled) return;

      const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
      const center = event.pointerType === 'touch' || event.pointerType === 'pen' || coarse;
      const id = nextId++;
      const pop: Pop = { id, x: event.clientX, y: event.clientY, center };

      setPops((current) => [...current.slice(-3), pop]);
      window.setTimeout(() => {
        setPops((current) => current.filter((item) => item.id !== id));
      }, DURATION_MS);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, []);

  if (pops.length === 0) return null;

  return createPortal(
    <>
      {pops.map((pop) => (
        <div
          key={pop.id}
          className={pop.center ? 'reading-disk-pop reading-disk-pop-center' : 'reading-disk-pop'}
          style={pop.center ? undefined : { left: pop.x, top: pop.y }}
          aria-hidden="true"
        >
          <span className="reading-disk-icon" />
          <span className="reading-disk-text">reading disk</span>
        </div>
      ))}
    </>,
    document.body,
  );
}

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DISK_READY_EVENT } from '@/lib/diskReady';

type Pop = {
  id: number;
  x: number;
  y: number;
  center: boolean;
  leaving: boolean;
};

// Only the four Interests folder icons opt in; navigation tabs and every other
// control stay silent.
const DISK_TARGET_SELECTOR = '[data-disk-target]';

const FADE_MS = 160; // quick fade once the folder is ready
const SAFETY_MS = 12000; // never stay stuck, even if a folder never reports ready

export default function ClickDiskIndicator() {
  const [pops, setPops] = useState<Pop[]>([]);

  useEffect(() => {
    let nextId = 1;
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
    };

    const dismiss = (ids?: number[]) => {
      setPops((current) =>
        current.map((pop) => (!ids || ids.includes(pop.id) ? { ...pop, leaving: true } : pop)),
      );
      later(() => setPops((current) => current.filter((pop) => !pop.leaving)), FADE_MS);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      const raw = event.target instanceof Element ? event.target : null;
      const target = raw?.closest(DISK_TARGET_SELECTOR);
      if (!target) return;
      if (target instanceof HTMLButtonElement && target.disabled) return;

      const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
      const center = event.pointerType === 'touch' || event.pointerType === 'pen' || coarse;
      const id = nextId++;
      setPops((current) => [...current.slice(-3), { id, x: event.clientX, y: event.clientY, center, leaving: false }]);
      later(() => dismiss([id]), SAFETY_MS);
    };

    const onReady = () => dismiss();

    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener(DISK_READY_EVENT, onReady);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener(DISK_READY_EVENT, onReady);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  if (pops.length === 0) return null;

  return createPortal(
    <>
      {pops.map((pop) => (
        <div
          key={pop.id}
          className={[
            'reading-disk-pop',
            pop.center ? 'reading-disk-pop-center' : '',
            pop.leaving ? 'reading-disk-pop-leaving' : '',
          ].join(' ')}
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

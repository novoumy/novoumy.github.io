import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { setFolderLoading, useFolderLoading } from '@/lib/folderLoading';

type Origin = { x: number; y: number; center: boolean };

// Only the four Interests folder icons opt in; navigation tabs and every other
// control stay silent.
const DISK_TARGET_SELECTOR = '[data-disk-target]';

// Folders that are already preloaded open instantly - don't flash the badge for those.
const SHOW_DELAY_MS = 140;
const LEAVE_MS = 180;

// "reading disk" badge: appears when a folder is clicked and stays exactly as long as the folder
// is loading. It is dismissed by the folder itself (RetroOverlay) once its content is ready.
export default function ClickDiskIndicator() {
  const loading = useFolderLoading();
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // A real click (not pointerdown) so a touch-scroll that starts on a folder never leaves the badge behind.
    const onClick = (event: MouseEvent) => {
      const raw = event.target instanceof Element ? event.target : null;
      const target = raw?.closest(DISK_TARGET_SELECTOR);
      if (!target) return;
      if (target instanceof HTMLButtonElement && target.disabled) return;

      const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
      // Keyboard activation reports 0,0: show the badge in the centre instead.
      const center = coarse || (event.clientX === 0 && event.clientY === 0);
      setOrigin({ x: event.clientX, y: event.clientY, center });
      setFolderLoading(true);
    };
    const onHashChange = () => setFolderLoading(false);

    document.addEventListener('click', onClick, true);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  useEffect(() => {
    if (loading) {
      setLeaving(false);
      const id = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
      return () => window.clearTimeout(id);
    }
    // Loading finished: fade out quickly, then unmount.
    if (!visible) return;
    setLeaving(true);
    const id = window.setTimeout(() => {
      setVisible(false);
      setLeaving(false);
    }, LEAVE_MS);
    return () => window.clearTimeout(id);
  }, [loading, visible]);

  if (!visible || !origin) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className={[
        'reading-disk-pop',
        origin.center ? 'reading-disk-pop-center' : '',
        leaving ? 'reading-disk-leaving' : '',
      ].join(' ')}
      style={origin.center ? undefined : { left: origin.x, top: origin.y }}
    >
      <span className="reading-disk-icon" aria-hidden="true" />
      <span className="reading-disk-text">reading disk</span>
    </div>,
    document.body,
  );
}

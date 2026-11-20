import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { useAudio, VOLUME_MAX } from '@/audio/AudioProvider';
import { playSfx } from '@/audio/sfx';

const CLOSE_DELAY_MS = 450; // grace period after the mouse leaves
const TOUCH_CLOSE_MS = 3500; // touch: auto-hide after the last interaction

const isTouchOnly = () => window.matchMedia('(hover: none)').matches;

type SoundToggleProps = { className?: string; variant?: 'default' | 'folder' };

export default function SoundToggle({ className = '', variant = 'default' }: SoundToggleProps) {
  const { muted, toggleMuted, volume, setVolume, blocked } = useAudio();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const lastVolumeSfxAt = useRef(0);

  const silent = muted || volume === 0;
  const Icon = silent ? VolumeX : volume < VOLUME_MAX / 2 ? Volume1 : Volume2;
  // Browsers refuse to autoplay sound until the visitor interacts, so nudge them.
  const showHint = blocked && !silent && !open;

  const clearTimer = () => window.clearTimeout(timer.current);
  const closeSoon = (ms: number) => {
    clearTimer();
    timer.current = window.setTimeout(() => setOpen(false), ms);
  };
  const openNow = () => {
    clearTimer();
    setOpen(true);
  };

  useEffect(() => clearTimer, []);

  // Tapping anywhere outside (or pressing Escape) closes the slider.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onButtonClick = () => {
    // Touch: the first tap reveals the slider, a tap while it is open mutes/unmutes.
    if (isTouchOnly() && !open) {
      openNow();
      closeSoon(TOUCH_CLOSE_MS);
      return;
    }
    const willUnmute = muted || volume === 0;
    playSfx(willUnmute ? 'unmute' : 'mute', 0, true);
    toggleMuted();
    if (isTouchOnly()) closeSoon(TOUCH_CLOSE_MS);
  };

  const shown = muted ? 0 : volume;
  const fill = (shown / VOLUME_MAX) * 100;

  return (
    <div
      ref={rootRef}
      data-no-sfx
      className={['volume-root relative shrink-0', className].join(' ')}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') openNow();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') closeSoon(CLOSE_DELAY_MS);
      }}
      onFocus={openNow}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node | null)) closeSoon(CLOSE_DELAY_MS);
      }}
    >
      <div className="volume-panel pixel-tile bg-cool-white text-wine" data-open={open} aria-hidden={!open}>
        <div className="volume-panel-inner">
          <input
            type="range"
            className="volume-range"
            min={0}
            max={VOLUME_MAX}
            step={5}
            value={shown}
            tabIndex={open ? 0 : -1}
            aria-label="Volume"
            aria-valuetext={`${shown}%`}
            style={{ '--fill': `${fill}%` } as CSSProperties}
            onChange={(e) => {
              const next = Number(e.target.value);
              setVolume(next);
              const now = performance.now();
              if (now - lastVolumeSfxAt.current > 90 || next === 0 || next === VOLUME_MAX) {
                playSfx('volume', next, true);
                lastVolumeSfxAt.current = now;
              }
              if (isTouchOnly()) closeSoon(TOUCH_CLOSE_MS);
            }}
            onPointerUp={() => playSfx('volume', muted ? 0 : volume, true)}
            onKeyUp={() => playSfx('volume', muted ? 0 : volume, true)}
          />
          <span className="volume-readout font-pixel text-[8px] leading-none">{shown}%</span>
        </div>
      </div>

      <button
        type="button"
        data-no-sfx
        aria-pressed={silent}
        aria-label={silent ? 'Unmute sound' : 'Mute sound'}
        title={silent ? 'Sound off' : `Volume ${shown}%`}
        onClick={onButtonClick}
        className={[
          'pixel-tile pixel-tile-interactive flex shrink-0 items-center justify-center gap-2 px-2.5 py-2 text-cool-white hover:bg-rose hover:text-wine min-[860px]:px-3',
          variant === 'folder' ? 'bg-[#6B2B32]' : 'bg-lavender',
        ].join(' ')}
      >
        {showHint && <span className="blink-arrow hidden font-pixel text-[8px] uppercase leading-none min-[860px]:inline">Tap anywhere for sound</span>}
        <Icon size={16} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </div>
  );
}

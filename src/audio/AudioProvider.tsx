import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { audio } from '@/siteData';
import { playMenuBlip, setSfxLevel } from '@/audio/sfx';

// Slider scale: 100 is the new baseline, which is HALF of the old physical output.
// 200 equals the old (pre-slider) output. 0 is silent.
export const VOLUME_MIN = 0;
export const VOLUME_MAX = 200;
export const VOLUME_DEFAULT = 100;
const VOLUME_KEY = 'novoumy:volume';

// UI percent -> multiplier on the original output (100% -> 0.5, 200% -> 1.0).
const toGain = (percent: number) => Math.min(VOLUME_MAX, Math.max(VOLUME_MIN, percent)) / VOLUME_MAX;

function loadVolume(): number {
  try {
    const raw = window.localStorage.getItem(VOLUME_KEY);
    const value = raw === null ? NaN : Number(raw);
    if (Number.isFinite(value)) return Math.min(VOLUME_MAX, Math.max(VOLUME_MIN, Math.round(value)));
  } catch {
    // Storage can be unavailable (private mode); fall back to the default.
  }
  return VOLUME_DEFAULT;
}

interface AudioContextValue {
  muted: boolean;
  toggleMuted: () => void;
  // 0..200 (see above). Setting it above 0 also unmutes.
  volume: number;
  setVolume: (percent: number) => void;
  // True while the browser is refusing to autoplay and is waiting for a tap/click.
  blocked: boolean;
}

const AudioStateContext = createContext<AudioContextValue | null>(null);

const SFX_TARGETS = 'button, a, [role="tab"]';
const SFX_OPT_OUT = '[data-no-sfx]';

export function AudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [volume, setVolumeState] = useState(loadVolume);
  const mutedRef = useRef(muted);
  const volumeRef = useRef(volume);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    mutedRef.current = muted;
    if (bgmRef.current) bgmRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    volumeRef.current = volume;
    setSfxLevel(toGain(volume));
    if (bgmRef.current) bgmRef.current.volume = audio.bgmVolume * toGain(volume);
    try {
      window.localStorage.setItem(VOLUME_KEY, String(volume));
    } catch {
      // ignore
    }
  }, [volume]);

  useEffect(() => {
    const bgm = new Audio(audio.bgmSrc);
    bgm.loop = true;
    bgm.preload = 'auto';
    bgm.volume = audio.bgmVolume * toGain(volumeRef.current);
    bgm.muted = mutedRef.current;
    bgmRef.current = bgm;

    // Music should only play while the page is visible AND the window is focused.
    let visible = document.visibilityState === 'visible';
    let focused = true;

    const sync = () => {
      if (visible && focused) {
        // Rejected when the browser still blocks autoplay; a later gesture retries.
        bgm.play().catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'NotAllowedError') setBlocked(true);
        });
      } else {
        bgm.pause();
      }
    };

    // Autoplay is blocked until the visitor really interacts with the page. Only
    // some events count as that (pointerdown/touchstart on mobile do not), so we
    // listen to all of them and keep listening: the handler is a cheap no-op once
    // the music is playing, and it also recovers playback if the browser
    // suspended it while the page was in the background.
    const gestures = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'] as const;
    const onGesture = () => {
      if (bgm.paused) sync();
    };
    gestures.forEach((name) => window.addEventListener(name, onGesture, { capture: true, passive: true }));

    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
      sync();
    };
    const onFocus = () => {
      focused = true;
      sync();
    };
    const onBlur = () => {
      focused = false;
      sync();
    };
    const onPageHide = () => bgm.pause();
    const onPageShow = () => {
      visible = document.visibilityState === 'visible';
      sync();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);
    // If the first play() raced with loading, try again once data is ready.
    bgm.addEventListener('canplay', sync);
    const onPlaying = () => setBlocked(false);
    bgm.addEventListener('playing', onPlaying);

    sync();

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const control = target?.closest(SFX_TARGETS);
      if (!control || control.closest(SFX_OPT_OUT) || mutedRef.current || volumeRef.current <= 0) return;
      playMenuBlip();
    };
    document.addEventListener('click', onClick, true);

    return () => {
      gestures.forEach((name) => window.removeEventListener(name, onGesture, { capture: true }));
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
      bgm.removeEventListener('canplay', sync);
      bgm.removeEventListener('playing', onPlaying);
      document.removeEventListener('click', onClick, true);
      bgm.pause();
      bgmRef.current = null;
    };
  }, []);

  // Unmuting from a 0% slider would still be silent, so restore the baseline.
  const toggleMuted = () => {
    if (muted && volume === 0) setVolumeState(VOLUME_DEFAULT);
    setMuted((value) => !value);
  };

  const setVolume = (percent: number) => {
    setVolumeState(Math.min(VOLUME_MAX, Math.max(VOLUME_MIN, Math.round(percent))));
    if (percent > 0) setMuted(false);
  };

  return (
    <AudioStateContext.Provider value={{ muted, toggleMuted, volume, setVolume, blocked }}>
      {children}
    </AudioStateContext.Provider>
  );
}

export function useAudio() {
  const value = useContext(AudioStateContext);
  if (!value) throw new Error('useAudio must be used inside AudioProvider');
  return value;
}

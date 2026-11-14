import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { audio } from '@/siteData';
import { playMenuBlip } from '@/audio/sfx';

interface AudioContextValue {
  muted: boolean;
  toggleMuted: () => void;
}

const AudioStateContext = createContext<AudioContextValue | null>(null);

const SFX_TARGETS = 'button, a, [role="tab"]';
const SFX_OPT_OUT = '[data-no-sfx]';

export function AudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(muted);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    mutedRef.current = muted;
    if (bgmRef.current) bgmRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    const bgm = new Audio(audio.bgmSrc);
    bgm.loop = true;
    bgm.preload = 'auto';
    bgm.volume = audio.bgmVolume;
    bgm.muted = mutedRef.current;
    bgmRef.current = bgm;

    // Music should only play while the page is visible AND the window is focused.
    let visible = document.visibilityState === 'visible';
    let focused = true;

    const sync = () => {
      if (visible && focused) {
        // Rejected when the browser still blocks autoplay; a later gesture retries.
        bgm.play().catch(() => undefined);
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

    sync();

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const control = target?.closest(SFX_TARGETS);
      if (!control || control.closest(SFX_OPT_OUT) || mutedRef.current) return;
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
      document.removeEventListener('click', onClick, true);
      bgm.pause();
      bgmRef.current = null;
    };
  }, []);

  const toggleMuted = () => setMuted((value) => !value);

  return (
    <AudioStateContext.Provider value={{ muted, toggleMuted }}>{children}</AudioStateContext.Provider>
  );
}

export function useAudio() {
  const value = useContext(AudioStateContext);
  if (!value) throw new Error('useAudio must be used inside AudioProvider');
  return value;
}

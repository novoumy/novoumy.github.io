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
    bgm.volume = audio.bgmVolume;
    bgm.muted = mutedRef.current;
    bgmRef.current = bgm;

    // Browsers block audio until the visitor interacts with the page, so try
    // right away and fall back to the first real gesture (click, tap or key).
    const gestures = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'] as const;
    const removeUnlock = () => gestures.forEach((name) => window.removeEventListener(name, unlock));
    function unlock() {
      bgm.play().then(removeUnlock, () => undefined);
    }
    gestures.forEach((name) => window.addEventListener(name, unlock));
    unlock();

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const control = target?.closest(SFX_TARGETS);
      if (!control || control.closest(SFX_OPT_OUT) || mutedRef.current) return;
      playMenuBlip();
    };
    document.addEventListener('click', onClick, true);

    return () => {
      removeUnlock();
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

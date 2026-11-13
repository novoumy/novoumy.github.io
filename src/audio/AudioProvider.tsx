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

    // Browsers block audio until the visitor interacts with the page.
    const unlock = () => {
      void bgm.play().catch(() => undefined);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const control = target?.closest(SFX_TARGETS);
      if (!control || control.closest(SFX_OPT_OUT) || mutedRef.current) return;
      playMenuBlip();
    };
    document.addEventListener('click', onClick, true);

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
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

import { Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '@/audio/AudioProvider';

export default function SoundToggle({ className = '' }: { className?: string }) {
  const { muted, toggleMuted, blocked } = useAudio();
  const Icon = muted ? VolumeX : Volume2;
  // Browsers refuse to autoplay sound until the visitor interacts, so nudge them.
  const showHint = blocked && !muted;

  return (
    <button
      type="button"
      data-no-sfx
      aria-pressed={muted}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      title={muted ? 'Sound off' : 'Sound on'}
      onClick={toggleMuted}
      className={[
        'pixel-tile pixel-tile-interactive shrink-0 items-center justify-center gap-2 bg-lavender px-2.5 py-2 text-cool-white hover:bg-rose hover:text-wine min-[860px]:px-3',
        className,
      ].join(' ')}
    >
      {showHint && (
        <span className="blink-arrow font-pixel text-[8px] uppercase leading-none">Tap for sound</span>
      )}
      <Icon size={16} strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}

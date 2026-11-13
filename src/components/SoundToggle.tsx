import { Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '@/audio/AudioProvider';

export default function SoundToggle() {
  const { muted, toggleMuted } = useAudio();
  const Icon = muted ? VolumeX : Volume2;

  return (
    <button
      type="button"
      data-no-sfx
      aria-pressed={muted}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      title={muted ? 'Sound off' : 'Sound on'}
      onClick={toggleMuted}
      className="pixel-tile pixel-tile-interactive flex shrink-0 items-center justify-center bg-lavender px-3 py-2 text-cool-white hover:bg-rose hover:text-wine"
    >
      <Icon size={16} strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}

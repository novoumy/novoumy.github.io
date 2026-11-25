import SmoothIcon from '@/components/SmoothIcon';

export type SpeakerLevel = 'muted' | 'low' | 'high';

// Smooth vector speaker for the sound button: muted (x), quiet (one wave) or loud (three waves).
const NAME: Record<SpeakerLevel, string> = {
  muted: 'speaker-muted',
  low: 'speaker-low',
  high: 'speaker-high',
};

export default function PixelSpeaker({ level, size = 24, className }: { level: SpeakerLevel; size?: number; className?: string }) {
  return <SmoothIcon name={NAME[level]} size={size} className={className} />;
}

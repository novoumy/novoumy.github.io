import PixelIcon from '@/components/PixelIcon';
import SmoothIcon from '@/components/SmoothIcon';
import { hasSmoothIcon } from '@/lib/smoothIcons';

interface SpecPixelIconProps {
  name: string;
  size?: number;
  className?: string;
}

// PC part / peripheral icons are smooth vectors; anything unknown falls back to the pixel registry.
export default function SpecPixelIcon({ name, size = 48, className }: SpecPixelIconProps) {
  if (hasSmoothIcon(name)) return <SmoothIcon name={name} size={size} className={className} />;
  return <PixelIcon name={name} size={size} className={className} />;
}

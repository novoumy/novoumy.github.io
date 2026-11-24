import PixelIcon from '@/components/PixelIcon';
import type { TabIconName } from '@/siteData';

interface PixelTabIconProps {
  name: TabIconName;
  size?: number;
  className?: string;
}

export default function PixelTabIcon({ name, size = 24, className }: PixelTabIconProps) {
  return <PixelIcon name={name} size={size} className={className} />;
}

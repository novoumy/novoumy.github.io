import SmoothIcon from '@/components/SmoothIcon';
import type { TabIconName } from '@/siteData';

interface PixelTabIconProps {
  name: TabIconName;
  size?: number;
  className?: string;
}

// Top tab icons are smooth vector glyphs (Font Awesome Free), keyed by each tab's existing icon name.
const TAB_ICON: Record<TabIconName, string> = {
  user: 'tab-main',
  'comment-text': 'tab-socials',
  save: 'tab-interests',
  cpu: 'tab-specs',
};

export default function PixelTabIcon({ name, size = 24, className }: PixelTabIconProps) {
  return <SmoothIcon name={TAB_ICON[name]} size={size} className={className} />;
}

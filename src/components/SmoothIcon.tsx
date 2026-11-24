import { memo } from 'react';
import { SMOOTH_ICONS } from '@/lib/smoothIcons';

interface SmoothIconProps {
  name: string;
  size?: number;
  className?: string;
}

/**
 * Smooth, resolution-independent vector icon (socials + PC parts/peripherals).
 * Uses currentColor, so it takes the tile's text colour just like the pixel icons did.
 */
function SmoothIcon({ name, size = 48, className }: SmoothIconProps) {
  const icon = SMOOTH_ICONS[name];
  if (!icon) return null;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={icon.viewBox}
      width={size}
      height={size}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={icon.strokeWidth}
      strokeLinejoin="round"
      strokeLinecap="round"
      shapeRendering="geometricPrecision"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={icon.d} />
    </svg>
  );
}

export default memo(SmoothIcon);

import { memo } from 'react';
import type { InterestId } from '@/siteData';
import { INTEREST_FOLDER_ICONS } from '@/lib/interestFolderIcons';
import { pathData } from '@/lib/pixelPaths';

interface InterestFolderIconProps {
  name: InterestId;
  size?: number;
  className?: string;
}

const SPRITE_PATHS = new Map<InterestId, { body: string; accent: string }>();

function InterestFolderIcon({ name, size = 80, className }: InterestFolderIconProps) {
  let paths = SPRITE_PATHS.get(name);
  if (!paths) {
    const rows = INTEREST_FOLDER_ICONS[name];
    paths = { body: pathData(rows, '#'), accent: pathData(rows, 'o') };
    SPRITE_PATHS.set(name, paths);
  }

  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={paths.accent} fill="var(--r-accent, var(--rose))" />
      <path d={paths.body} fill="var(--wine)" />
    </svg>
  );
}

export default memo(InterestFolderIcon);

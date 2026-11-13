import type { ReactNode } from 'react';

interface PixelBadgeProps {
  children: ReactNode;
}

export default function PixelBadge({ children }: PixelBadgeProps) {
  return (
    <span className="inline-block bg-wine px-2 py-1 font-pixel text-[8px] uppercase leading-none text-cool-white">
      {children}
    </span>
  );
}

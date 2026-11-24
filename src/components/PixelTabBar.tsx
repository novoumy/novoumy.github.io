import { useState } from 'react';
import type { TabConfig, TabId } from '@/siteData';
import PixelTabIcon from '@/components/PixelTabIcon';

interface PixelTabBarProps {
  tabs: TabConfig[];
  activeId: TabId;
  onSelect: (id: TabId) => void;
}

// All four tabs always show their icon and title, on every screen size.
export default function PixelTabBar({ tabs, activeId, onSelect }: PixelTabBarProps) {
  // A pixel shockwave is triggered only when navigating to a different tab.
  const [burst, setBurst] = useState<{ id: TabId; n: number } | null>(null);
  return (
    <div
      role="tablist"
      aria-label="Main navigation"
      className="relative z-10 flex w-full min-w-0 flex-1 items-stretch gap-2 overflow-visible max-[859px]:w-auto max-[859px]:flex-none max-[859px]:gap-1 min-[860px]:w-auto min-[860px]:flex-none min-[860px]:items-end min-[860px]:gap-1 min-[860px]:pl-1 min-[860px]:pr-0"
>
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-current={active ? 'page' : undefined}
            // The active tab is a no-op, so it must not play the menu blip either.
            data-no-sfx={active ? '' : undefined}
            aria-label={tab.label}
            onClick={() => {
              // Keep the existing navigation behaviour (Interests can still return from a
              // folder to its hub), but don't replay the tab flourish when this tab is active.
              if (!active) {
                setBurst((prev) => ({ id: tab.id, n: (prev?.n ?? 0) + 1 }));
              }
              onSelect(tab.id);
            }}
            className={[
              // Every tab always shows icon + label. Vertical stage: 8px type and tight padding so all four fit in 412px
              // next to the sound button; landscape: the roomier 11px version.
              'pixel-tile relative flex min-w-0 flex-none items-center justify-center gap-1 whitespace-nowrap px-[5px] py-2 font-pixel text-[8px] uppercase leading-tight',
              'min-[860px]:gap-2 min-[860px]:px-3 min-[860px]:text-[11px]',
              active
                ? 'tab-pop translate-y-1 bg-white text-wine'
                : 'bg-lavender text-cool-white hover:bg-rose hover:text-wine',
            ].join(' ')}
          >
            {burst?.id === tab.id && <span key={burst.n} className="tab-burst" aria-hidden="true" />}
            <PixelTabIcon name={tab.icon} active={active} size={24} className={['shrink-0', burst?.id === tab.id ? 'tab-icon-spin' : ''].join(' ')} key={burst?.id === tab.id ? `i${burst.n}` : 'i'} />
            <span className="inline min-w-0">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

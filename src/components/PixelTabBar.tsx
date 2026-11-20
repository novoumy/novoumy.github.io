import { useState } from 'react';
import type { TabConfig, TabId } from '@/siteData';
import { TAB_ICONS } from '@/lib/icons';

interface PixelTabBarProps {
  tabs: TabConfig[];
  activeId: TabId;
  onSelect: (id: TabId) => void;
}

// Narrow phones use a tidy 2x2 grid; wider screens keep all four labeled tabs in one row.
export default function PixelTabBar({ tabs, activeId, onSelect }: PixelTabBarProps) {
  // A pixel shockwave is triggered only when navigating to a different tab.
  const [burst, setBurst] = useState<{ id: TabId; n: number } | null>(null);
  return (
    <div
      role="tablist"
      aria-label="Main navigation"
      className="relative z-10 grid w-full min-w-0 grid-cols-2 items-stretch gap-2 px-1 min-[641px]:flex min-[641px]:items-end min-[641px]:gap-2 min-[641px]:flex-1 min-[860px]:w-auto min-[860px]:flex-none min-[860px]:gap-1 min-[860px]:pl-1 min-[860px]:pr-0"
    >
      {tabs.map((tab) => {
        const Icon = TAB_ICONS[tab.icon];
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
              'pixel-tile relative flex w-full min-w-0 items-center justify-center gap-2 px-2 py-2.5 font-pixel text-[8px] uppercase leading-tight min-[420px]:text-[9px]',
              'min-[641px]:w-auto min-[641px]:flex-none min-[641px]:px-2 min-[641px]:text-[10px] min-[860px]:px-3 min-[860px]:py-2 min-[860px]:text-[11px]',
              active
                ? 'tab-pop translate-y-1 bg-cool-white text-wine'
                : 'bg-lavender text-cool-white hover:bg-rose hover:text-wine [text-shadow:2px_2px_0_var(--wine)] hover:[text-shadow:none]',
            ].join(' ')}
          >
            {burst?.id === tab.id && <span key={burst.n} className="tab-burst" aria-hidden="true" />}
            <Icon size={18} strokeWidth={2.5} aria-hidden="true" className={['shrink-0', burst?.id === tab.id ? 'tab-icon-spin' : ''].join(' ')} key={burst?.id === tab.id ? `i${burst.n}` : 'i'} />
            <span className="inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

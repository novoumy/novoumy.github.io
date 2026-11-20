import { useState } from 'react';
import type { TabConfig, TabId } from '@/siteData';
import { TAB_ICONS } from '@/lib/icons';

interface PixelTabBarProps {
  tabs: TabConfig[];
  activeId: TabId;
  onSelect: (id: TabId) => void;
}

// Phones: icon-only tiles with real gaps; the active tab grows to show its name.
// Wide screens (>= 860px): every tab shows its label, as before.
export default function PixelTabBar({ tabs, activeId, onSelect }: PixelTabBarProps) {
  // A pixel shockwave is triggered only when navigating to a different tab.
  const [burst, setBurst] = useState<{ id: TabId; n: number } | null>(null);
  return (
    <div
      role="tablist"
      className="relative z-10 flex min-w-0 flex-1 items-end gap-2 px-1 min-[860px]:flex-none min-[860px]:gap-1 min-[860px]:pl-1 min-[860px]:pr-0"
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
              'pixel-tile relative flex min-w-0 items-center justify-center gap-2 py-2.5 font-pixel text-[10px] uppercase',
              'min-[860px]:flex-none min-[860px]:px-3 min-[860px]:py-2 min-[860px]:text-[11px]',
              active
                ? 'tab-pop flex-none translate-y-1 bg-cool-white px-3 text-wine'
                : 'flex-1 bg-lavender px-0 text-cool-white hover:bg-rose hover:text-wine [text-shadow:2px_2px_0_var(--wine)] hover:[text-shadow:none]',
            ].join(' ')}
          >
            {burst?.id === tab.id && <span key={burst.n} className="tab-burst" aria-hidden="true" />}
            <Icon size={18} strokeWidth={2.5} aria-hidden="true" className={['shrink-0', burst?.id === tab.id ? 'tab-icon-spin' : ''].join(' ')} key={burst?.id === tab.id ? `i${burst.n}` : 'i'} />
            <span className={active ? 'inline' : 'hidden min-[860px]:inline'}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

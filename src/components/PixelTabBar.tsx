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
            aria-label={tab.label}
            onClick={() => onSelect(tab.id)}
            className={[
              'pixel-tile relative flex min-w-0 items-center justify-center gap-2 py-2.5 font-pixel text-[10px] uppercase',
              'min-[860px]:flex-none min-[860px]:px-3 min-[860px]:py-2 min-[860px]:text-[11px]',
              active
                ? 'flex-none translate-y-1 bg-cool-white px-3 text-wine'
                : 'flex-1 bg-lavender px-0 text-cool-white hover:bg-rose hover:text-wine [text-shadow:2px_2px_0_var(--wine)] hover:[text-shadow:none]',
            ].join(' ')}
          >
            <Icon size={18} strokeWidth={2.5} aria-hidden="true" className="shrink-0" />
            <span className={active ? 'inline' : 'hidden min-[860px]:inline'}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

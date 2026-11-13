import type { TabConfig, TabId } from '@/siteData';
import { TAB_ICONS } from '@/lib/icons';

interface PixelTabBarProps {
  tabs: TabConfig[];
  activeId: TabId;
  onSelect: (id: TabId) => void;
}

export default function PixelTabBar({ tabs, activeId, onSelect }: PixelTabBarProps) {
  return (
    <div role="tablist" className="relative z-10 flex min-w-0 flex-1 items-end gap-1 pl-1 min-[860px]:flex-none">
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
              'pixel-tile relative flex min-w-0 flex-1 items-center justify-center gap-2 px-1 py-2 font-pixel min-[860px]:flex-none min-[860px]:px-3 text-[10px] uppercase min-[860px]:text-[11px]',
              active
                ? 'translate-y-1 bg-cool-white text-wine'
                : 'bg-lavender text-cool-white hover:bg-rose hover:text-wine [text-shadow:2px_2px_0_var(--wine)] hover:[text-shadow:none]',
            ].join(' ')}
          >
            <Icon size={16} strokeWidth={2.5} aria-hidden="true" />
            <span className="hidden min-[860px]:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

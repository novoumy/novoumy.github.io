import type { TabConfig, TabId } from '@/siteData';
import { TAB_ICONS } from '@/lib/icons';

interface PixelTabBarProps {
  tabs: TabConfig[];
  activeId: TabId;
  onSelect: (id: TabId) => void;
}

export default function PixelTabBar({ tabs, activeId, onSelect }: PixelTabBarProps) {
  return (
    <div role="tablist" className="relative z-10 flex items-end gap-1 pl-1">
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
              'pixel-tile relative flex items-center gap-2 px-3 py-2 font-pixel text-[10px] uppercase sm:text-[11px]',
              active
                ? 'translate-y-1 bg-cool-white text-wine'
                : 'bg-lavender text-cool-white hover:bg-rose hover:text-wine [text-shadow:2px_2px_0_var(--wine)] hover:[text-shadow:none]',
            ].join(' ')}
          >
            <Icon size={16} strokeWidth={2.5} aria-hidden="true" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

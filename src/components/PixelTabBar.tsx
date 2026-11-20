import { useRef, useState, type MouseEvent } from 'react';
import type { TabConfig, TabId } from '@/siteData';
import { TAB_ICONS } from '@/lib/icons';

interface PixelTabBarProps {
  tabs: TabConfig[];
  activeId: TabId;
  // clientX is where the click landed, so the page transition can radiate from the clicked tab.
  onSelect: (id: TabId, clientX: number) => void;
}

type Ripple = { key: number; tab: TabId; x: number; y: number; size: number };

// Phones: icon-only tiles with real gaps; the active tab grows to show its name.
// Wide screens (>= 860px): every tab shows its label, as before.
export default function PixelTabBar({ tabs, activeId, onSelect }: PixelTabBarProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextKey = useRef(1);

  const handleClick = (id: TabId, event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    // Keyboard "clicks" report 0,0: start the ripple from the centre instead.
    const keyboard = event.clientX === 0 && event.clientY === 0;
    const x = keyboard ? rect.width / 2 : event.clientX - rect.left;
    const y = keyboard ? rect.height / 2 : event.clientY - rect.top;
    const key = nextKey.current++;
    // Radius needed to reach the farthest corner from the click point.
    const size = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y)) * 2;
    setRipples((current) => [...current.slice(-4), { key, tab: id, x, y, size }]);
    window.setTimeout(() => setRipples((current) => current.filter((item) => item.key !== key)), 700);
    onSelect(id, keyboard ? rect.left + rect.width / 2 : event.clientX);
  };

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
            onClick={(event) => handleClick(tab.id, event)}
            className={[
              'pixel-tile relative flex min-w-0 items-center justify-center gap-2 overflow-hidden py-2.5 font-pixel text-[10px] uppercase',
              'min-[860px]:flex-none min-[860px]:px-3 min-[860px]:py-2 min-[860px]:text-[11px]',
              active
                ? 'tab-pop flex-none translate-y-1 bg-cool-white px-3 text-wine'
                : 'tab-idle flex-1 bg-lavender px-0 text-cool-white hover:bg-rose hover:text-wine [text-shadow:2px_2px_0_var(--wine)] hover:[text-shadow:none]',
            ].join(' ')}
          >
            {ripples
              .filter((ripple) => ripple.tab === tab.id)
              .map((ripple) => (
                <span
                  key={ripple.key}
                  aria-hidden="true"
                  className="tab-ripple"
                  style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
                />
              ))}
            <Icon size={18} strokeWidth={2.5} aria-hidden="true" className={active ? 'tab-icon-spin relative shrink-0' : 'relative shrink-0'} />
            <span className={['relative', active ? 'inline' : 'hidden min-[860px]:inline'].join(' ')}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

import { memo } from 'react';

const BRAND: Record<string, string> = {
  discord: '#7289DA', steam: '#657C9A', roblox: '#E34B55', github: '#343044',
  instagram: '#D66A9B', x: '#292536', youtube: '#E45B67', namemc: '#8A72C8',
  pinterest: '#D65D79', facebook: '#6689CE', snapchat: '#E0BD45', linkedin: '#5B91C8',
};
const PART: Record<string, string> = {
  cpu: '#9B83D5', cooler: '#7E9BCB', gpu: '#8E83C8', mobo: '#7C9FBA',
  ram: '#B58BCB', ssd: '#7FA9B2', psu: '#B18C9C', case: '#9A8BBE',
  monitor: '#819CCB', keyboard: '#B18BB5', mouse: '#8B9EC8', mic: '#C18EAB',
  phone: '#8B9AC8', tablet: '#9B8BC7', earbuds: '#8AA9B7', controller: '#B28DAF',
  headphone: '#8AA9B7',
};

function SmoothIcon({ name, size = 48, className = '' }: { name: string; size?: number; className?: string }) {
  const key = name.toLowerCase();
  const color = BRAND[key] || PART[key] || '#8069B7';
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  let art;
  switch (key) {
    case 'discord': art = <><path d="M7 8.5c3.3-2 6.7-2 10 0l1.5 8c-2.3 1.8-4.3 2.2-6.5 2.2s-4.2-.4-6.5-2.2L7 8.5Z"/><path d="M9 13h.01M15 13h.01M8 9 6 7m10 2 2-2"/></>; break;
    case 'steam': art = <><circle cx="14.5" cy="9" r="5.2"/><circle cx="14.5" cy="9" r="2"/><circle cx="7" cy="16.5" r="3"/><path d="m9.5 15 3-3"/></>; break;
    case 'roblox': art = <><path d="m8 3 13 5-5 13-13-5L8 3Z"/><path d="m10 10 4 1.5-1.5 4L8.5 14 10 10Z" fill="currentColor" stroke="none"/></>; break;
    case 'github': art = <><path d="M8 19c-4 1-4-2-6-2m12 4v-3c0-1 .1-1.8-.5-2.5 3.3-.4 6.5-1.6 6.5-7A5.5 5.5 0 0 0 18.5 4 5 5 0 0 0 18.4.5S17 0 14 2a13 13 0 0 0-7 0C4 0 2.6.5 2.6.5A5 5 0 0 0 2.5 4 5.5 5.5 0 0 0 1 8.5c0 5.4 3.2 6.6 6.5 7-.6.7-.6 1.5-.5 2.5v3"/></>; break;
    case 'instagram': art = <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.7" cy="6.5" r=".8" fill="currentColor" stroke="none"/></>; break;
    case 'x': art = <><path d="M5 4 19 20M19 4 5 20M4 4h4l12 16h-4"/></>; break;
    case 'youtube': art = <><rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none"/></>; break;
    case 'namemc': art = <><path d="M4 7 12 3l8 4v10l-8 4-8-4V7Z"/><path d="m8 15 4-7 4 7m-6-2h4"/></>; break;
    case 'pinterest': art = <><circle cx="12" cy="12" r="9"/><path d="m10 19 2-7m-1-1c0-3 5-4 5-1 0 4-5 5-6 2-1-4 2-7 5-7"/></>; break;
    case 'facebook': art = <><path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.5C17 1.3 16 1 14.5 1 11 1 9 3 9 6.5V9H6v4h3v8"/></>; break;
    case 'snapchat': art = <><path d="M12 3c-3 0-4.5 2-4.5 5v3c0 1.5-1.5 2.5-3 3 .8 1 2 1.2 3 1.2.5 2 2.5 3 4.5 3s4-1 4.5-3c1 0 2.2-.2 3-1.2-1.5-.5-3-1.5-3-3V8c0-3-1.5-5-4.5-5Z"/></>; break;
    case 'linkedin': art = <><rect x="3" y="8" width="4" height="13" rx="1"/><circle cx="5" cy="4.5" r="2"/><path d="M12 21V8h4v2c1-2 6-3 6 3v8h-4v-7c0-3-4-3-4 0v7"/></>; break;
    case 'cpu': art = <><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/></>; break;
    case 'cooler': art = <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 10c-4-6-5 0-2 2m4 0c6-4 0-5-2-2m0 4c4 6 5 0 2-2m-4 0c-6 4 0 5 2 2"/></>; break;
    case 'gpu': art = <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="10" cy="12" r="4"/><circle cx="10" cy="12" r="1"/><path d="M17 9v6m3-6v6M5 18v2"/></>; break;
    case 'mobo': art = <><rect x="4" y="3" width="16" height="18" rx="2"/><rect x="7" y="6" width="6" height="6" rx="1"/><path d="M15 7h2m-2 3h2m-9 5h8v3H8z"/></>; break;
    case 'ram': art = <><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 10h3v4H7zm7 0h3v4h-3zM6 17v2m4-2v2m4-2v2m4-2v2"/></>; break;
    case 'ssd': art = <><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="7" cy="12" r="1"/><path d="M11 9h6m-6 3h6m-6 3h4"/></>; break;
    case 'psu': art = <><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M12 8v4l3 2"/></>; break;
    case 'case': art = <><rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="9" r="3"/><path d="M10 17h4m-2 2h.01"/></>; break;
    case 'monitor': art = <><rect x="2.5" y="3" width="19" height="13" rx="2"/><path d="M12 16v5m-5 0h10m-8-15h6"/></>; break;
    case 'keyboard': art = <><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M5 10h.01M8 10h.01M11 10h.01M14 10h.01M17 10h.01M19 10h.01M6 13h.01M9 13h.01M12 13h.01M15 13h.01M18 13h.01M8 16h8"/></>; break;
    case 'mouse': art = <><rect x="6" y="2" width="12" height="20" rx="6"/><path d="M12 2v7m-6 0h12"/></>; break;
    case 'mic': art = <><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 11a7 7 0 0 0 14 0m-7 7v4m-4 0h8"/></>; break;
    case 'phone': art = <><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M10 5h4m-2 14h.01"/></>; break;
    case 'tablet': art = <><rect x="3" y="2" width="18" height="20" rx="2.5"/><path d="M11 18h2"/></>; break;
    case 'earbuds': case 'headphone': art = <><path d="M4 13V11a8 8 0 0 1 16 0v2"/><rect x="3" y="12" width="4" height="7" rx="2"/><rect x="17" y="12" width="4" height="7" rx="2"/></>; break;
    case 'controller': art = <><path d="M7 8h10c3 0 5 2 5 5l-1 5c-.3 2-2 2.5-3.5 1L14 16h-4l-3.5 3c-1.5 1.5-3.2 1-3.5-1l-1-5c0-3 2-5 5-5Z"/><path d="M7 11v5m-2.5-2.5h5m7-1h.01m3 3h.01"/></>; break;
    default: art = <><circle cx="12" cy="12" r="8"/><path d="M8 12h8m-4-4v8"/></>;
  }
  return <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true" focusable="false" style={{ color }} {...common}>{art}</svg>;
}
export default memo(SmoothIcon);

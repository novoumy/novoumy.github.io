import { memo } from 'react';
import {
  Cpu, Fan, CircuitBoard, MemoryStick, HardDrive, Zap, Server,
  Monitor, Keyboard, Mouse, Mic, Smartphone, Tablet, Headphones, Gamepad2,
} from 'lucide-react';
import {
  siDiscord, siSteam, siRoblox, siGithub, siInstagram, siX, siYoutube,
  siPinterest, siFacebook, siSnapchat, siLinkedin, siMinecraft,
} from 'simple-icons';

const PURPLE = '#3A2272';
const SOCIAL: Record<string, { path: string; title: string }> = {
  discord: { path: siDiscord.path, title: siDiscord.title },
  steam: { path: siSteam.path, title: siSteam.title },
  roblox: { path: siRoblox.path, title: siRoblox.title },
  github: { path: siGithub.path, title: siGithub.title },
  instagram: { path: siInstagram.path, title: siInstagram.title },
  x: { path: siX.path, title: siX.title },
  youtube: { path: siYoutube.path, title: siYoutube.title },
  namemc: { path: siMinecraft.path, title: 'Minecraft / NameMC' },
  pinterest: { path: siPinterest.path, title: siPinterest.title },
  facebook: { path: siFacebook.path, title: siFacebook.title },
  snapchat: { path: siSnapchat.path, title: siSnapchat.title },
  linkedin: { path: siLinkedin.path, title: siLinkedin.title },
};

const PART: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; color?: string; className?: string }>> = {
  cpu: Cpu,
  cooler: Fan,
  gpu: CircuitBoard,
  mobo: CircuitBoard,
  ram: MemoryStick,
  ssd: HardDrive,
  psu: Zap,
  case: Server,
  monitor: Monitor,
  keyboard: Keyboard,
  mouse: Mouse,
  mic: Mic,
  phone: Smartphone,
  tablet: Tablet,
  earbuds: Headphones,
  headphone: Headphones,
  controller: Gamepad2,
};

type Props = { name: string; size?: number; className?: string };

function SmoothIcon({ name, size = 48, className = '' }: Props) {
  const key = name.toLowerCase();
  const social = SOCIAL[key];
  if (social) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-label={social.title} role="img" style={{ color: PURPLE }}>
        <path fill="currentColor" d={social.path} />
      </svg>
    );
  }
  const Icon = PART[key] ?? Cpu;
  return <Icon size={size} strokeWidth={1.8} color={PURPLE} className={className} aria-hidden="true" />;
}

export default memo(SmoothIcon);

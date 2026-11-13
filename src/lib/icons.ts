import {
  Film,
  Gamepad2,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  Music,
  Quote,
  Share2,
  Twitter,
  User,
  Youtube,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';
import type { SocialIconName, TabIconName } from '@/siteData';

export const TAB_ICONS: Record<TabIconName, LucideIcon> = {
  user: User,
  film: Film,
  gamepad: Gamepad2,
  music: Music,
  quote: Quote,
  share: Share2,
};

export const SOCIAL_ICONS: Record<SocialIconName, LucideIcon> = {
  github: Github,
  youtube: Youtube,
  x: Twitter,
  discord: MessageCircle,
  steam: Gamepad2,
  instagram: Instagram,
  linkedin: Linkedin,
  globe: Globe,
  mail: Mail,
};

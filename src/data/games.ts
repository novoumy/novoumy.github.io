import { minecraftAchievements } from '@/data/minecraftAchievements';
import type { ManualGame } from '@/siteData';

// ----------------------------------------------------------------------------
// 3. GAMES - library / inventory list
// ----------------------------------------------------------------------------

export const manualGames: ManualGame[] = [
  {
    title: 'Minecraft',
    note: 'just perfect.',
    cover: 'https://cdn2.steamgriddb.com/thumb/a73027901f88055aaa0fd1a9e25d36c7.jpg',
    banner: 'https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/key-art/Minecraft_WildernessBound_2560x932.jpg',
    link: 'https://minecraft.net',
    linkLabel: 'minecraft.net',
    playtimeHours: 4678,
    playtimeLabel: '4678 HRS',
    achievements: minecraftAchievements,
  },
];


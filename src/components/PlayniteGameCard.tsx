import { GameItem } from '@/siteData';

interface PlayniteGameCardProps {
  game: GameItem;
  onSelect: (game: GameItem) => void;
  isSelected?: boolean;
}

export default function PlayniteGameCard({ 
  game, 
  onSelect, 
  isSelected = false 
}: PlayniteGameCardProps) {
  const getPlaytimeDisplay = () => {
    if (game.status === 'forever playing') return '3000+ HRS';
    const match = game.status.match(/^(\d+\.?\d*)\s*HRS/);
    if (match) return `${match[1]} HRS`;
    return game.status;
  };

  const getAchievementDisplay = () => {
    if (!game.total_achievements) return null;
    const unlocked = game.unlocked_achievements || 0;
    const total = game.total_achievements;
    const percentage = game.achievement_percentage || 0;
    return `${unlocked}/${total} • ${percentage}%`;
  };

  return (
    <li className="flex">
      <button
        type="button"
        onClick={() => onSelect(game)}
        className={[
          'group/game relative flex w-full flex-col gap-3 p-2 text-left',
          'r-box r-box-hover',
          isSelected ? 'r-box-active !border-[color:var(--r-accent)] shadow-[4px_4px_0_0_var(--r-accent-dim)]' : '',
        ].join(' ')}
      >
        <div className="relative">
          <img
            src={game.cover}
            alt={`${game.title} cover`}
            loading="lazy"
            className="aspect-[3/4] w-full bg-[#1e1e1e] object-cover max-sm:aspect-[2/3]"
          />
          <div className="absolute top-2 right-2 rounded bg-[#1e1e1e]/90 px-2 py-1 font-pixel text-[9px] text-[#d4d4d4] backdrop-blur-sm">
            {getPlaytimeDisplay()}
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 px-1 pb-1 max-sm:w-full max-sm:min-w-0 max-sm:px-0 max-sm:pb-0">
          <span className="r-tag max-sm:max-w-full max-sm:whitespace-normal max-sm:break-words max-sm:leading-[1.4] max-sm:text-[7px]">
            [ {game.title} ]
          </span>
          <h3 className="text-[11px] leading-[1.6] text-[#d4d4d4] max-sm:break-words max-sm:text-[9px]">{game.title}</h3>
          {getAchievementDisplay() && (
            <div className="w-full">
              <div className="mb-1 flex justify-between text-[7px] text-[#8a8a8a]">
                <span>Achievements</span>
                <span>{getAchievementDisplay()}</span>
              </div>
              <div className="h-1.5 w-full rounded-none bg-[#333333]">
                <div 
                  className="h-full rounded-none bg-[color:var(--r-accent)] transition-all duration-300"
                  style={{ width: `${game.achievement_percentage || 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </button>
    </li>
  );
}

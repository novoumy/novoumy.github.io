import { GameItem } from '@/siteData';

interface PlayniteGameDetailsProps {
  game: GameItem;
  onDismiss: () => void;
}

export default function PlayniteGameDetails({ game, onDismiss }: PlayniteGameDetailsProps) {
  const [achievementsFilter, setAchievementsFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filteredAchievements = useMemo(() => {
    if (!game.achievements) return [];
    switch (achievementsFilter) {
      case 'unlocked':
        return game.achievements.filter(a => a.unlocked);
      case 'locked':
        return game.achievements.filter(a => !a.unlocked);
      default:
        return game.achievements;
    }
  }, [game.achievements, achievementsFilter]);

  const getPlaytimeDisplay = () => {
    if (game.status === 'forever playing') return '3000+ HRS';
    const match = game.status.match(/^(\d+\.?\d*)\s*HRS/);
    if (match) return `${match[1]} HRS`;
    return game.status;
  };

  return (
    <div className="flex min-h-full flex-col gap-5 p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="font-pixel text-[8px] uppercase text-[#8a8a8a]">// game_info</span>
        <button type="button" onClick={onDismiss} aria-label="Close details" className="r-btn !p-2">
          <X size={14} strokeWidth={3} aria-hidden="true" />
        </button>
      </div>

      <div className="relative">
        <img
          src={game.cover}
          alt={`${game.title} banner`}
          className="aspect-[3/4] w-full border-2 border-[color:var(--r-accent)] bg-[#252526] object-cover shadow-[6px_6px_0_0_var(--r-accent-dim)] max-sm:aspect-[2/3]"
        />
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <h3 className="r-glow text-[14px] leading-[1.5] text-[color:var(--r-accent)] drop-shadow-md">
            {game.title}
          </h3>
          <div className="rounded bg-[#1e1e1e]/90 px-3 py-1.5 font-pixel text-[8px] text-[#d4d4d4]">
            {getPlaytimeDisplay()}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="r-tag">[ {game.title} ]</span>
          {game.platforms.map((pl) => (
            <span key={pl} className="r-tag">
              {pl}
            </span>
          ))}
        </div>

        {game.achievement_percentage !== undefined && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[8px] uppercase text-[#8a8a8a]">// completion</span>
              <span className="text-[10px] text-[#d4d4d4]">{game.achievement_percentage?.toFixed(1)}% Complete</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[#333333]">
              <div 
                className="h-full rounded-full bg-[color:var(--r-accent)] transition-all duration-500"
                style={{ width: `${game.achievement_percentage || 0}%` }}
              />
            </div>
            {game.total_achievements && (
              <span className="text-[7px] text-[#8a8a8a]">
                {game.unlocked_achievements || 0}/{game.total_achievements} achievements unlocked
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t-2 border-dashed border-[color:var(--r-accent-dim)] pt-4">
          <span className="font-pixel text-[8px] uppercase text-[#8a8a8a]">// review</span>
          <p className="text-[14px] leading-[1.3] text-[#d4d4d4]">&gt; {game.note}</p>
        </div>
      </div>

      {game.link && (
        <a 
          href={game.link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="r-btn mt-auto !text-[9px]"
        >
          [ VIEW ON STEAM STORE ]
          <ExternalLink size={13} aria-hidden="true" />
        </a>
      )}

      {game.achievements && game.achievements.length > 0 && (
        <div className="mt-6 border-t-2 border-dashed border-[color:var(--r-accent-dim)] pt-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-pixel text-[8px] uppercase text-[#8a8a8a]">// achievements</span>
            <div className="flex gap-2">
              {(['all', 'unlocked', 'locked'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setAchievementsFilter(filter)}
                  className={[
                    'px-2 py-1 font-pixel text-[7px] uppercase transition-colors',
                    achievementsFilter === filter
                      ? 'text-[#1e1e1e] bg-[color:var(--r-accent)]'
                      : 'text-[#8a8a8a] hover:text-[color:var(--r-accent)]'
                  ].join(' ')}
                >
                  {filter === 'all' ? 'ALL' : filter === 'unlocked' ? 'UNLOCKED' : 'LOCKED'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredAchievements.map((achievement, index) => (
              <div
                key={index}
                className={[
                  'flex flex-col items-center gap-2 p-2 rounded border',
                  achievement.unlocked
                    ? 'border-[color:var(--r-accent)] bg-[color:var(--r-accent)]/10'
                    : 'border-[#333333] bg-[#1e1e1e]/50 opacity-70'
                ].join(' ')}
              >
                <div className="relative">
                  <img
                    src={achievement.icon || achievement.icongray}
                    alt={achievement.display_name}
                    className="h-12 w-12 object-contain"
                  />
                  {achievement.unlocked && (
                    <div className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-[color:var(--r-accent)]">
                      <span className="text-[6px] text-[#1e1e1e]">✓</span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-[6px] leading-tight text-[#d4d4d4] font-medium">
                    {achievement.display_name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-[10px] text-[#8a8a8a]">
                No {achievementsFilter === 'unlocked' ? 'unlocked' : achievementsFilter === 'locked' ? 'locked' : 'achievements'} 
                matching the filter.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

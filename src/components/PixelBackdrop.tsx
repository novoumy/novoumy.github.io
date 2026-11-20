import type { CSSProperties } from 'react';

type Effect = 'abyss' | 'midnight' | 'lilac' | 'solar' | 'matrix';

const EFFECTS: Record<number, Effect> = { 6: 'abyss', 8: 'midnight', 10: 'lilac', 12: 'solar', 14: 'matrix' };
const getEffect = (frequency: number): Effect => EFFECTS[frequency] ?? 'lilac';

const floaters = Array.from({ length: 42 }, (_, index) => ({
  left: `${(index * 29 + (index % 5) * 7) % 100}%`,
  size: 3 + (index % 5) * 2,
  duration: `${11 + (index * 7) % 19}s`,
  delay: `${-((index * 11) % 25)}s`,
  drift: `${((index * 13) % 48) - 24}px`,
}));

const starPositions = Array.from({ length: 54 }, (_, index) => ({
  left: `${(index * 43 + 11) % 100}%`,
  top: `${(index * 31 + 7) % 92}%`,
  delay: `${-((index * 17) % 8)}s`,
  size: index % 9 === 0 ? 4 : index % 3 === 0 ? 3 : 2,
}));

const matrixColumns = Array.from({ length: 22 }, (_, index) => ({
  left: `${(index * 47) % 100}%`,
  delay: `${-((index * 13) % 16)}s`,
  duration: `${8 + (index * 7) % 13}s`,
  text: Array.from({ length: 11 }, (_, row) => ((index * 7 + row * 3) % 2 ? '1' : '0')).join('\n'),
}));

export default function PixelBackdrop({ frequency = 10 }: { frequency?: number }) {
  const effect = getEffect(frequency);
  return (
    <div aria-hidden="true" className={`pixel-backdrop pixel-backdrop--${effect} fixed inset-0 overflow-hidden`}>
      <div className="pixel-backdrop-grid absolute inset-0" />
      <div className="pixel-backdrop-ambient absolute inset-0" />

      {effect === 'abyss' && floaters.slice(0, 34).map((particle, index) => (
        <span key={index} className="environment-particle bubble-particle" style={{ '--left': particle.left, '--size': `${particle.size + 3}px`, '--duration': particle.duration, '--delay': particle.delay, '--drift': particle.drift } as CSSProperties} />
      ))}

      {effect === 'midnight' && <>
        {starPositions.map((star, index) => <span key={index} className="environment-particle star-particle" style={{ left: star.left, top: star.top, width: star.size, height: star.size, animationDelay: star.delay } as CSSProperties} />)}
        <i className="shooting-star shooting-star-one" />
        <i className="shooting-star shooting-star-two" />
      </>}

      {effect === 'lilac' && floaters.slice(0, 29).map((particle, index) => (
        <span key={index} className="environment-particle dust-particle" style={{ '--left': particle.left, '--size': `${Math.max(3, particle.size - 1)}px`, '--duration': particle.duration, '--delay': particle.delay, '--drift': particle.drift } as CSSProperties} />
      ))}

      {effect === 'solar' && <>
        <div className="sunbeam sunbeam-one" />
        <div className="sunbeam sunbeam-two" />
        {floaters.slice(0, 36).map((particle, index) => <span key={index} className="environment-particle ember-particle" style={{ '--left': particle.left, '--size': `${particle.size + 1}px`, '--duration': particle.duration, '--delay': particle.delay, '--drift': particle.drift } as CSSProperties} />)}
      </>}

      {effect === 'matrix' && matrixColumns.map((column, index) => (
        <span key={index} className="matrix-column" style={{ left: column.left, animationDelay: column.delay, animationDuration: column.duration }}>{column.text}</span>
      ))}
    </div>
  );
}

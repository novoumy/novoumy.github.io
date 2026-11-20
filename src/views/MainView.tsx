import { useRef, useState, type MouseEvent } from 'react';
import { hero } from '@/siteData';
import './terminal.css';

type Drift = { x: number; y: number };
const TOP_WORDS = ['✦ INTERNET DWELLER', 'PLAYER ONE', '/// NOUVO ZONE', 'EST. ONLINE', '♡ MADE OF PIXELS'];
const BOTTOM_WORDS = ['STAY A LITTLE', 'TAKE A SIDE QUEST ↗', 'GOOD VIBES ONLY', 'THANKS FOR VISITING!', '✧ 404: BORING NOT FOUND ✧'];


export default function MainView() {
  const rootRef = useRef<HTMLDivElement>(null);
  const topRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const bottomRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [topDrift, setTopDrift] = useState<Drift[]>(TOP_WORDS.map(() => ({ x: 0, y: 0 })));
  const [bottomDrift, setBottomDrift] = useState<Drift[]>(BOTTOM_WORDS.map(() => ({ x: 0, y: 0 })));

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const pushAway = (refs: (HTMLSpanElement | null)[]) => refs.map((el) => {
      if (!el) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      const dx = (rect.left + rect.width / 2) - event.clientX;
      const dy = (rect.top + rect.height / 2) - event.clientY;
      const distance = Math.hypot(dx, dy);
      if (distance > 130 || distance < 1) return { x: 0, y: 0 };
      const strength = (1 - distance / 130) * 26;
      return { x: (dx / distance) * strength, y: (dy / distance) * strength };
    });
    setTopDrift(pushAway(topRefs.current));
    setBottomDrift(pushAway(bottomRefs.current));
  };

  const resetDrift = () => {
    setTopDrift(TOP_WORDS.map(() => ({ x: 0, y: 0 })));
    setBottomDrift(BOTTOM_WORDS.map(() => ({ x: 0, y: 0 })));
  };

  return (
    <div
      ref={rootRef}
      className="main-playground -mx-8 -mb-8 flex min-h-0 h-[calc(100%+2rem)] flex-1 flex-col justify-between overflow-hidden px-5 py-5 max-sm:-mx-4 max-sm:-mb-4 max-sm:h-[calc(100%+1rem)] max-sm:px-3 max-sm:py-4"
      onMouseMove={onMouseMove}
      onMouseLeave={resetDrift}
    >
      <div className="kinetic-words kinetic-top" aria-label="Decorative welcome words">
        {TOP_WORDS.map((word, i) => (
          <span key={word} ref={(el) => { topRefs.current[i] = el; }} style={{ transform: `translate(${topDrift[i]?.x ?? 0}px, ${topDrift[i]?.y ?? 0}px)` }}>{word}</span>
        ))}
      </div>

      <section className="main-profile-center">
        <img src={hero.avatar} alt={hero.avatarAlt} className="pixel-frame main-profile-avatar" />
        <h1 className="main-profile-name">{hero.name}</h1>
        <div className="main-profile-bio">
          {hero.bio.filter((line) => line.replace(/\u00A0/g, '').trim() && !line.startsWith('>')).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="main-profile-caption"><span className="main-caption-pixel" /> A SMALL CORNER OF THE INTERNET <span className="main-caption-pixel" /></div>
      </section>


      <div className="kinetic-words kinetic-bottom" aria-label="Decorative footer words">
        {BOTTOM_WORDS.map((word, i) => (
          <span key={word} ref={(el) => { bottomRefs.current[i] = el; }} style={{ transform: `translate(${bottomDrift[i]?.x ?? 0}px, ${bottomDrift[i]?.y ?? 0}px)` }}>{word}</span>
        ))}
      </div>
    </div>
  );
}

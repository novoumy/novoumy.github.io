import { useLayoutEffect, useRef } from 'react';
import { hero } from '@/siteData';
import { mountBubbleBorder } from '@/lib/bubbleBorder';
import './main.css';

// Organic bubble-cluster border between the pink status bars and the cream window. Drawn on a canvas where every
// bubble animates on its own clock (see lib/bubbleBorder.ts); styles live in main.css.
function PixelDivider({ position }: { position: 'top' | 'bottom' }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => (canvas.current ? mountBubbleBorder(canvas.current, position) : undefined), [position]);
  return (
    <div className={`pixel-divider pixel-divider-${position}`} aria-hidden="true" data-static="">
      <canvas ref={canvas} />
    </div>
  );
}

export default function MainView() {
  return (
    <div className="main-playground absolute -inset-px flex flex-col justify-between overflow-hidden">
      <div className="kinetic-words kinetic-top" aria-hidden="true" data-static="" />

      <PixelDivider position="top" />

      <section className="main-profile-center">
        <div className="main-profile-avatar-wrap">
          <img src={hero.avatar} alt={hero.avatarAlt} className="main-profile-avatar" />
          {hero.avatarDecoration && (
            <img src={hero.avatarDecoration} alt="" aria-hidden="true" className="main-profile-avatar-deco" draggable={false} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          )}
        </div>
        <div className="main-profile-text">
          <div className="main-profile-hello">&gt; HELLO, I'M</div>
          <h1 className="main-profile-name">{hero.name}</h1>
          <div className="main-profile-bio">{hero.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </div>
      </section>

      <PixelDivider position="bottom" />

      <div className="kinetic-words kinetic-bottom" aria-hidden="true" data-static="" />
    </div>
  );
}

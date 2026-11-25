import { useEffect, useMemo, useState } from 'react';
import { STAGES, computeMode, computeScale } from '@/lib/useStageScale';

// Every star / particle is its own animated compositor layer, so phones get far fewer of them.
const LITE = typeof document !== 'undefined' && document.documentElement.dataset.perf === 'lite';
const PARTICLE_COUNT = LITE ? 6 : 14;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  size: i % 3 === 0 ? 8 : 6,
  duration: `${18 + ((i * 7) % 14)}s`,
  delay: `${-((i * 5) % 20)}s`,
  color: i % 2 === 0 ? '#F5F1FF' : '#C9B4FF',
}));

const STAR_COUNT = LITE ? 26 : 70;
const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
  left: `${(i * 53) % 100}%`,
  top: `${(i * 29 + (i % 7) * 11) % 100}%`,
  size: i % 9 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
  tw: `${3 + ((i * 13) % 50) / 10}s`,
  dr: `${50 + ((i * 17) % 60)}s`,
  delay: `${-((i * 7) % 30)}s`,
}));

// The window is frosted glass (backdrop-filter). Anything animating *behind* it forces the browser to re-blur that
// whole area every frame, which is by far the most expensive thing on the page. The glass hides those stars almost
// completely anyway, so stars / particles that would pass behind the window are simply not drawn: the sky around the
// window looks exactly the same, and the blur becomes a one-time cost.
const DRIFT_X = 40; // px a star drifts over its drift animation (see star-drift in index.css)
const DRIFT_Y = 120;

function useViewport() {
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setVp((prev) => (prev.w === window.innerWidth && prev.h === window.innerHeight ? prev : { w: window.innerWidth, h: window.innerHeight }));
      });
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return vp;
}

export default function PixelBackdrop() {
  const { w, h } = useViewport();
  const { visibleStars, visibleParticles } = useMemo(() => {
    const mode = computeMode();
    const stage = STAGES[mode];
    const scale = computeScale(mode);
    const rw = stage.width * scale;
    const rh = stage.height * scale;
    const left = (w - rw) / 2;
    const top = (h - rh) / 2;
    const right = left + rw;
    const bottom = top + rh;
    return {
      visibleStars: stars.filter((star) => {
        const x = (parseFloat(star.left) / 100) * w;
        const y = (parseFloat(star.top) / 100) * h;
        const hitsX = x + DRIFT_X + 8 > left && x - 8 < right;
        const hitsY = y + 8 > top && y - DRIFT_Y - 8 < bottom;
        return !(hitsX && hitsY);
      }),
      visibleParticles: particles.filter((particle) => {
        const x = (parseFloat(particle.left) / 100) * w;
        return !(x + particle.size > left && x < right);
      }),
    };
  }, [w, h]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="pixel-backdrop-grid absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--backdrop-grid, var(--cool-white)) 1px, transparent 1px), linear-gradient(to bottom, var(--backdrop-grid, var(--cool-white)) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="nebula" style={{ left: '-10%', top: '-10%', width: '55%', height: '55%', background: 'radial-gradient(circle, #8B5CF6, transparent 70%)' }} />
      <div className="nebula" style={{ right: '-10%', bottom: '-15%', width: '60%', height: '60%', background: 'radial-gradient(circle, #C084FC, transparent 70%)', animationDelay: '-9s' }} />
      {visibleStars.map((s) => (
        <span
          key={`s${s.left}-${s.top}`}
          className="stardust"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, ['--tw' as string]: s.tw, ['--dr' as string]: s.dr, animationDelay: `${s.delay}, ${s.delay}` }}
        />
      ))}
      {visibleParticles.map((p) => (
        <span
          key={`p${p.left}`}
          className="animate-float-particle absolute bottom-[-12px] opacity-60"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

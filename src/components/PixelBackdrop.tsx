const PARTICLE_COUNT = 18;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  size: i % 3 === 0 ? 8 : 6,
  duration: `${18 + ((i * 7) % 14)}s`,
  delay: `${-((i * 5) % 20)}s`,
  color: i % 2 === 0 ? '#F5F1FF' : '#C9B4FF',
}));

const STAR_COUNT = 70;
const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
  left: `${(i * 53) % 100}%`,
  top: `${(i * 29 + (i % 7) * 11) % 100}%`,
  size: i % 9 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
  tw: `${3 + ((i * 13) % 50) / 10}s`,
  dr: `${50 + ((i * 17) % 60)}s`,
  delay: `${-((i * 7) % 30)}s`,
}));

export default function PixelBackdrop() {
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
      {stars.map((s, i) => (
        <span
          key={`s${i}`}
          className="stardust"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, ['--tw' as string]: s.tw, ['--dr' as string]: s.dr, animationDelay: `${s.delay}, ${s.delay}` }}
        />
      ))}
      {particles.map((p, i) => (
        <span
          key={i}
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

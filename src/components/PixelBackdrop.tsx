const PARTICLE_COUNT = 18;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  size: i % 3 === 0 ? 8 : 6,
  duration: `${18 + ((i * 7) % 14)}s`,
  delay: `${-((i * 5) % 20)}s`,
  color: i % 2 === 0 ? 'var(--cool-white)' : 'var(--rose)',
}));

export default function PixelBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--cool-white) 1px, transparent 1px), linear-gradient(to bottom, var(--cool-white) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
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

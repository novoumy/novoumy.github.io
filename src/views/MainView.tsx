import { useEffect, useRef, useState, type FormEvent } from 'react';
import { hero } from '@/siteData';

type TermLine = { id: number; text: string; kind?: 'cmd' | 'sys' | 'out' };

const prose = hero.bio.filter((line) => {
  const t = line.replace(/\u00A0/g, '').trim();
  return t && !line.startsWith('>');
});

const AMBIENT = [
  '> error 503: motivation service temporarily unavailable',
  '> warning: caffeine levels critically low',
  '> ping: 999ms to reality',
  '> cache: overthinking assets warmed',
  '> task: doomscroll daemon running in background',
  '> sync: playlist feelings updated successfully',
  '> notice: side quest accepted without consent',
  '> debug: brain tabs open: 47',
  '> info: hydration check failed, vibes nominal',
  '> warning: sleep schedule not found',
];

const HELP = [
  'available commands:',
  '/help      - list all available commands',
  '/novotime  - show current time in Southern Turkey (Europe/Istanbul, GMT+3)',
  '/clear     - clear console output history',
  '/whoami    - show novoumy profile',
  '/matrix    - toggle matrix rain inside terminal (Esc or /clear to stop)',
  '/crt       - toggle CRT overlay across interface',
  'alias: /novoumytime -> /novotime',
];

const WHOAMI = [
  'user:     novoumy',
  'os:       Windows 11',
  'location: Southern Turkey',
  'hobbies:  gaming, music, over-optimizing websites',
  'status:   chronically online',
];

function novoTime() {
  const now = new Date();
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);
  const date = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Istanbul',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(now);
  return `> novotime: ${date} ${time} (Europe/Istanbul, GMT+3)`;
}

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const chars = '01ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ<>/[]{}*+#';
    let drops: number[] = [];
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.max(1, Math.floor(w / 14));
      drops = Array.from({ length: cols }, () => Math.random() * (h / 14));
      ctx.fillStyle = 'rgba(236,239,241,0.95)';
      ctx.fillRect(0, 0, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.fillStyle = 'rgba(236,239,241,0.18)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = '14px VT323, monospace';
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)] ?? '0';
        const x = i * 14;
        const y = drops[i]! * 14;
        ctx.fillStyle = Math.random() > 0.92 ? '#847FA4' : '#6B2D39';
        ctx.fillText(char, x, y);
        if (y > h && Math.random() > 0.975) drops[i] = 0;
        else drops[i] = drops[i]! + 1;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);
  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-70" aria-hidden="true" />;
}

export default function MainView({ onToggleCrt }: { onToggleCrt?: () => void }) {
  const [lines, setLines] = useState<TermLine[]>(() => [
    { id: 1, text: 'novOS v1.0 boot sequence complete', kind: 'sys' },
    { id: 2, text: 'type /help for available commands.', kind: 'sys' },
  ]);
  const [input, setInput] = useState('');
  const [matrix, setMatrix] = useState(false);
  const idRef = useRef(3);
  const outRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const push = (items: string[] | string, kind: TermLine['kind'] = 'out') => {
    const arr = Array.isArray(items) ? items : [items];
    setLines((prev) => {
      const next = [...prev];
      for (const text of arr) next.push({ id: idRef.current++, text, kind });
      return next.slice(-120);
    });
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      const msg = AMBIENT[Math.floor(Math.random() * AMBIENT.length)]!;
      push(msg, 'sys');
    }, 7000 + Math.floor(Math.random() * 5000));
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const el = outRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, matrix]);

  useEffect(() => {
    if (!matrix) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMatrix(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [matrix]);

  const runCommand = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    push(`> ${cmd}`, 'cmd');
    const normalized = cmd.toLowerCase();
    if (normalized === '/help') {
      push(HELP);
      return;
    }
    if (normalized === '/novotime' || normalized === '/novoumytime') {
      push(novoTime());
      return;
    }
    if (normalized === '/clear') {
      setMatrix(false);
      setLines([{ id: idRef.current++, text: 'console cleared. type /help for commands.', kind: 'sys' }]);
      return;
    }
    if (normalized === '/whoami') {
      push(WHOAMI);
      return;
    }
    if (normalized === '/matrix') {
      setMatrix((v) => {
        const next = !v;
        push(next ? '> matrix rain: enabled (Esc or /clear to stop)' : '> matrix rain: disabled', 'sys');
        return next;
      });
      return;
    }
    if (normalized === '/crt') {
      onToggleCrt?.();
      push('> crt filter toggled', 'sys');
      return;
    }
    push(`unknown command: ${cmd}. type /help`, 'sys');
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const value = input;
    setInput('');
    runCommand(value);
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-4 max-[768px]:gap-[1.2cqw]">
      <div className="grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-2 max-[768px]:gap-x-[3cqw] max-[768px]:gap-y-[0.8cqw]">
        <img
          src={hero.avatar}
          alt={hero.avatarAlt}
          className="pixel-frame row-span-2 aspect-square w-28 shrink-0 object-cover max-[768px]:w-[16cqw]"
        />
        <h1 className="min-w-0 break-words text-2xl tracking-wide max-[768px]:text-[max(clamp(11px,3.3vw,12px),3.2cqw)]">
          {hero.name}
        </h1>
        <div className="col-start-2 flex min-w-0 flex-col gap-1 max-[768px]:col-span-2 max-[768px]:col-start-1">
          {prose.map((paragraph) => (
            <p
              key={paragraph}
              className="leading-[1.35] max-[768px]:text-[max(clamp(10px,3vw,11px),2.4cqw)] max-[768px]:leading-[1.2]"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <section className="pixel-tile relative flex min-h-0 flex-1 flex-col overflow-hidden bg-cool-white">
        <h2 className="bg-wine px-3 py-2 font-pixel text-[9px] uppercase leading-none text-cool-white max-[768px]:px-2 max-[768px]:py-[0.8cqw] max-[768px]:text-[max(7px,1.2cqw)]">
          &gt; novoumy_terminal
        </h2>
        <div
          ref={outRef}
          onClick={() => inputRef.current?.focus()}
          className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 font-mono text-[18px] leading-[1.3] text-wine max-[768px]:px-2 max-[768px]:py-2 max-[768px]:text-[max(10px,2.3cqw)]"
        >
          {matrix && <MatrixRain />}
          <div className="relative z-0 flex min-h-full flex-col gap-1">
            {lines.map((line) => (
              <p
                key={line.id}
                className={[
                  'whitespace-pre-wrap break-words [overflow-wrap:anywhere]',
                  line.kind === 'cmd' ? 'text-lavender' : '',
                  line.kind === 'sys' ? 'opacity-90' : '',
                ].join(' ')}
              >
                {line.text}
              </p>
            ))}
          </div>
        </div>
        <form onSubmit={onSubmit} className="flex items-center gap-2 border-t-4 border-rose/60 px-3 py-2 max-[768px]:px-2 max-[768px]:py-[0.8cqw]">
          <span className="font-mono text-[18px] leading-none text-lavender max-[768px]:text-[max(10px,2.3cqw)]">&gt;</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Terminal command input"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent font-mono text-[18px] leading-none text-wine outline-none placeholder:text-lavender/70 max-[768px]:text-[max(10px,2.3cqw)]"
            placeholder="type /help"
          />
        </form>
      </section>
    </div>
  );
}

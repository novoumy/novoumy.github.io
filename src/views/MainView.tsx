import { useEffect, useRef, useState, type FormEvent } from 'react';
import { hero } from '@/siteData';

type TermLine = { id: number; text: string; kind?: 'cmd' | 'sys' | 'out' };

const prose = hero.bio.filter((line) => {
  const t = line.replace(/\u00A0/g, '').trim();
  return t && !line.startsWith('>');
});

const AMBIENT = [
  'error 503: motivation service temporarily unavailable',
  'warning: caffeine levels critically low',
  'ping: 999ms to reality',
  'cache: overthinking assets warmed',
  'task: doomscroll daemon running in background',
  'sync: playlist feelings updated successfully',
  'notice: side quest accepted without consent',
  'debug: brain tabs open: 47',
  'info: hydration check failed, vibes nominal',
  'warning: sleep schedule not found',
];

const HELP = [
  'available commands:',
  '/help      - list all available commands',
  "/novotime  - Shows novoumy's local time (GMT+3)",
  '/clear     - clear console output history',
  '/whoami    - show novoumy profile',
  '/matrix    - toggle matrix rain inside terminal (Esc or /clear to stop)',
  'alias: /novoumytime -> /novotime',
];

const WHOAMI = [
  'user:     novoumy',
  'os:       Windows 11',
  'hobbies:  gaming, music, over-optimizing websites',
  'status:   chronically online',
];

function novoTime() {
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
  return `novotime: ${time} (GMT+3)`;
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

const MAX_AUTO_LINES = 5;

const KIND_STYLE: Record<NonNullable<TermLine['kind']>, { glyph: string; glyphClass: string; textClass: string }> = {
  cmd: { glyph: '❯', glyphClass: 'text-lavender', textClass: 'text-wine font-bold' },
  sys: { glyph: '·', glyphClass: 'text-rose', textClass: 'text-wine/75' },
  out: { glyph: '', glyphClass: '', textClass: 'text-wine' },
};

export default function MainView() {
  const [lines, setLines] = useState<TermLine[]>(() => [
    { id: 1, text: 'novOS v1.0 boot sequence complete', kind: 'sys' },
    { id: 2, text: 'type /help for available commands.', kind: 'sys' },
  ]);
  const [input, setInput] = useState('');
  const [matrix, setMatrix] = useState(false);
  const idRef = useRef(3);
  const autoRef = useRef(0); // ambient messages sent so far
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

  // Ambient messages: stop for good once the terminal holds 5 lines.
  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        let reachedLimit = false;
        setLines((prev) => {
          if (prev.length >= MAX_AUTO_LINES) {
            reachedLimit = true;
            return prev;
          }
          const msg = AMBIENT[autoRef.current % AMBIENT.length]!;
          autoRef.current += 1;
          const next = [...prev, { id: idRef.current++, text: msg, kind: 'sys' as const }];
          reachedLimit = next.length >= MAX_AUTO_LINES;
          return next;
        });
        if (!reachedLimit) schedule();
      }, 3500 + Math.floor(Math.random() * 2500));
    };
    schedule();
    return () => window.clearTimeout(timer);
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
    push(cmd, 'cmd');
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
      const next = !matrix;
      setMatrix(next);
      push(next ? 'matrix rain: enabled (Esc or /clear to stop)' : 'matrix rain: disabled', 'sys');
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
        {/* Title bar */}
        <header className="flex items-center justify-between gap-3 bg-wine px-3 py-2 max-[768px]:px-2 max-[768px]:py-[0.8cqw]">
          <div className="flex items-center gap-2">
            <span className="flex gap-1" aria-hidden="true">
              <span className="block h-2 w-2 bg-rose max-[768px]:h-[1.2cqw] max-[768px]:w-[1.2cqw]" />
              <span className="block h-2 w-2 bg-lavender max-[768px]:h-[1.2cqw] max-[768px]:w-[1.2cqw]" />
              <span className="block h-2 w-2 bg-cool-white max-[768px]:h-[1.2cqw] max-[768px]:w-[1.2cqw]" />
            </span>
            <h2 className="font-pixel text-[9px] uppercase leading-none text-cool-white max-[768px]:text-[max(7px,1.2cqw)]">
              novoumy_terminal
            </h2>
          </div>
          <span className="flex items-center gap-1.5 font-pixel text-[7px] uppercase leading-none text-rose max-[768px]:text-[max(6px,1cqw)]">
            <span className="block h-1.5 w-1.5 bg-rose" aria-hidden="true" />
            online
          </span>
        </header>

        {/* Output */}
        <div
          ref={outRef}
          onClick={() => inputRef.current?.focus()}
          className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[color-mix(in_oklab,var(--rose)_10%,var(--cool-white))] px-4 py-3 font-mono text-[18px] leading-[1.35] text-wine [scrollbar-color:var(--rose)_transparent] [scrollbar-width:thin] max-[768px]:px-2 max-[768px]:py-2 max-[768px]:text-[max(10px,2.3cqw)]"
        >
          {matrix && <MatrixRain />}
          <div className="relative z-0 flex min-h-full flex-col justify-end gap-0.5">
            {lines.map((line) => {
              const style = KIND_STYLE[line.kind ?? 'out'];
              return (
                <p
                  key={line.id}
                  className="grid grid-cols-[1.25ch_1fr] gap-x-2 whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
                >
                  <span className={`select-none text-center ${style.glyphClass}`} aria-hidden="true">
                    {style.glyph}
                  </span>
                  <span className={style.textClass}>{line.text}</span>
                </p>
              );
            })}
          </div>
        </div>

        {/* Prompt */}
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 border-t-4 border-wine bg-cool-white px-4 py-2 max-[768px]:px-2 max-[768px]:py-[0.8cqw]"
        >
          <span className="select-none font-mono text-[18px] leading-none text-lavender max-[768px]:text-[max(10px,2.3cqw)]">❯</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Terminal command input"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent font-mono text-[18px] leading-none text-wine caret-lavender outline-none placeholder:text-lavender/70 max-[768px]:text-[max(10px,2.3cqw)]"
            placeholder="type /help"
          />
        </form>
      </section>
    </div>
  );
}

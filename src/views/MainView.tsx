import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { hero } from '@/siteData';
import './terminal.css';

type Kind = 'cmd' | 'sys' | 'out' | 'err' | 'warn' | 'ok';
type TermLine = { id: number; text: string; kind?: Kind };
type Step = { t: string; k?: Kind; s?: number };

const prose = hero.bio.filter((line) => {
  const t = line.replace(/\u00A0/g, '').trim();
  return t && !line.startsWith('>');
});

const GLYPH: Record<Kind, string> = { cmd: '❯', sys: '·', out: '', err: '', warn: '', ok: '' };
const TAG: Partial<Record<Kind, string>> = { err: 'ERR', warn: 'WARN', ok: 'OK' };

// Auto-classify so ambient strings and plain push() calls get the right look.
const kindOf = (text: string, fallback: Kind): Kind => {
  if (fallback === 'cmd' || fallback === 'err') return fallback;
  if (/^error\b/i.test(text)) return 'err';
  if (/^warning\b/i.test(text)) return 'warn';
  if (fallback === 'sys' && /(success|enabled|complete|updated)/i.test(text)) return 'ok';
  return fallback;
};

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
  '/clear     - clear console output history (or Ctrl+L)',
  '/whoami    - show novoumy profile',
  '/matrix    - toggle matrix rain inside terminal (Esc or /clear to stop)',
  '/theme     - toggle night phosphor mode',
  '/reboot    - replay the boot sequence',
  'tip: Up/Down = history, Tab = autocomplete',
  'alias: /novoumytime -> /novotime',
];

const WHOAMI = [
  'user:     novoumy',
  'os:       Windows 11',
  'hobbies:  gaming, music, over-optimizing websites',
  'status:   chronically online',
];

// Tab-complete only knows the documented commands; the easter eggs stay secret.
const COMMANDS = ['/help', '/novotime', '/novoumytime', '/clear', '/whoami', '/matrix', '/theme', '/reboot'];

const FORTUNES = [
  'you will fix one bug and discover three.',
  'a wild side quest appears. accept it.',
  'your next commit will be called "final_final2".',
  'the real treasure was the tabs you left open.',
];

const EGGS: Record<string, string[] | (() => string[])> = {
  '/sudo': ['novoumy is not in the sudoers file.', 'this incident will be reported. (to nobody)'],
  '/fortune': () => [FORTUNES[Math.floor(Math.random() * FORTUNES.length)]!],
  '/coffee': [
    '    ( (',
    '     ) )',
    '  .______.',
    '  |      |]',
    '  \\      /',
    "   `----'",
    'brewed. motivation still 503.',
  ],
  '/neofetch': [
    'novoumy@web',
    '-----------',
    'OS:       novOS 1.0 (Windows 11 in disguise)',
    'Shell:    novo-sh',
    'Uptime:   since you opened this tab',
    'Palette:  #6B2D39 #847FA4 #CD9EBA #ECEFF1',
    'Mood:     chronically online',
  ],
};

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

function MatrixRain({ dark }: { dark: boolean }) {
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
      ctx.fillStyle = dark ? 'rgba(40,14,20,0.95)' : 'rgba(236,239,241,0.95)';
      ctx.fillRect(0, 0, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.fillStyle = dark ? 'rgba(40,14,20,0.18)' : 'rgba(236,239,241,0.18)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = '14px VT323, monospace';
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)] ?? '0';
        const x = i * 14;
        const y = drops[i]! * 14;
        ctx.fillStyle = Math.random() > 0.92 ? '#847FA4' : dark ? '#CD9EBA' : '#6B2D39';
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
  }, [dark]);
  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-70" aria-hidden="true" />;
}

const MAX_AUTO_LINES = 5;
const BOOT: Step[] = [
  { t: 'novOS v1.0 boot sequence complete', k: 'sys', s: 22 },
  { t: 'type /help for available commands.', k: 'sys', s: 22 },
];

export default function MainView() {
  const [lines, setLines] = useState<TermLine[]>([]);
  const [input, setInput] = useState('');
  const [matrix, setMatrix] = useState(false);
  const [night, setNight] = useState(false);
  const idRef = useRef(1);
  const autoRef = useRef(0); // ambient messages sent so far
  const outRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // history + typewriter plumbing
  const history = useRef<string[]>([]);
  const hIdx = useRef(-1);
  const draft = useRef('');
  const alive = useRef(true);
  const epoch = useRef(0); // bumped by /clear and /reboot to cancel queued typing
  const queue = useRef<Promise<void>>(Promise.resolve());
  const booted = useRef(false);

  const push = (items: string[] | string, kind: Kind = 'out') => {
    const arr = Array.isArray(items) ? items : [items];
    setLines((prev) => {
      const next = [...prev];
      for (const text of arr) next.push({ id: idRef.current++, text, kind: kindOf(text, kind) });
      return next.slice(-120);
    });
  };

  const typeOut = (text: string, kind: Kind, speed: number) =>
    new Promise<void>((resolve) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        push(text, kind);
        return resolve();
      }
      const ep = epoch.current;
      const id = idRef.current++;
      setLines((p) => [...p, { id, text: '', kind: kindOf(text, kind) }].slice(-120));
      let i = 0;
      const timer = window.setInterval(() => {
        if (!alive.current || ep !== epoch.current) {
          window.clearInterval(timer);
          return resolve();
        }
        i += 1;
        setLines((p) => p.map((l) => (l.id === id ? { ...l, text: text.slice(0, i) } : l)));
        if (i >= text.length) {
          window.clearInterval(timer);
          resolve();
        }
      }, speed);
    });

  // Queued so lines never interleave; cancelled when the epoch changes.
  const seq = (steps: Step[]) => {
    const ep = epoch.current;
    queue.current = queue.current.then(async () => {
      for (const st of steps) {
        if (!alive.current || ep !== epoch.current) return;
        await typeOut(st.t, st.k ?? 'out', st.s ?? 10);
      }
    });
  };
  const typeLines = (items: string[], kind: Kind = 'out', speed = 10) =>
    seq(items.map((t) => ({ t, k: kind, s: speed })));

  const cancelTyping = () => {
    epoch.current += 1;
    queue.current = Promise.resolve();
  };

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // Boot sequence (ref guard keeps StrictMode from running it twice).
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    seq(BOOT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          const next = [...prev, { id: idRef.current++, text: msg, kind: kindOf(msg, 'sys') }];
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
    const onKey = (event: globalThis.KeyboardEvent) => {
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
      typeLines(HELP);
      return;
    }
    if (normalized === '/novotime' || normalized === '/novoumytime') {
      push(novoTime());
      return;
    }
    if (normalized === '/clear') {
      cancelTyping();
      setMatrix(false);
      setLines([{ id: idRef.current++, text: 'console cleared. type /help for commands.', kind: 'sys' }]);
      return;
    }
    if (normalized === '/whoami') {
      typeLines(WHOAMI);
      return;
    }
    if (normalized === '/matrix') {
      const next = !matrix;
      setMatrix(next);
      push(next ? 'matrix rain: enabled (Esc or /clear to stop)' : 'matrix rain: disabled', 'sys');
      return;
    }
    if (normalized === '/theme') {
      setNight(!night);
      push(`theme: ${night ? 'day' : 'night'} phosphor`, 'sys');
      return;
    }
    if (normalized === '/reboot') {
      cancelTyping();
      setMatrix(false);
      setLines([]);
      seq([
        { t: 'novOS v1.0 rebooting...', k: 'sys', s: 24 },
        { t: 'mounting /vibes ........ ok', k: 'sys', s: 24 },
        { t: 'boot sequence complete', k: 'sys', s: 24 },
      ]);
      return;
    }
    if (normalized === '/hack') {
      seq([
        { t: 'connecting to mainframe...', k: 'sys', s: 22 },
        { t: 'bypassing firewall [########..] 80%', k: 'sys', s: 22 },
        { t: 'error 403: nice try', k: 'err', s: 22 },
      ]);
      return;
    }
    const egg = EGGS[normalized];
    if (egg) {
      typeLines(typeof egg === 'function' ? egg() : egg, 'out', 9);
      return;
    }
    push(`unknown command: ${cmd}. type /help`, 'err');
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const value = input;
    setInput('');
    const v = value.trim();
    if (v && history.current[history.current.length - 1] !== v) history.current.push(v);
    hIdx.current = -1;
    runCommand(value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const h = history.current;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!h.length) return;
      if (hIdx.current === -1) {
        draft.current = input;
        hIdx.current = h.length - 1;
      } else {
        hIdx.current = Math.max(0, hIdx.current - 1);
      }
      setInput(h[hIdx.current]!);
    } else if (e.key === 'ArrowDown') {
      if (hIdx.current === -1) return;
      e.preventDefault();
      if (hIdx.current >= h.length - 1) {
        hIdx.current = -1;
        setInput(draft.current);
      } else {
        hIdx.current += 1;
        setInput(h[hIdx.current]!);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (!input.startsWith('/')) return;
      const m = COMMANDS.filter((c) => c.startsWith(input.toLowerCase()));
      if (m.length === 1) setInput(m[0]!);
      else if (m.length > 1) push(m.join('   '), 'sys');
    } else if (e.key.toLowerCase() === 'l' && e.ctrlKey) {
      e.preventDefault();
      runCommand('/clear');
    }
  };

  return (
    <div className="-mx-8 -mb-8 flex h-full min-h-0 min-w-0 flex-col max-sm:-mx-4 max-sm:-mb-4">
      {/* Profile: untouched content, with extra room underneath. */}
      <div className="px-8 pb-12 pt-8 max-sm:px-4 max-sm:pb-9 max-sm:pt-4">
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
      </div>

      {/* Open terminal: full-width, edge to edge inside the card. */}
      <section
        data-theme={night ? 'night' : 'day'}
        className="term term-crt relative flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        {/* Divider: the rule spans the card; label and status sit on it.
            The header background splits at the rule so the terminal tint starts exactly on the line. */}
        <header className="relative z-20 flex h-7 shrink-0 items-center bg-gradient-to-b from-cool-white from-50% to-[color:var(--t-bg)] to-50% font-pixel uppercase leading-none">
          <span
            aria-hidden="true"
            className="h-[3px] w-8 shrink-0 bg-lavender shadow-[0_3px_0_0_#CD9EBA99] max-[768px]:w-4"
          />
          <h2 className="flex shrink-0 items-center gap-2.5 px-3.5 font-pixel text-[10px] font-normal tracking-[0.12em] text-wine max-[768px]:gap-1.5 max-[768px]:px-2 max-[768px]:text-[max(7px,1.4cqw)]">
            <span className="block h-1.5 w-1.5 rotate-45 bg-lavender" aria-hidden="true" />
            novoumy_terminal
          </h2>
          <span
            aria-hidden="true"
            className="h-[3px] min-w-4 flex-1 bg-lavender shadow-[0_3px_0_0_#CD9EBA99]"
          />
          <span className="flex shrink-0 items-center gap-2 px-3.5 font-pixel text-[8px] tracking-[0.14em] text-lavender max-[768px]:gap-1.5 max-[768px]:px-2 max-[768px]:text-[max(6px,1.1cqw)]">
            <span className="block h-2 w-2 animate-pulse bg-rose shadow-[0_0_0_2px_#CD9EBA55]" aria-hidden="true" />
            online
          </span>
          <span
            aria-hidden="true"
            className="h-[3px] w-8 shrink-0 bg-lavender shadow-[0_3px_0_0_#CD9EBA99] max-[768px]:w-4"
          />
        </header>

        {/* Output */}
        <div
          ref={outRef}
          role="log"
          onClick={() => inputRef.current?.focus()}
          className="term-out term-scroll relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-8 pb-4 pt-6 max-[768px]:px-4 max-[768px]:pb-2 max-[768px]:pt-5"
        >
          {matrix && <MatrixRain dark={night} />}
          <div className="relative z-0 flex min-h-full flex-col justify-end gap-1">
            {lines.map((line) => {
              const kind = line.kind ?? 'out';
              return (
                <p key={line.id} className={`t-line t-${kind}`}>
                  <span className="t-gutter" aria-hidden="true">
                    {GLYPH[kind]}
                  </span>
                  <span className="t-msg">
                    {TAG[kind] && <b className="t-tag">{TAG[kind]}</b>}
                    {line.text}
                  </span>
                </p>
              );
            })}
          </div>
        </div>

        {/* Prompt, docked at the very bottom */}
        <form onSubmit={onSubmit} className="term-prompt shrink-0">
          <label htmlFor="term-in" className="t-ps1">
            <span className="t-user">novo@web</span>
            <span>:</span>
            <span className="t-path">~</span>
            <span className="t-dollar">$</span>
          </label>
          <div className="t-field" onClick={() => inputRef.current?.focus()}>
            <input
              id="term-in"
              ref={inputRef}
              value={input}
              className="t-input"
              aria-label="Terminal command input"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
            />
            <span className="t-typed" aria-hidden="true">
              {input}
              <i className="t-cursor" />
              {!input && <em className="t-ph">type /help</em>}
            </span>
          </div>
        </form>
      </section>
    </div>
  );
}

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
  '/whoami    - show novoumy profile',
  '/theme     - toggle dark mode.',
  '/invert    - toggle inverted theme',
  '/reboot    - replay the boot sequence',
];

const WHOAMI = [
  'user:     novoumy',
  'os:       Windows 11',
  'hobbies:  gaming, music, over-optimizing websites',
  'status:   chronically online',
];

// Tab-complete only knows the documented commands; the easter eggs stay secret.
const COMMANDS = ['/help', '/novotime', '/whoami', '/theme', '/invert', '/reboot'];

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

const MAX_AUTO_LINES = 5;
const BOOT: Step[] = [
  { t: 'novOS v1.0 boot sequence complete', k: 'sys', s: 22 },
  { t: 'type /help for available commands.', k: 'sys', s: 22 },
];

export default function MainView({
  onToggleTheme,
  onToggleInvert,
}: {
  onToggleTheme?: () => boolean;
  onToggleInvert?: () => boolean;
} = {}) {
  const applyFallbackMode = (mode: 'light' | 'theme' | 'invert') => {
    const root = document.documentElement;
    root.classList.toggle('theme-dark', mode === 'invert');
    root.classList.toggle('theme-soft', mode === 'theme');
    root.style.colorScheme = mode === 'light' ? 'light' : 'dark';
    try {
      window.localStorage.setItem('novoumy-theme', mode);
    } catch {
      // The in-memory theme still works when storage is unavailable.
    }
  };
  const toggleTheme = onToggleTheme ?? (() => {
    const enabled = !document.documentElement.classList.contains('theme-soft');
    applyFallbackMode(enabled ? 'theme' : 'light');
    return enabled;
  });
  const toggleInvert = onToggleInvert ?? (() => {
    const enabled = !document.documentElement.classList.contains('theme-dark');
    applyFallbackMode(enabled ? 'invert' : 'light');
    return enabled;
  });
  const [lines, setLines] = useState<TermLine[]>([]);
  const [input, setInput] = useState('');
  const idRef = useRef(1);
  const autoRef = useRef(0); // ambient messages sent so far
  const outRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // history + typewriter plumbing
  const history = useRef<string[]>([]);
  const hIdx = useRef(-1);
  const draft = useRef('');
  const tabState = useRef<{ matches: string[]; index: number; current: string } | null>(null);
  const alive = useRef(true);
  const epoch = useRef(0); // bumped by /reboot to cancel queued typing
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
  }, [lines]);

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
    if (normalized === '/whoami') {
      typeLines(WHOAMI);
      return;
    }
    if (normalized === '/theme') {
      const enabled = toggleTheme();
      push(`theme: ${enabled ? 'softer dark palette enabled' : 'light palette restored'}`, 'ok');
      return;
    }
    if (normalized === '/invert') {
      const enabled = toggleInvert();
      push(`invert: ${enabled ? 'original inverted palette enabled' : 'light palette restored'}`, 'ok');
      return;
    }
    if (normalized === '/reboot') {
      cancelTyping();
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
      // Minecraft-style: first Tab completes, further Tabs cycle through the matches
      // (Shift+Tab cycles backwards). The match list is frozen on the first Tab so
      // cycling isn't disturbed by the input changing to a completed command.
      let st = tabState.current;
      if (!st || st.current !== input) {
        if (!input.startsWith('/')) return;
        const matches = COMMANDS.filter((c) => c.startsWith(input.toLowerCase()));
        if (!matches.length) return;
        st = { matches, index: -1, current: input };
      }
      const n = st.matches.length;
      st.index = e.shiftKey ? (st.index <= 0 ? n - 1 : st.index - 1) : (st.index + 1) % n;
      st.current = st.matches[st.index]!;
      tabState.current = st;
      setInput(st.current);
    }
  };

  return (
    <div className="-mx-8 -mb-8 flex h-[calc(100%+2rem)] min-h-0 min-w-0 flex-col max-sm:-mx-4 max-sm:-mb-4 max-sm:h-[calc(100%+1rem)]">
      {/* Profile: untouched content, with extra room underneath. */}
      <div className="px-8 pb-12 pt-8 max-sm:px-4 max-sm:pb-9 max-sm:pt-4">
        <div className="grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-2 max-[768px]:flex max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-3">
          <img
            src={hero.avatar}
            alt={hero.avatarAlt}
            className="pixel-frame row-span-2 aspect-square w-28 shrink-0 object-cover max-[768px]:w-20 max-[768px]:self-center"
          />
          <h1 className="min-w-0 break-words text-2xl tracking-wide max-[768px]:w-full max-[768px]:text-center max-[768px]:text-[clamp(14px,4vw,18px)]">
            {hero.name}
          </h1>
          <div className="col-start-2 flex min-w-0 flex-col gap-1 max-[768px]:w-full max-[768px]:items-center max-[768px]:text-center">
            {prose.map((paragraph) => (
              <p
                key={paragraph}
                className="leading-[1.35] max-[768px]:text-[clamp(14px,3.7vw,17px)] max-[768px]:leading-[1.25]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Open terminal: full-width, edge to edge inside the card. */}
      <section
        className="term term-crt relative flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        {/* Divider: the rule spans the card; label and status sit on it.
            The header background splits at the rule so the terminal tint starts exactly on the line. */}
        <header className="relative z-20 flex h-7 shrink-0 items-center bg-gradient-to-b from-cool-white from-50% to-[color:var(--t-bg)] to-50% font-pixel uppercase leading-none">
          <span
            aria-hidden="true"
            className="h-[3px] w-8 shrink-0 bg-lavender shadow-[0_3px_0_0_var(--rose)] max-[768px]:w-4"
          />
          <h2 className="flex shrink-0 items-center gap-2.5 px-3.5 font-pixel text-[10px] font-normal tracking-[0.12em] text-wine max-[768px]:gap-1.5 max-[768px]:px-2 max-[768px]:text-[max(7px,1.4cqw)]">
            <span className="block h-1.5 w-1.5 rotate-45 bg-lavender" aria-hidden="true" />
            novoumy_terminal
          </h2>
          <span
            aria-hidden="true"
            className="h-[3px] min-w-4 flex-1 bg-lavender shadow-[0_3px_0_0_var(--rose)]"
          />
          <span className="flex shrink-0 items-center gap-2 px-3.5 font-pixel text-[8px] tracking-[0.14em] text-lavender max-[768px]:gap-1.5 max-[768px]:px-2 max-[768px]:text-[max(6px,1.1cqw)]">
            <span className="block h-2 w-2 animate-pulse bg-rose shadow-[0_0_0_2px_var(--rose)]" aria-hidden="true" />
            online
          </span>
          <span
            aria-hidden="true"
            className="h-[3px] w-8 shrink-0 bg-lavender shadow-[0_3px_0_0_var(--rose)] max-[768px]:w-4"
          />
        </header>

        {/* Output */}
        <div
          ref={outRef}
          role="log"
          onClick={() => inputRef.current?.focus()}
          className="term-out term-scroll relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-8 pb-4 pt-6 max-[768px]:px-4 max-[768px]:pb-2 max-[768px]:pt-5"
        >
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

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { hero } from '@/siteData';
import { mountBubbleBorder } from '@/lib/bubbleBorder';
import './main.css';

// ---- Visitor counter -------------------------------------------------------------------------
// One source of truth: a single hosted counter (counterapi.dev). Every device reads and bumps the
// same remote number, so PC and mobile can never disagree.
//  - A visit is counted at most once per browser per 12 hours (localStorage); otherwise we only read.
//  - The last number received is cached and painted instantly on load, then replaced by the live one.
//  - One shared in-flight promise means React StrictMode / remounts can never double-count.
const COUNTER_BASE = 'https://api.counterapi.dev/v1/novoumy-github-io/visits';
const CACHE_KEY = 'novoumy:visitors'; // also read by public/404.html
const COUNTED_AT_KEY = 'novoumy:counted-at';
const COUNT_WINDOW_MS = 12 * 60 * 60 * 1000;
const TIMEOUT_MS = 4000;

const storage = {
  get: (key: string) => { try { return localStorage.getItem(key); } catch { return null; } },
  set: (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* storage blocked */ } },
};

async function fetchCount(url: string): Promise<number> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const count = Number(((await res.json()) as { count?: unknown })?.count);
    if (!Number.isFinite(count) || count < 0) throw new Error('bad response');
    return count;
  } finally {
    window.clearTimeout(timer);
  }
}

let visitsPromise: Promise<number | null> | null = null;

function loadVisitors(): Promise<number | null> {
  visitsPromise ??= (async () => {
    const lastCounted = Number(storage.get(COUNTED_AT_KEY)) || 0;
    const shouldCount = Date.now() - lastCounted > COUNT_WINDOW_MS;
    // Mark first so a second tab / remount racing this one does not bump the counter again.
    if (shouldCount) storage.set(COUNTED_AT_KEY, String(Date.now()));
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const count = await fetchCount(shouldCount && attempt === 0 ? `${COUNTER_BASE}/up` : COUNTER_BASE);
        storage.set(CACHE_KEY, String(count));
        return count;
      } catch (error) {
        console.warn('[visitors] request failed:', error);
      }
    }
    if (shouldCount) storage.set(COUNTED_AT_KEY, '0'); // the hit never landed, so allow a retry next load
    return null;
  })();
  return visitsPromise;
}

const cachedVisitors = () => {
  const n = Number(storage.get(CACHE_KEY));
  return Number.isFinite(n) && n > 0 ? n : null;
};

const randomPing = () => 18 + Math.floor(Math.random() * 18); // 18..35

type Weather = { city: string; temp: number; code: number } | null;
const weatherPlace = { city: 'Frankfurt', lat: 50.11, lon: 8.682 };
const weatherLabel = (code: number) => {
  if (code === 0) return 'clear';
  if ([1, 2, 3].includes(code)) return 'cloudy';
  if ([45, 48].includes(code)) return 'fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([95, 96, 99].includes(code)) return 'storm';
  return 'weather';
};

// Organic bubble-cluster border between the pink status bars and the cream window. Drawn on a canvas where every
// bubble animates on its own clock (see lib/bubbleBorder.ts); styles live in main.css.
function PixelDivider({ position }: { position: 'top' | 'bottom' }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => (canvas.current ? mountBubbleBorder(canvas.current, position) : undefined), [position]);
  return (
    <div className={`pixel-divider pixel-divider-${position}`} aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  );
}

export default function MainView() {
  const [clock, setClock] = useState('');
  const [weather, setWeather] = useState<Weather>(null);
  const [visitors, setVisitors] = useState<number | null>(cachedVisitors);
  const [ping, setPing] = useState(randomPing);
  const pingTarget = useRef(ping);
  const weatherWord = weather
    ? `${weather.city.toUpperCase()} • ${Number.isFinite(weather.temp) ? `${weather.temp}°C • ${weatherLabel(weather.code).toUpperCase()}` : 'WEATHER UNAVAILABLE'}`
    : 'FRANKFURT • CHECKING WEATHER';
  
  useEffect(() => {
    const update = () => setClock(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Etc/GMT-3', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).format(new Date()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);


  // Ping: pick a new target every few seconds and glide to it one ms at a time.
  useEffect(() => {
    const retarget = window.setInterval(() => { pingTarget.current = randomPing(); }, 3500);
    const glide = window.setInterval(() => {
      setPing((current) => current === pingTarget.current ? current : current + Math.sign(pingTarget.current - current));
    }, 140);
    return () => { window.clearInterval(retarget); window.clearInterval(glide); };
  }, []);

  // Load the live total (the cached value is already on screen); retry later if the network failed.
  useEffect(() => {
    let alive = true;
    let timer = 0;
    const attempt = (n: number) => {
      if (n > 0) visitsPromise = null;
      void loadVisitors().then((count) => {
        if (!alive) return;
        if (count !== null) setVisitors(count);
        else if (n < 3) timer = window.setTimeout(() => attempt(n + 1), 10000);
      });
    };
    attempt(0);
    return () => { alive = false; window.clearTimeout(timer); };
  }, []);

  useEffect(() => {
    const place = weatherPlace;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}&current=temperature_2m,weather_code&timezone=auto`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setWeather({ city: place.city, temp: Math.round(data.current.temperature_2m), code: data.current.weather_code }))
      .catch(() => setWeather({ city: place.city, temp: NaN, code: -1 }));
  }, []);



  return (
    <div className="main-playground -mx-8 -my-8 flex min-h-[calc(100%+2rem)] flex-1 flex-col justify-between overflow-hidden p-0 max-sm:-mx-4 max-sm:-my-4 max-sm:min-h-[calc(100%+1rem)]">
      <div className="kinetic-words kinetic-top" aria-label="Live time and personal metadata">
        <span>{'GMT+3 • ' + (clock || '--:--:--')}</span>
        <span className="kw-center">OBSESSED WITH MINECRAFT</span>
        <span className="kw-end">PING: {String(ping).padStart(2, '0')}MS</span>
      </div>

      <PixelDivider position="top" />

      <section className="main-profile-center">
        <img src={hero.avatar} alt={hero.avatarAlt} className="main-profile-avatar" />
        <h1 className="main-profile-name">{hero.name}</h1>
        <div className="main-profile-bio">{hero.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </section>

      <PixelDivider position="bottom" />

      <div className="kinetic-words kinetic-bottom" aria-label="Personal metadata">
        <span>VISITORS: {visitors === null ? '----' : String(visitors).padStart(4, '0')}</span>
        <span className="kw-center">TINTED_LILAC</span>
        <span className="kw-end">{weatherWord}</span>
      </div>
    </div>
  );
}

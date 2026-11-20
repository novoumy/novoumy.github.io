import { useEffect, useRef, useState } from 'react';
import { hero } from '@/siteData';
import { syncDividerPhase } from '@/lib/dividerSync';
import './main.css';

// ---- Visitor counter -------------------------------------------------------------------------
// The site is static (GitHub Pages), so the shared total lives in a free hosted counter.
// Two providers are tried in order; whichever answered last time goes first so a browser keeps
// seeing one consistent number. A visit is counted once per browser session (tab switches and
// reloads only read the total). Every failure is logged as "[visitors] ..." in the console.
const NAMESPACE = 'novoumy-github-io';
const KEY = 'visits';
const CACHE_KEY = 'novoumy:visitors';
const SOURCE_KEY = 'novoumy:visitors-src';
const COUNTED_KEY = 'novoumy:counted';

type Provider = { id: string; hit: string; get: string; read: (json: unknown) => unknown };
const PROVIDERS: Provider[] = [
  {
    id: 'counterapi',
    hit: `https://api.counterapi.dev/v1/${NAMESPACE}/${KEY}/up`,
    get: `https://api.counterapi.dev/v1/${NAMESPACE}/${KEY}`,
    read: (json) => (json as { count?: unknown })?.count,
  },
  {
    id: 'abacus',
    hit: `https://abacus.jasoncameron.dev/hit/${NAMESPACE}/${KEY}`,
    get: `https://abacus.jasoncameron.dev/get/${NAMESPACE}/${KEY}`,
    read: (json) => (json as { value?: unknown })?.value,
  },
];

const store = {
  get: (area: 'local' | 'session', key: string) => {
    try { return (area === 'local' ? localStorage : sessionStorage).getItem(key); } catch { return null; }
  },
  set: (area: 'local' | 'session', key: string, value: string) => {
    try { (area === 'local' ? localStorage : sessionStorage).setItem(key, value); } catch { /* storage blocked */ }
  },
};

async function requestCount(provider: Provider, url: string): Promise<number> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const count = Number(provider.read(await res.json()));
    if (!Number.isFinite(count) || count < 0) throw new Error('unexpected response shape');
    return count;
  } finally {
    window.clearTimeout(timer);
  }
}

let visitsPromise: Promise<number | null> | null = null;

function loadVisitors(retry = false): Promise<number | null> {
  if (retry) visitsPromise = null;
  visitsPromise ??= (async () => {
    const counted = store.get('session', COUNTED_KEY) === '1';
    const preferred = store.get('local', SOURCE_KEY);
    const ordered = [...PROVIDERS].sort((a, b) => Number(b.id === preferred) - Number(a.id === preferred));
    for (const provider of ordered) {
      try {
        const count = await requestCount(provider, counted ? provider.get : provider.hit);
        store.set('session', COUNTED_KEY, '1');
        store.set('local', CACHE_KEY, String(count));
        store.set('local', SOURCE_KEY, provider.id);
        return count;
      } catch (error) {
        console.warn(`[visitors] ${provider.id} failed:`, error);
      }
    }
    const cached = Number(store.get('local', CACHE_KEY));
    return cached > 0 ? cached : null;
  })();
  return visitsPromise;
}

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

// Animated pixel-dither fade between the pink status bars and the cream window (styles in main.css).
function PixelDivider({ position }: { position: 'top' | 'bottom' }) {
  return (
    <div ref={syncDividerPhase} className={`pixel-divider pixel-divider-${position}`} aria-hidden="true">
      <i />
    </div>
  );
}

export default function MainView() {
  const [clock, setClock] = useState('');
  const [weather, setWeather] = useState<Weather>(null);
  const [visitors, setVisitors] = useState<number | null>(null);
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

  // Load the total; if nothing answered, try again a few times instead of leaving "----" forever.
  useEffect(() => {
    let alive = true;
    let timer = 0;
    const attempt = (n: number) => {
      void loadVisitors(n > 0).then((count) => {
        if (!alive) return;
        if (count !== null) setVisitors(count);
        if (count === null && n < 4) timer = window.setTimeout(() => attempt(n + 1), 15000);
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
    <div className="main-playground -mx-8 -my-8 flex min-h-0 h-[calc(100%+2rem)] flex-1 flex-col justify-between overflow-hidden p-0 max-sm:-mx-4 max-sm:-my-4 max-sm:h-[calc(100%+1rem)]">
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

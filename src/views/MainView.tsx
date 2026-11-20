import { useEffect, useRef, useState } from 'react';
import { hero } from '@/siteData';
import './terminal.css';

// ---- Visitor counter -------------------------------------------------------------------------
// Real, shared total via the free counterapi.dev service. A visit is counted once per browser
// session (so tab switches / reloads don't inflate it); later reads just fetch the total.
const COUNTER_URL = 'https://api.counterapi.dev/v1/novoumy-github-io/visits';
const CACHE_KEY = 'novoumy:visitors';
let visitsPromise: Promise<number | null> | null = null;

function loadVisitors(): Promise<number | null> {
  visitsPromise ??= (async () => {
    let counted = false;
    try { counted = sessionStorage.getItem('novoumy:counted') === '1'; } catch { /* storage blocked */ }
    try {
      const res = await fetch(counted ? COUNTER_URL : `${COUNTER_URL}/up`);
      if (!res.ok) throw new Error(String(res.status));
      const count = Number((await res.json()).count);
      if (!Number.isFinite(count)) throw new Error('bad count');
      try { sessionStorage.setItem('novoumy:counted', '1'); localStorage.setItem(CACHE_KEY, String(count)); } catch { /* ignore */ }
      return count;
    } catch {
      try { const cached = Number(localStorage.getItem(CACHE_KEY)); return cached > 0 ? cached : null; } catch { return null; }
    }
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

// Animated pixel-art border between the pink status bars and the cream window (styles in terminal.css).
function PixelDivider({ position }: { position: 'top' | 'bottom' }) {
  return (
    <div className={`pixel-divider pixel-divider-${position}`} aria-hidden="true">
      <i className="pd-fill" />
      <i className="pd-line" />
      <i className="pd-gems" />
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

  useEffect(() => {
    let alive = true;
    void loadVisitors().then((count) => { if (alive) setVisitors(count); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const place = weatherPlace;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}&current=temperature_2m,weather_code&timezone=auto`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setWeather({ city: place.city, temp: Math.round(data.current.temperature_2m), code: data.current.weather_code }))
      .catch(() => setWeather({ city: place.city, temp: NaN, code: -1 }));
  }, []);

  const bio = hero.bio.filter((line) => line.replace(/\u00A0/g, '').trim() && !line.startsWith('>') && !line.toUpperCase().includes('A SMALL CORNER OF THE INTERNET'));


  return (
    <div className="main-playground -mx-8 -my-8 flex min-h-0 h-[calc(100%+2rem)] flex-1 flex-col justify-between overflow-hidden p-0 max-sm:-mx-4 max-sm:-my-4 max-sm:h-[calc(100%+1rem)]">
      <div className="kinetic-words kinetic-top" aria-label="Live time and personal metadata">
        <span>{'GMT+3 • ' + (clock || '--:--:--')}</span>
        <span className="kw-center">OBSESSED WITH MINECRAFT</span>
        <span className="kw-end">PING: {String(ping).padStart(2, '0')}MS</span>
      </div>

      <PixelDivider position="top" />

      <section className="main-profile-center">
        <img src={hero.avatar} alt={hero.avatarAlt} className="pixel-frame main-profile-avatar" />
        <h1 className="main-profile-name">{hero.name}</h1>
        <div className="main-profile-bio">{bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
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

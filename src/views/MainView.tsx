import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { hero } from '@/siteData';
import { mountBubbleBorder } from '@/lib/bubbleBorder';
import './main.css';

const randomPing = () => 18 + Math.floor(Math.random() * 18); // 18..35
const randomFps = () => 170 + Math.floor(Math.random() * 51); // 170..220

type Weather = { temp: number; code: number } | null;
const weatherPlace = { lat: 50.11, lon: 8.682 };
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
  const [ping, setPing] = useState(randomPing);
  const pingTarget = useRef(ping);
  const [fps, setFps] = useState(randomFps);
  const fpsTarget = useRef(fps);
  const weatherWord = weather
    ? Number.isFinite(weather.temp) ? `${weather.temp}°C • ${weatherLabel(weather.code).toUpperCase()}` : 'WEATHER UNAVAILABLE'
    : 'CHECKING WEATHER';

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

  // FPS: same idea as ping, drifting between 170 and 220.
  useEffect(() => {
    const retarget = window.setInterval(() => { fpsTarget.current = randomFps(); }, 2500);
    const glide = window.setInterval(() => {
      setFps((current) => current === fpsTarget.current ? current : current + Math.sign(fpsTarget.current - current));
    }, 60);
    return () => { window.clearInterval(retarget); window.clearInterval(glide); };
  }, []);

  useEffect(() => {
    const place = weatherPlace;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}&current=temperature_2m,weather_code&timezone=auto`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setWeather({ temp: Math.round(data.current.temperature_2m), code: data.current.weather_code }))
      .catch(() => setWeather({ temp: NaN, code: -1 }));
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
        <div className="main-profile-text">
          <div className="main-profile-hello">&gt; HELLO, I'M</div>
          <h1 className="main-profile-name">{hero.name}</h1>
          <div className="main-profile-bio">{hero.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </div>
      </section>

      <PixelDivider position="bottom" />

      <div className="kinetic-words kinetic-bottom" aria-label="Personal metadata">
        <span>FPS: {fps}</span>
        <span className="kw-center">TINTED_LILAC</span>
        <span className="kw-end">{weatherWord}</span>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { hero } from '@/siteData';
import './terminal.css';

type Drift = { x: number; y: number };
type Weather = { city: string; temp: number; code: number } | null;
const weatherPlaces = [
  { city: 'Berlin', lat: 52.52, lon: 13.405 },
  { city: 'Hamburg', lat: 53.55, lon: 9.993 },
  { city: 'Dresden', lat: 51.05, lon: 13.738 },
  { city: 'Leipzig', lat: 51.34, lon: 12.374 },
  { city: 'Cologne', lat: 50.938, lon: 6.96 },
  { city: 'Frankfurt', lat: 50.11, lon: 8.682 },
];
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

export default function MainView() {
  const topRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const bottomRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [topDrift, setTopDrift] = useState<Drift[]>([]);
  const [bottomDrift, setBottomDrift] = useState<Drift[]>([]);
  const [clock, setClock] = useState('');
  const [weather, setWeather] = useState<Weather>(null);
  const topWords = ['GMT+3 · ' + (clock || '--:--:--'), 'OBSESSED WITH MINECRAFT', 'TINTED_LILAC'];
  const bottomWords = ['MINECRAFT', 'TINTED_LILAC', weather ? `WEATHER · ${Number.isFinite(weather.temp) ? `${weather.temp}°C · ${weatherLabel(weather.code).toUpperCase()}` : 'UNAVAILABLE'}` : 'WEATHER · CHECKING'];

  useEffect(() => {
    const update = () => setClock(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Etc/GMT-3', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).format(new Date()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const place = weatherPlaces[Math.floor(Math.random() * weatherPlaces.length)]!;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}&current=temperature_2m,weather_code&timezone=auto`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setWeather({ city: place.city, temp: Math.round(data.current.temperature_2m), code: data.current.weather_code }))
      .catch(() => setWeather({ city: place.city, temp: NaN, code: -1 }));
  }, []);

  useEffect(() => {
    setTopDrift(topWords.map(() => ({ x: 0, y: 0 })));
    setBottomDrift(bottomWords.map(() => ({ x: 0, y: 0 })));
  }, [topWords.length, bottomWords.length]);


  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const pushAway = (refs: (HTMLSpanElement | null)[]) => refs.map((el) => {
      if (!el) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      const dx = (rect.left + rect.width / 2) - event.clientX;
      const dy = (rect.top + rect.height / 2) - event.clientY;
      const distance = Math.hypot(dx, dy);
      if (distance > 140 || distance < 1) return { x: 0, y: 0 };
      const strength = (1 - distance / 140) * 24;
      return { x: (dx / distance) * strength, y: (dy / distance) * strength };
    });
    setTopDrift(pushAway(topRefs.current));
    setBottomDrift(pushAway(bottomRefs.current));
  };
  const resetDrift = () => {
    setTopDrift(topWords.map(() => ({ x: 0, y: 0 })));
    setBottomDrift(bottomWords.map(() => ({ x: 0, y: 0 })));
  };
  const bio = hero.bio.filter((line) => line.replace(/\u00A0/g, '').trim() && !line.startsWith('>'));

  return (
    <div className="main-playground -mx-8 -mb-8 flex min-h-0 h-[calc(100%+2rem)] flex-1 flex-col justify-between overflow-hidden px-5 py-5 max-sm:-mx-4 max-sm:-mb-4 max-sm:h-[calc(100%+1rem)] max-sm:px-3 max-sm:py-4" onMouseMove={onMouseMove} onMouseLeave={resetDrift}>
      <div className="kinetic-words kinetic-top" aria-label="Live time, weather, and personal metadata">
        {topWords.map((word, i) => <span key={word} ref={(el) => { topRefs.current[i] = el; }} style={{ transform: `translate(${topDrift[i]?.x ?? 0}px, ${topDrift[i]?.y ?? 0}px)` }}>{word}</span>)}
      </div>

      <section className="main-profile-center">
        <img src={hero.avatar} alt={hero.avatarAlt} className="pixel-frame main-profile-avatar" />
        <h1 className="main-profile-name">{hero.name}</h1>
        <div className="main-profile-bio">{bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </section>

      <div className="kinetic-words kinetic-bottom" aria-label="Personal metadata">
        {bottomWords.map((word, i) => <span key={word} ref={(el) => { bottomRefs.current[i] = el; }} style={{ transform: `translate(${bottomDrift[i]?.x ?? 0}px, ${bottomDrift[i]?.y ?? 0}px)` }}>{word}</span>)}
      </div>
    </div>
  );
}

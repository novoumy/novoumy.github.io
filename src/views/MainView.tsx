import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { hero } from '@/siteData';
import { Clock3, CloudSun, Gamepad2, Music2, Sparkles } from 'lucide-react';
import './terminal.css';

type Drift = { x: number; y: number };
type Weather = { city: string; temp: number; code: number } | null;
const TOP_WORDS = ['GMT+3', 'MINECRAFT', '1440P / 180HZ', 'TINTED_LILAC', 'NOV 2025'];
const BOTTOM_WORDS = ['PC GAMING', 'CURRENTLY: MINECRAFT', 'WINDOWS 11', 'PIXEL ART FAN'];
const weatherPlaces = [
  { city: 'Berlin', lat: 52.52, lon: 13.405 },
  { city: 'Hamburg', lat: 53.55, lon: 9.993 },
  { city: 'Dresden', lat: 51.05, lon: 13.738 },
  { city: 'Leipzig', lat: 51.34, lon: 12.374 },
  { city: 'Cologne', lat: 50.938, lon: 6.96 },
  { city: 'Frankfurt', lat: 50.11, lon: 8.682 },
];
const weatherLabel = (code: number) => {
  if (code === 0) return 'Clear';
  if ([1, 2, 3].includes(code)) return 'Cloudy';
  if ([45, 48].includes(code)) return 'Fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([95, 96, 99].includes(code)) return 'Storm';
  return 'Weather';
};

export default function MainView() {
  const topRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const bottomRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [topDrift, setTopDrift] = useState<Drift[]>(TOP_WORDS.map(() => ({ x: 0, y: 0 })));
  const [bottomDrift, setBottomDrift] = useState<Drift[]>(BOTTOM_WORDS.map(() => ({ x: 0, y: 0 })));
  const [clock, setClock] = useState('');
  const [weather, setWeather] = useState<Weather>(null);

  useEffect(() => {
    const update = () => setClock(new Intl.DateTimeFormat('en-GB', { timeZone: 'Etc/GMT-3', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const place = weatherPlaces[Math.floor(Math.random() * weatherPlaces.length)];
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}&current=temperature_2m,weather_code&timezone=auto`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setWeather({ city: place.city, temp: Math.round(data.current.temperature_2m), code: data.current.weather_code }))
      .catch(() => setWeather({ city: place.city, temp: 0, code: -1 }));
  }, []);

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const pushAway = (refs: (HTMLSpanElement | null)[]) => refs.map((el) => {
      if (!el) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      const dx = (rect.left + rect.width / 2) - event.clientX;
      const dy = (rect.top + rect.height / 2) - event.clientY;
      const distance = Math.hypot(dx, dy);
      if (distance > 140 || distance < 1) return { x: 0, y: 0 };
      const strength = (1 - distance / 140) * 28;
      return { x: (dx / distance) * strength, y: (dy / distance) * strength };
    });
    setTopDrift(pushAway(topRefs.current));
    setBottomDrift(pushAway(bottomRefs.current));
  };
  const resetDrift = () => {
    setTopDrift(TOP_WORDS.map(() => ({ x: 0, y: 0 })));
    setBottomDrift(BOTTOM_WORDS.map(() => ({ x: 0, y: 0 })));
  };

  return (
    <div className="main-playground -mx-8 -mb-8 flex min-h-0 h-[calc(100%+2rem)] flex-1 flex-col justify-between overflow-hidden px-5 py-5 max-sm:-mx-4 max-sm:-mb-4 max-sm:h-[calc(100%+1rem)] max-sm:px-3 max-sm:py-4" onMouseMove={onMouseMove} onMouseLeave={resetDrift}>
      <div className="kinetic-words kinetic-top" aria-label="Personal metadata">
        {TOP_WORDS.map((word, i) => <span key={word} ref={(el) => { topRefs.current[i] = el; }} style={{ transform: `translate(${topDrift[i]?.x ?? 0}px, ${topDrift[i]?.y ?? 0}px)` }}>{word}</span>)}
      </div>

      <section className="main-profile-bento">
        <div className="main-profile-left pixel-tile">
          <img src={hero.avatar} alt={hero.avatarAlt} className="pixel-frame main-profile-avatar" />
          <h1 className="main-profile-name">{hero.name}</h1>
          <div className="main-profile-level">LVL. 99 PC DWELLER</div>
          <div className="main-current-box"><span className="main-mini-label">CURRENTLY</span><span><Gamepad2 size={13}/> Minecraft</span></div>
        </div>
        <div className="main-profile-right">
          <div className="main-bio-box pixel-tile">
            <div className="main-mini-label"><Sparkles size={12}/> ABOUT</div>
            <div className="main-profile-bio">{hero.bio.filter((line) => line.replace(/\u00A0/g, '').trim() && !line.startsWith('>')).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </div>
          <div className="main-info-grid">
            <div className="main-info-tile pixel-tile"><div className="main-mini-label"><Clock3 size={12}/> LOCAL TIME</div><strong>{clock || '--:--:--'}</strong><small>GMT+3</small></div>
            <div className="main-info-tile pixel-tile"><div className="main-mini-label"><CloudSun size={12}/> WEATHER</div><strong>{weather ? (weather.code >= 0 ? `${weather.temp}°C` : '—') : '...'}</strong><small>{weather ? `${weather.city} · ${weatherLabel(weather.code)}` : 'Random city'}</small></div>
            <a className="main-info-tile pixel-tile main-minecraft-tile" href="https://www.minecraft.net/" target="_blank" rel="noopener noreferrer"><div className="main-mini-label"><Gamepad2 size={12}/> FAVORITE GAME</div><strong>Minecraft <span aria-hidden="true">↗</span></strong><small>building, exploring, surviving</small></a>
            <div className="main-info-tile pixel-tile"><div className="main-mini-label"><Music2 size={12}/> ON MY PC</div><strong>TINTED_LILAC</strong><small>my rig's nickname</small></div>
          </div>
        </div>
      </section>

      <div className="kinetic-words kinetic-bottom" aria-label="Personal metadata">
        {BOTTOM_WORDS.map((word, i) => <span key={word} ref={(el) => { bottomRefs.current[i] = el; }} style={{ transform: `translate(${bottomDrift[i]?.x ?? 0}px, ${bottomDrift[i]?.y ?? 0}px)` }}>{word}</span>)}
      </div>
    </div>
  );
}

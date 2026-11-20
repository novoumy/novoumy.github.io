import { useEffect, useState } from 'react';
import { hero } from '@/siteData';
import { Clock3, CloudSun } from 'lucide-react';
import './terminal.css';

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
  const prose = hero.bio.filter((line) => {
    const t = line.replace(/\u00A0/g, '').trim();
    return t && !line.startsWith('>');
  });
  const [clock, setClock] = useState('');
  const [weather, setWeather] = useState<Weather>(null);

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

  return (
    <div className="-mx-8 -mb-8 flex h-[calc(100%+2rem)] min-h-0 min-w-0 flex-col max-sm:-mx-4 max-sm:-mb-4 max-sm:h-[calc(100%+1rem)]">
      {/* Profile: original layout restored */}
      <div className="px-8 pb-12 pt-8 max-sm:px-4 max-sm:pb-9 max-sm:pt-4">
        <div className="grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-2 max-[768px]:flex max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-3">
          <img src={hero.avatar} alt={hero.avatarAlt} className="pixel-frame row-span-2 aspect-square w-28 shrink-0 object-cover max-[768px]:w-20 max-[768px]:self-center" />
          <h1 className="min-w-0 break-words text-2xl tracking-wide max-[768px]:w-full max-[768px]:text-center max-[768px]:text-[clamp(14px,4vw,18px)]">{hero.name}</h1>
          <div className="col-start-2 flex min-w-0 flex-col gap-1 max-[768px]:w-full max-[768px]:items-center max-[768px]:text-center">
            {prose.map((paragraph) => <p key={paragraph} className="leading-[1.35] max-[768px]:text-[clamp(14px,3.7vw,17px)] max-[768px]:leading-[1.25]">{paragraph}</p>)}
          </div>
        </div>
      </div>


      {/* Replaces the terminal with real, lightweight personal info */}
      <section className="term term-crt relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-20 flex h-7 shrink-0 items-center gap-3 bg-gradient-to-b from-cool-white from-50% to-[color:var(--t-bg)] to-50% px-8 font-pixel uppercase leading-none max-[768px]:px-4">
          <h2 className="shrink-0 font-pixel text-[9px] font-normal tracking-[0.14em] text-wine max-[768px]:text-[8px]">LOCAL TIME & WEATHER</h2>
          <span aria-hidden="true" className="h-[2px] min-w-4 flex-1 bg-rose" />
          <span className="shrink-0 text-[8px] tracking-[0.14em] text-lavender max-[768px]:text-[7px]">GMT+3</span>
        </header>
        <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-8 py-8 max-[768px]:px-4 max-[768px]:py-5">
          <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="border-2 border-rose/70 bg-[color:var(--t-bg)] p-4 sm:p-5">
              <div className="flex items-center gap-2 text-lavender"><Clock3 size={14}/><span className="font-pixel text-[8px] uppercase">Time in GMT+3</span></div>
              <div className="mt-3 font-pixel text-[clamp(20px,4vw,34px)] leading-none text-wine tabular-nums">{clock || '--:--:--'}</div>
              <div className="mt-2 text-[16px] opacity-65">local time, live</div>
            </div>
            <div className="border-2 border-rose/70 bg-[color:var(--t-bg)] p-4 sm:p-5">
              <div className="flex items-center gap-2 text-lavender"><CloudSun size={14}/><span className="font-pixel text-[8px] uppercase">Somewhere random</span></div>
              <div className="mt-3 font-pixel text-[clamp(20px,4vw,34px)] leading-none text-wine">{weather && Number.isFinite(weather.temp) ? `${weather.temp}°C` : '—'}</div>
              <div className="mt-2 text-[16px] opacity-65">{weather ? `${weather.city} · ${weatherLabel(weather.code)}` : 'checking weather...'}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

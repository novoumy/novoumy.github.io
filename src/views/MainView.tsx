import { useEffect, useState } from 'react';
import { hero } from '@/siteData';
import './terminal.css';

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

export default function MainView() {
  const [clock, setClock] = useState('');
  const [weather, setWeather] = useState<Weather>(null);
  const weatherWord = weather
    ? `${weather.city.toUpperCase()} • ${Number.isFinite(weather.temp) ? `${weather.temp}°C • ${weatherLabel(weather.code).toUpperCase()}` : 'WEATHER UNAVAILABLE'}`
    : 'FRANKFURT • CHECKING WEATHER';
  const topWords = ['GMT+3 • ' + (clock || '--:--:--'), 'OBSESSED WITH MINECRAFT', 'TINTED_LILAC'];
  const bottomWords = ['MINECRAFT', 'TINTED_LILAC', weatherWord];

  useEffect(() => {
    const update = () => setClock(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Etc/GMT-3', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).format(new Date()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
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
        {topWords.map((word) => <span key={word}>{word}</span>)}
      </div>


      <section className="main-profile-center">
        <img src={hero.avatar} alt={hero.avatarAlt} className="pixel-frame main-profile-avatar" />
        <h1 className="main-profile-name">{hero.name}</h1>
        <div className="main-profile-bio">{bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </section>


      <div className="kinetic-words kinetic-bottom" aria-label="Personal metadata">
        {bottomWords.map((word) => <span key={word}>{word}</span>)}
      </div>
    </div>
  );
}

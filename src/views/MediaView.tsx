import { useEffect, useState } from 'react';
import PixelBadge from '@/components/PixelBadge';
import { media, mediaFilters, type MediaItem } from '@/siteData';

type Filter = (typeof mediaFilters)[number]['value'];

const WIDE_QUERY = '(min-width: 640px)';

function useColumnCount() {
  const [columns, setColumns] = useState(() => (window.matchMedia(WIDE_QUERY).matches ? 3 : 2));

  useEffect(() => {
    const query = window.matchMedia(WIDE_QUERY);
    const onChange = (event: MediaQueryListEvent) => setColumns(event.matches ? 3 : 2);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return columns;
}

export default function MediaView() {
  const [filter, setFilter] = useState<Filter>('all');
  const columns = useColumnCount();

  const visible = filter === 'all' ? media : media.filter((item) => item.category === filter);

  return (
    <div className="flex flex-col gap-6">
      <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
        {mediaFilters.map((option) => {
          const active = option.value === filter;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(option.value)}
              className={[
                'pixel-tile px-3 py-2 font-pixel text-[9px] uppercase transition-colors duration-150',
                active ? 'bg-wine text-cool-white' : 'bg-cool-white text-wine hover:bg-rose',
              ].join(' ')}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p>Nothing here yet.</p>
      ) : (
        <ul className="grid gap-5 pb-5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {visible.map((item) => (
            <li key={item.title}>
              <MediaCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// The whole card is a link: clicking opens the external page in a new tab.
function MediaCard({ item }: { item: MediaItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${item.title} (${item.year}), opens in a new tab`}
      className="pixel-tile pixel-tile-interactive group flex h-full w-full flex-col gap-3 bg-cool-white p-3 text-left"
    >
      <div className="relative">
        <img
          src={item.poster}
          alt={`${item.title} poster`}
          loading="lazy"
          className="aspect-[2/3] w-full object-cover"
        />
        <span className="absolute bottom-2 left-2">
          <PixelBadge>{item.category}</PixelBadge>
        </span>
        <span className="absolute bottom-2 right-2">
          <PixelBadge>{item.year}</PixelBadge>
        </span>
      </div>
      <h3 className="text-[10px] leading-[1.6]">{item.title}</h3>
    </a>
  );
}

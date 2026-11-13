import { ExternalLink, Play } from 'lucide-react';
import Equalizer from '@/components/Equalizer';
import PixelBadge from '@/components/PixelBadge';
import { tracks, type TrackItem } from '@/siteData';

// Album cover in front, a spinning vinyl record peeking out from behind it.
function Record({ track }: { track: TrackItem }) {
  return (
    <div className="relative aspect-[6/5] w-full">
      <div className="absolute right-0 top-1/2 aspect-square h-[90%] -translate-y-1/2">
        <div aria-hidden="true" className="vinyl absolute inset-0 rounded-full">
          <span className="absolute inset-[34%] rounded-full bg-rose" />
          <span className="absolute inset-[46%] rounded-full bg-cool-white" />
        </div>
      </div>
      <img
        src={track.cover}
        alt={`${track.title} cover art`}
        loading="lazy"
        className="absolute left-0 top-0 z-10 aspect-square h-full object-cover shadow-[0_0_0_4px_var(--wine)]"
      />
    </div>
  );
}

function NowPlaying({ track }: { track: TrackItem }) {
  return (
    <a
      href={track.link}
      target="_blank"
      rel="noopener noreferrer"
      className="pixel-tile pixel-tile-interactive group flex flex-col gap-6 bg-rose p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6"
    >
      <div className="w-full px-1 sm:w-[48%] sm:shrink-0">
        <Record track={track} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <PixelBadge>Now playing</PixelBadge>
          <Equalizer live />
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-[12px] leading-[1.6] sm:text-sm">{track.title}</h3>
          <p className="text-[26px] leading-none">{track.artist}</p>
        </div>

        <div aria-hidden="true" className="h-4 bg-cool-white p-[3px] shadow-[inset_0_0_0_3px_var(--wine)]">
          <div className="progress-fill h-full bg-wine" />
        </div>

        <span className="pixel-btn self-start px-4 py-3 text-[9px] group-hover:bg-cool-white group-hover:text-wine">
          <Play size={14} fill="currentColor" aria-hidden="true" />
          Play on {track.linkLabel}
          <ExternalLink size={14} aria-hidden="true" />
        </span>
      </div>
    </a>
  );
}

function CrateCard({ track, number }: { track: TrackItem; number: number }) {
  return (
    <a
      href={track.link}
      target="_blank"
      rel="noopener noreferrer"
      className="pixel-tile pixel-tile-interactive group flex h-full flex-col gap-3 bg-cool-white p-3"
    >
      <Record track={track} />
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="truncate text-[10px] leading-[1.6]">{track.title}</h3>
        <p className="truncate leading-none">{track.artist}</p>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="font-pixel text-[9px] text-wine">{String(number).padStart(2, '0')}</span>
        <Equalizer />
        <span className="flex items-center gap-1 bg-wine px-2 py-1 font-pixel text-[8px] uppercase leading-none text-cool-white group-hover:bg-rose group-hover:text-wine">
          <Play size={10} fill="currentColor" aria-hidden="true" />
          {track.linkLabel}
        </span>
      </div>
    </a>
  );
}

export default function MusicView() {
  if (tracks.length === 0) return <p>No tracks yet.</p>;

  const [current, ...rest] = tracks;

  return (
    <div className="flex flex-col gap-8">
      <NowPlaying track={current} />

      {rest.length > 0 && (
        <section className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <h2 className="shrink-0 text-[10px] uppercase">Up next</h2>
            <span aria-hidden="true" className="h-1 flex-1 bg-rose" />
            <span className="shrink-0 font-pixel text-[9px]">{String(rest.length).padStart(2, '0')}</span>
          </div>
          <ul className="grid grid-cols-2 gap-5 pb-5 sm:grid-cols-3">
            {rest.map((track, index) => (
              <li key={`${track.title}-${index}`}>
                <CrateCard track={track} number={index + 2} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

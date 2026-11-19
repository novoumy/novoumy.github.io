import { FileText, Headphones, Youtube } from 'lucide-react';
import RetroOverlay from '@/components/RetroOverlay';
import { tracks, type TrackItem } from '@/siteData';

// Music folder: every song is a vinyl record sliding out of its sleeve, with links
// to Spotify, Genius and YouTube. There is no built-in player on purpose.
export default function MusicView({ onClose }: { onClose: () => void }) {
  return (
    <RetroOverlay label="Music library" meta={`${tracks.length} records`} onClose={onClose} accent="music">
      <aside className="pixel-tile mb-10 bg-r-bg">
        <h3 className="bg-wine px-3 py-2.5 text-[9px] uppercase leading-none text-cool-white sm:text-[10px]">&gt; record_crate</h3>
        <p className="px-3 py-3 text-[21px] leading-[1.3] text-r-text sm:px-4 sm:text-[22px]">
          Songs on repeat. Pick a record and jump to Spotify, Genius or YouTube.
        </p>
      </aside>

      <ul className="grid gap-x-10 gap-y-12 pb-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,440px),1fr))] max-sm:gap-y-10">
        {tracks.map((track, index) => (
          <VinylCard key={track.id} track={track} index={index} />
        ))}
      </ul>
    </RetroOverlay>
  );
}

function VinylCard({ track, index }: { track: TrackItem; index: number }) {
  // Records are split into sides of 8, like a double LP: A1..A8, B1..B8, ...
  const side = String.fromCharCode(65 + Math.floor(index / 8));
  const slot = (index % 8) + 1;
  const links = [
    { href: track.spotifyUrl, label: 'Spotify', aria: `${track.title} on Spotify`, Icon: Headphones },
    { href: track.geniusUrl, label: 'Genius', aria: `${track.title} lyrics on Genius`, Icon: FileText },
    { href: track.youtubeUrl, label: 'YouTube', aria: `${track.title} on YouTube`, Icon: Youtube },
  ];

  return (
    <li className="vinyl-card r-box grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-5 gap-y-4 p-4 sm:gap-x-7 sm:p-5">
      <div className="vinyl-stage h-[96px] w-[136px] sm:h-[128px] sm:w-[184px]" aria-hidden="true">
        <div className="vinyl-disc">
          <div className="vinyl-spin">
            <img src={track.coverUrl} alt="" loading="lazy" decoding="async" className="vinyl-label" />
            <span className="vinyl-hole" />
          </div>
        </div>
        <img src={track.coverUrl} alt="" loading="lazy" decoding="async" className="vinyl-sleeve" />
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <p className="flex flex-wrap items-center gap-2 font-pixel text-[7px] uppercase leading-none text-r-dim sm:text-[8px]">
          <span className="bg-accent px-1.5 py-1 text-cool-white">
            {side}
            {slot}
          </span>
          <span className="truncate">{track.genre}</span>
          {track.duration && <span className="tabular-nums">{track.duration}</span>}
        </p>
        <h3 className="line-clamp-2 break-words text-[10px] leading-[1.6] text-r-text sm:text-[12px]">{track.title}</h3>
        <p className="truncate text-[24px] leading-none text-r-text sm:text-[26px]">{track.artist}</p>
        {track.album && <p className="truncate text-[19px] leading-none text-r-dim">{track.album}</p>}
      </div>

      <div className="col-span-2 grid grid-cols-3 gap-2.5 sm:gap-3">
        {links.map(({ href, label, aria, Icon }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={aria} className="r-link">
            <Icon size={13} strokeWidth={2.5} aria-hidden="true" className="shrink-0 max-sm:hidden" />
            <span>{label}</span>
          </a>
        ))}
      </div>
    </li>
  );
}

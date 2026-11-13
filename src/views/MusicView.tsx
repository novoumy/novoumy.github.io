import { ExternalLink, Music2 } from 'lucide-react';
import Equalizer from '@/components/Equalizer';
import { tracks } from '@/siteData';

export default function MusicView() {
  return (
    <ul className="flex flex-col gap-3">
      {tracks.map((track, index) => (
        <li
          key={`${track.title}-${index}`}
          className="group pixel-tile flex items-center gap-4 bg-cool-white p-2 pr-3 sm:p-3"
        >
          <div className="relative shrink-0">
            <img
              src={track.cover}
              alt={`${track.title} cover art`}
              loading="lazy"
              className="aspect-square w-14 object-cover sm:w-16"
            />
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center bg-rose text-wine">
              <Music2 size={14} aria-hidden="true" />
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <h3 className="truncate text-[10px] leading-[1.6] sm:text-[11px]">{track.title}</h3>
            <p className="truncate leading-none">{track.artist}</p>
          </div>

          <Equalizer />

          <a
            href={track.link}
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-btn shrink-0 px-3 py-2 text-[8px] sm:text-[9px]"
          >
            <ExternalLink size={14} aria-hidden="true" />
            <span className="hidden sm:inline">{track.linkLabel}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

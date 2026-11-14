import { ArrowUpRight, ExternalLink } from 'lucide-react';
import PixelIcon from '@/components/PixelIcon';
import { PIXEL_ICONS } from '@/lib/pixelIcons';
import { useCopy } from '@/lib/useCopy';
import { socials, type SocialItem } from '@/siteData';

function SocialGlyph({ social, className }: { social: SocialItem; className: string }) {
  if (social.image) return <img src={social.image} alt="" loading="lazy" className={`${className} object-cover`} />;
  if (social.icon && social.icon in PIXEL_ICONS) return <PixelIcon name={social.icon} className={className} />;
  return <ExternalLink aria-hidden="true" className={className} />;
}

const copyBtn =
  'pixel-btn min-w-[104px] !text-[9px] !py-3 data-[copied=true]:!bg-rose data-[copied=true]:!text-wine';

export default function SocialsView() {
  const featured = socials.find((s) => s.featured) ?? null;
  const others = socials.filter((s) => s !== featured);
  const email = socials.find((s) => s.icon === 'mail');
  const username = useCopy();
  const address = useCopy();

  return (
    <div className="flex min-h-full flex-col gap-5">
      <p className="leading-none">
        &gt; establishing_connection... // {socials.length} active nodes found
        <span className="blink-arrow ml-1">_</span>
      </p>

      {featured && (
        <section className="pixel-tile flex flex-col gap-4 bg-cool-white p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <SocialGlyph social={featured} className="h-14 w-14 shrink-0 sm:h-16 sm:w-16" />
            <div className="flex min-w-0 flex-col gap-2">
              <span className="w-fit bg-wine px-2 py-1.5 font-pixel text-[8px] uppercase leading-none text-cool-white">
                [ Best way to reach me ]
              </span>
              <span className="font-pixel text-[10px] uppercase leading-[1.4]">
                {featured.platform} <span className="opacity-60">// primary comms</span>
              </span>
              <span className="truncate text-[22px] leading-none">{featured.handle}</span>
            </div>
          </div>
          <div className="flex gap-3 sm:shrink-0">
            <button
              type="button"
              data-no-sfx
              data-copied={username.copied}
              onClick={() => username.copy(featured.handle)}
              className={`${copyBtn} flex-1 sm:flex-none`}
            >
              {username.copied ? 'Copied!' : 'Copy name'}
            </button>
            <a
              href={featured.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${featured.platform}`}
              className="pixel-btn !py-3 flex-1 sm:flex-none"
            >
              Open <ArrowUpRight size={14} strokeWidth={3} aria-hidden="true" />
            </a>
          </div>
        </section>
      )}

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {others.map((social) => (
          <li key={`${social.platform}-${social.url}`} className="flex">
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-tile pixel-tile-interactive group flex w-full min-w-0 items-center gap-4 bg-cool-white p-4"
            >
              <SocialGlyph social={social} className="h-10 w-10 shrink-0" />
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="font-pixel text-[10px] uppercase leading-none">{social.platform}</span>
                <span className="truncate text-[20px] leading-none">{social.handle}</span>
              </span>
              <ArrowUpRight
                size={20}
                strokeWidth={3}
                aria-hidden="true"
                className="shrink-0 transition-transform duration-150 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </a>
          </li>
        ))}
      </ul>

      {email && (
        <button
          type="button"
          data-no-sfx
          onClick={() => address.copy(email.handle)}
          className="pixel-tile pixel-tile-interactive mt-auto flex w-full items-center justify-between gap-3 bg-wine px-4 py-3 text-left text-cool-white hover:!bg-rose hover:text-wine"
        >
          <span className="min-w-0 truncate text-[20px] leading-none">
            <span className="mr-2 font-pixel text-[9px] uppercase">Copy email:</span>
            {email.handle}
          </span>
          <span className="shrink-0 font-pixel text-[9px] uppercase">
            {address.copied ? 'Copied!' : '[ Copy ]'}
          </span>
        </button>
      )}
    </div>
  );
}

import { ArrowUpRight, Check, Copy } from 'lucide-react';
import PixelIcon from '@/components/PixelIcon';
import { PIXEL_ICONS } from '@/lib/pixelIcons';
import { useCopy } from '@/lib/useCopy';
import { hero, socials, type SocialItem } from '@/siteData';

const HANDLE = 'novoumy';

function SocialGlyph({ social, className }: { social: SocialItem; className: string }) {
  if (social.image) return <img src={social.image} alt="" loading="lazy" className={`${className} object-cover`} />;
  if (social.icon && social.icon in PIXEL_ICONS) return <PixelIcon name={social.icon} className={className} />;
  return <PixelIcon name="github" className={className} />;
}

// Flat layout: everything sits directly in the main window frame, no inner card.
export default function SocialsView() {
  const email = socials.find((s) => s.icon === 'mail') ?? null;
  const links = socials.filter((s) => s !== email);
  const address = useCopy();

  return (
    <div className="flex min-h-full flex-col gap-6 sm:gap-8">
      {/* Identity */}
      <div className="flex items-center gap-4 sm:gap-6">
        <img
          src={hero.avatar}
          alt={hero.avatarAlt}
          className="pixel-tile aspect-square w-16 shrink-0 bg-rose/40 object-cover sm:w-24"
        />
        <h1 className="min-w-0 break-words text-xl tracking-wide sm:text-3xl">{HANDLE}</h1>
      </div>

      {/* Link tiles */}
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
        {links.map((social) => (
          <li key={`${social.platform}-${social.url}`} className="flex">
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${social.platform}${social.handle ? ` (${social.handle})` : ''}, opens in a new tab`}
              className="pixel-tile pixel-tile-interactive group relative flex w-full min-w-0 flex-col items-center gap-3 bg-cool-white px-2 pb-4 pt-5 text-center hover:bg-rose/30"
            >
              <SocialGlyph social={social} className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" />
              <span className="flex w-full min-w-0 flex-col items-center gap-2">
                <span className="font-pixel text-[9px] uppercase leading-none">{social.platform}</span>
                <span className="w-full truncate text-[20px] leading-none">{social.handle ?? 'Profile'}</span>
              </span>
              <ArrowUpRight
                size={14}
                strokeWidth={3}
                aria-hidden="true"
                className="absolute right-2 top-2 opacity-40 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </a>
          </li>
        ))}
      </ul>

      {/* Email: one row with write + copy */}
      {email && email.handle && (
        <div className="pixel-tile mt-auto flex flex-col gap-3 bg-cool-white p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <SocialGlyph social={email} className="h-8 w-8 shrink-0" />
            <span className="flex min-w-0 flex-col gap-1.5">
              <span className="font-pixel text-[9px] uppercase leading-none">Email</span>
              <span className="truncate text-[22px] leading-none">{email.handle}</span>
            </span>
          </div>
          <div className="flex gap-3 sm:shrink-0">
            <a
              href={email.url}
              aria-label={`Send an email to ${email.handle}`}
              className="pixel-btn !py-3 flex-1 !text-[9px] sm:flex-none"
            >
              Write <ArrowUpRight size={12} strokeWidth={3} aria-hidden="true" />
            </a>
            <button
              type="button"
              data-no-sfx
              data-copied={address.copied}
              onClick={() => address.copy(email.handle as string)}
              aria-label="Copy email address"
              className="pixel-btn !py-3 min-w-[104px] flex-1 !text-[9px] data-[copied=true]:!bg-rose data-[copied=true]:!text-wine sm:flex-none"
            >
              {address.copied ? (
                <>
                  <Check size={12} strokeWidth={3} aria-hidden="true" /> Copied!
                </>
              ) : (
                <>
                  <Copy size={12} strokeWidth={3} aria-hidden="true" /> Copy
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

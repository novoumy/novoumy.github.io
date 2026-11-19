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

// Same content and tiles as the guild pass, but without the nested card:
// everything sits directly inside the main window frame.
export default function SocialsView() {
  const email = socials.find((s) => s.icon === 'mail') ?? null;
  const links = socials.filter((s) => s !== email);
  const address = useCopy();

  return (
    <div className="flex min-h-full flex-col gap-5 max-sm:gap-4 sm:gap-6">
      {/* Identity */}
      <section className="flex items-center gap-4 sm:gap-6">
        <img
          src={hero.avatar}
          alt={hero.avatarAlt}
          className="pixel-tile aspect-square w-20 shrink-0 bg-rose/40 object-cover sm:w-28"
        />
        <div className="flex min-w-0 flex-col gap-2.5">
          <span className="font-pixel text-[8px] uppercase leading-none opacity-60">Adventurer</span>
          <h1 className="min-w-0 break-words text-[20px] leading-[1.2] tracking-wide sm:text-[28px]">{HANDLE}</h1>
          <span className="flex items-center gap-2 font-pixel text-[8px] uppercase leading-none">
            <span className="inline-block h-2 w-2 bg-rose" aria-hidden="true" />
            Open to quests
          </span>
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-1 flex-1 bg-rose" />
        <span className="font-pixel text-[8px] uppercase leading-none">Links</span>
        <span className="h-1 flex-1 bg-rose" />
      </div>

      {/* Link slots */}
      <ul data-stagger className="flex flex-wrap justify-center gap-4">
        {links.map((social) => (
          <li key={`${social.platform}-${social.url}`} className="flex w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)]">
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${social.platform}${social.handle ? ` (${social.handle})` : ''}, opens in a new tab`}
              className="pixel-tile pixel-tile-interactive group relative flex w-full min-w-0 flex-col items-center gap-3 bg-cool-white px-2 pb-3.5 pt-4 text-center hover:bg-rose/30 max-sm:gap-2 max-sm:pb-2.5 max-sm:pt-3"
            >
              <SocialGlyph social={social} className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
              <span className="flex w-full min-w-0 flex-col items-center gap-2">
                <span className="font-pixel text-[8px] uppercase leading-none sm:text-[9px]">{social.platform}</span>
                <span className="w-full truncate text-[19px] leading-none sm:text-[20px]">
                  {social.handle ?? 'Profile'}
                </span>
              </span>
              <ArrowUpRight
                size={12}
                strokeWidth={3}
                aria-hidden="true"
                className="absolute right-1.5 top-1.5 opacity-40 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </a>
          </li>
        ))}
      </ul>

      {/* Email: one row with open + copy */}
      {email && email.handle && (
        <section className="pixel-tile flex flex-col gap-3 bg-rose/30 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <SocialGlyph social={email} className="h-8 w-8 shrink-0" />
            <span className="flex min-w-0 flex-col gap-1.5">
              <span className="font-pixel text-[8px] uppercase leading-none">Email</span>
              <span className="truncate text-[20px] leading-none sm:text-[22px]">{email.handle}</span>
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
              data-sfx="copy"
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
        </section>
      )}

      {/* Footer */}
      <footer className="mt-auto flex items-center justify-between font-pixel text-[7px] uppercase leading-none opacity-60 sm:text-[8px]">
        <span>{HANDLE}.com</span>
        <span>{String(socials.length).padStart(2, '0')} links</span>
      </footer>
    </div>
  );
}

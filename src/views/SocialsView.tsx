import { ArrowUpRight, Check, Copy } from '@/components/PixelUiIcons';
import PixelIcon from '@/components/PixelIcon';
import SmoothIcon from '@/components/SmoothIcon';
import { hasSmoothIcon } from '@/lib/smoothIcons';
import { useCopy } from '@/lib/useCopy';
import { socials, type SocialItem } from '@/siteData';
import './socials.css';

const HANDLE = 'novoumy';

function SocialGlyph({ social, className }: { social: SocialItem; className: string }) {
  if (social.image) return <img src={social.image} alt="" loading="lazy" className={`${className} object-cover`} />;
  // Social brand marks are smooth vectors. The email glyph (and anything without a smooth version) keeps the pixel icon.
  if (social.icon !== 'mail' && hasSmoothIcon(social.icon)) return <SmoothIcon name={social.icon} size={48} className={className} />;
  return <PixelIcon name={social.icon ?? 'github'} size={48} className={className} />;
}


// Pixel sprite, 16 x 13 cells. Two flame frames flicker against each other.
const FLAME_A = [
  '.......RR.......',
  '.......RR.R.....',
  '......RRRRR.....',
  '.....RRRRRRR....',
  '.....RRCCRRR....',
  '....RRRCCCRRR...',
  '....RRRCCCCRR...',
  '.....RRCCCCR....',
  '......RRCCR.....',
];
const FLAME_B = [
  '........R.......',
  '......R.RR......',
  '......RRRRR.....',
  '....RRRRRRRR....',
  '....RRRCCRRRR...',
  '....RRCCCCRRR...',
  '.....RCCCCCRR...',
  '.....RRCCCCR....',
  '......RRCCR.....',
];
const LOGS = [
  '...WWW.RR.WWW...',
  '..WWWWWWWWWWWW..',
  '...WWWWWWWWWW...',
  '.GGGGGGGGGGGGGG.',
];
const CLASS_FOR: Record<string, string> = { R: 'cf-r', C: 'cf-c', W: 'cf-w', G: 'cf-ground', L: 'cf-l' };

function Sprite({ rows, offsetY = 0, className }: { rows: string[]; offsetY?: number; className?: string }) {
  return (
    <g className={className}>
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) =>
          CLASS_FOR[ch] ? <rect key={`${x}-${y}`} x={x} y={y + offsetY} width={1} height={1} className={CLASS_FOR[ch]} /> : null,
        ),
      )}
    </g>
  );
}

function CampfireHero() {
  return (
    <section className="pixel-tile flex items-center gap-4 overflow-hidden ethereal-card p-4 sm:gap-6 sm:p-5">
      <div className="camp-scene" aria-hidden="true">
        <span className="camp-star" style={{ left: '14%', top: '16%' }} />
        <span className="camp-star" style={{ left: '78%', top: '10%' }} />
        <span className="camp-star" style={{ left: '60%', top: '30%' }} />
        <span className="camp-spark" />
        <span className="camp-spark" />
        <span className="camp-spark" />
        <svg className="camp-fire" viewBox="0 0 16 13" xmlns="http://www.w3.org/2000/svg">
          <Sprite rows={FLAME_A} className="flame-a" />
          <Sprite rows={FLAME_B} className="flame-b" />
          <Sprite rows={LOGS} offsetY={9} />
        </svg>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <h1 className="font-pixel text-[13px] uppercase leading-[1.5] tracking-wide sm:text-[18px]">Want to contact me?</h1>
        <p className="text-[19px] leading-[1.1] opacity-80 sm:text-[22px]">
          These are all my public socials, but I prefer contact by Discord.
        </p>
      </div>
    </section>
  );
}

// Same content and tiles as the guild pass, but without the nested card:
// everything sits directly inside the main window frame.
export default function SocialsView() {
  const email = socials.find((s) => s.icon === 'mail') ?? null;
  const links = socials.filter((s) => s !== email);
  const address = useCopy();

  return (
    <div className="flex min-h-full flex-col gap-5 max-sm:gap-4 sm:gap-6">
      <CampfireHero />

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
              className="pixel-tile pixel-tile-interactive group relative flex w-full min-w-0 flex-col items-center gap-3 bg-pink-soft px-2 pb-4 pt-5 text-center [--r-accent:var(--rose)] hover:bg-rose max-sm:gap-2 max-sm:pb-3 max-sm:pt-4"
            >
              <span className="pixel-icon-well pixel-icon-well-social">
                <SocialGlyph social={social} className="h-11 w-11 shrink-0 sm:h-12 sm:w-12" />
              </span>
              <span className="w-full truncate font-pixel text-[8px] uppercase leading-none sm:text-[9px]">{social.platform}</span>
              <ArrowUpRight
                size={14}
                aria-hidden="true"
                className="absolute right-2.5 top-2.5 opacity-60 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </a>
          </li>
        ))}
      </ul>

      {/* Email: one row with open + copy */}
      {email && email.handle && (
        <section className="pixel-tile flex flex-col gap-3 ethereal-card overflow-hidden p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="pixel-icon-well pixel-icon-well-email">
              <SocialGlyph social={email} className="h-10 w-10 shrink-0" />
            </span>
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
              Write <ArrowUpRight size={14} aria-hidden="true" />
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
                  <Check size={14} aria-hidden="true" /> Copied!
                </>
              ) : (
                <>
                  <Copy size={14} aria-hidden="true" /> Copy
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

import { ExternalLink } from 'lucide-react';
import { SOCIAL_ICONS } from '@/lib/icons';
import { socials } from '@/siteData';

export default function SocialsView() {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {socials.map((social) => {
        const Icon = social.icon ? SOCIAL_ICONS[social.icon] : ExternalLink;
        return (
          <li key={`${social.platform}-${social.url}`}>
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-tile pixel-tile-interactive group flex items-center gap-4 bg-cool-white p-4"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-rose text-wine">
                {social.image ? (
                  <img src={social.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <Icon size={28} strokeWidth={2.5} aria-hidden="true" />
                )}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-pixel text-[10px] uppercase leading-[1.6]">{social.platform}</span>
                <span className="truncate text-[20px] leading-none">{social.handle}</span>
              </span>
              <ExternalLink
                size={18}
                aria-hidden="true"
                className="shrink-0 transition-transform duration-150 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

import { quotes } from '@/siteData';

export default function QuotesView() {
  return (
    <ul className="flex flex-col gap-6">
      {quotes.map((quote, index) => (
        <li key={index} className="pixel-tile relative bg-rose p-2">
          <div className="relative bg-cool-white px-6 pb-8 pt-5 shadow-[inset_0_0_0_3px_var(--wine)]">
            <span aria-hidden="true" className="absolute left-3 top-0 font-pixel text-2xl leading-none text-wine">
              &ldquo;
            </span>
            <p className="pl-4 text-[24px] leading-[1.4]">{quote.text}</p>
            <p className="mt-3 text-right font-pixel text-[9px] uppercase leading-[1.6] text-wine">
              &mdash; {quote.author}
            </p>
            <span
              aria-hidden="true"
              className="blink-arrow absolute bottom-2 left-3 h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-wine"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

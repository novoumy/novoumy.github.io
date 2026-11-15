import { useCallback, useEffect, useRef, useState } from 'react';
import RetroOverlay from '@/components/RetroOverlay';
import { quotes } from '@/siteData';

// Terminal-log quote cards with a "roll random quote" shuffle button.
export default function QuotesView({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState<number | null>(null);
  const [flash, setFlash] = useState(0); // bumped on each roll to replay the fade
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  const roll = useCallback(() => {
    if (quotes.length === 0) return;
    setActive((current) => {
      if (quotes.length === 1) return 0;
      let next = Math.floor(Math.random() * quotes.length);
      while (next === current) next = Math.floor(Math.random() * quotes.length);
      return next;
    });
    setFlash((n) => n + 1);
  }, []);

  useEffect(() => {
    if (active !== null) refs.current[active]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [active, flash]);

  return (
    <RetroOverlay label="Quotes log" meta={`${quotes.length} entries`} onClose={onClose}>
      <div className="mb-6 flex items-center justify-between gap-3 border-b-2 border-[#7d5560] pb-4">
        <span className="font-pixel text-[8px] uppercase text-[#8a8a8a]">// quotes.log · {quotes.length} entries</span>
        <button type="button" onClick={roll} className="r-btn">
          &gt; Roll random quote
        </button>
      </div>

      <ul className="flex w-full flex-col gap-6">
        {quotes.map((quote, index) => {
          const isActive = index === active;
          return (
            <li
              key={index}
              ref={(node) => {
                refs.current[index] = node;
              }}
              className={[
                'r-box relative overflow-hidden transition-opacity duration-300',
                isActive ? 'r-box-active shadow-[4px_4px_0_0_#7d5560]' : active !== null ? 'opacity-45' : '',
              ].join(' ')}
            >
              <div key={isActive ? `on-${flash}` : 'off'} className={isActive ? 'quote-flash' : ''}>
                <div className="flex items-center justify-between gap-3 border-b-2 border-[#7d5560] bg-[#1e1e1e] px-4 py-2 font-pixel text-[8px] uppercase text-[#8a8a8a]">
                  <span>log_{String(index + 1).padStart(3, '0')}.txt</span>
                  <span aria-hidden="true" className="flex gap-1">
                    <i className="block h-2 w-2 bg-[#3c3c3c]" />
                    <i className="block h-2 w-2 bg-[#3c3c3c]" />
                    <i className={['block h-2 w-2', isActive ? 'bg-[#CC97A3]' : 'bg-[#3c3c3c]'].join(' ')} />
                  </span>
                </div>
                <figure className="flex flex-col gap-5 px-5 py-5 sm:px-7 sm:py-6">
                  <span aria-hidden="true" className="r-glow font-pixel text-[28px] leading-none text-[#CC97A3]">
                    &ldquo;
                  </span>
                  <blockquote className="-mt-3 text-[28px] leading-[1.25] text-[#d4d4d4] sm:text-[32px]">
                    {quote.text}
                  </blockquote>
                  <figcaption className="mt-1 flex items-center gap-3 border-t-2 border-dashed border-[#7d5560] pt-4">
                    <span aria-hidden="true" className="font-pixel text-[9px] text-[#CC97A3]">
                      --
                    </span>
                    <span className="font-pixel text-[9px] uppercase leading-[1.6] text-[#CC97A3]">{quote.author}</span>
                    <span aria-hidden="true" className="r-caret ml-auto font-pixel text-[9px] text-[#8a8a8a]" />
                  </figcaption>
                </figure>
              </div>
            </li>
          );
        })}
      </ul>
    </RetroOverlay>
  );
}

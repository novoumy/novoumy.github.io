import { quotes } from '@/siteData';

// Pixel-art quotation marks, drawn on a small grid so they stay crisp at any size.
const OPEN_MARK = ['..XX..XX', '.XX..XX.', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX'];
const CLOSE_MARK = ['XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', '.XX..XX.', 'XX..XX..'];

function QuoteMark({ kind, className = '' }: { kind: 'open' | 'close'; className?: string }) {
  const grid = kind === 'open' ? OPEN_MARK : CLOSE_MARK;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 8 5"
      shapeRendering="crispEdges"
      fill="currentColor"
      className={className}
    >
      {grid.flatMap((row, y) =>
        [...row].map((cell, x) => (cell === 'X' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null))
      )}
    </svg>
  );
}

export default function QuotesView() {
  return (
    <ul className="flex flex-col gap-8">
      {quotes.map((quote, index) => (
        <li key={index}>
          <figure className="pixel-tile bg-rose p-2">
            <div className="bg-cool-white px-5 py-5 shadow-[inset_0_0_0_3px_var(--wine)] sm:px-8 sm:py-6">
              <QuoteMark kind="open" className="h-5 w-8 text-rose sm:h-6 sm:w-10" />
              <blockquote className="mt-3 px-1 text-[26px] leading-[1.3] sm:px-3 sm:text-[30px]">
                {quote.text}
              </blockquote>
              <div className="mt-5 flex items-end justify-between gap-4">
                <figcaption className="flex min-w-0 items-center gap-3">
                  <span aria-hidden="true" className="h-1 w-8 shrink-0 bg-wine sm:w-12" />
                  <span className="font-pixel text-[9px] uppercase leading-[1.6] text-wine">
                    {quote.author}
                  </span>
                </figcaption>
                <QuoteMark kind="close" className="h-5 w-8 shrink-0 text-rose sm:h-6 sm:w-10" />
              </div>
            </div>
          </figure>
        </li>
      ))}
    </ul>
  );
}

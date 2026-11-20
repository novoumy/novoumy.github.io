import { hero } from '@/siteData';
import FrequencyTuner from '@/components/FrequencyTuner';

export default function MainView({ frequency, onTune }: { frequency: number; onTune: (frequency: number) => void }) {
  const prose = hero.bio.filter(line => { const t = line.replace(/\u00A0/g, '').trim(); return t && !line.startsWith('>'); });
  return <div className="-mx-8 -mb-8 flex h-[calc(100%+2rem)] min-h-0 min-w-0 flex-col max-sm:-mx-4 max-sm:-mb-4 max-sm:h-[calc(100%+1rem)]">
    <div className="px-8 pb-8 pt-8 max-sm:px-4 max-sm:pb-5 max-sm:pt-4"><div className="grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-2 max-[768px]:flex max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-3">
      <img src={hero.avatar} alt={hero.avatarAlt} className="pixel-frame row-span-2 aspect-square w-28 shrink-0 object-cover max-[768px]:w-20 max-[768px]:self-center"/><h1 className="min-w-0 break-words text-2xl tracking-wide max-[768px]:w-full max-[768px]:text-center max-[768px]:text-[clamp(14px,4vw,18px)]">{hero.name}</h1>
      <div className="col-start-2 flex min-w-0 flex-col gap-1 max-[768px]:w-full max-[768px]:items-center max-[768px]:text-center">{prose.map(p=><p key={p} className="leading-[1.35] max-[768px]:text-[clamp(14px,3.7vw,17px)] max-[768px]:leading-[1.25]">{p}</p>)}</div></div></div>
    <FrequencyTuner frequency={frequency} onTune={onTune}/>
  </div>;
}

import { useEffect, useRef, useState } from 'react';

const stations: Record<number, { name: string; palette: string; rig: string; desc: string }> = {
  6: { name: 'DEEP SEA SIGNAL', palette: 'deep sea', rig: 'DEEP_SEA', desc: 'slow bubbles · underwater waves' },
  8: { name: 'MIDNIGHT LO-FI', palette: 'midnight', rig: 'MIDNIGHT_LOFI', desc: 'drifting stars · crt pulse' },
  10: { name: 'TINTED LILAC', palette: 'lilac', rig: 'TINTED_LILAC', desc: 'floating pixel dust' },
  12: { name: 'SOLAR BROADCAST', palette: 'solar', rig: 'SOLAR_GOLD', desc: 'embers · sunlight rays' },
  14: { name: 'OVERCLOCKED CIRCUIT', palette: 'overclock', rig: 'OVERCLOCKED', desc: 'pixel rain · micro-glitch' },
};

export default function FrequencyTuner({ frequency, onTune }: { frequency: number; onTune: (frequency: number) => void }) {
  const [dragging, setDragging] = useState(false);
  const [staticOn, setStaticOn] = useState(false);
  const dragStart = useRef<{ x: number; freq: number } | null>(null);
  const station = stations[frequency] ?? stations[10]!;
  const step = (next: number) => onTune(Math.max(6, Math.min(14, next)));
  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => { if (dragStart.current) step(dragStart.current.freq + Math.round((e.clientX - dragStart.current.x) / 14) * 2); };
    const up = () => { setDragging(false); dragStart.current = null; };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [dragging]);
  useEffect(() => { setStaticOn(true); const t = window.setTimeout(() => setStaticOn(false), 420); return () => clearTimeout(t); }, [frequency]);
  return <section className={`radio-tuner ${staticOn ? 'radio-static' : ''}`} aria-label="Frequency radio tuner">
    <div className="radio-topline"><span>FREQUENCY RADIO</span><span className="radio-online"><i/> SIGNAL {frequency % 2 === 0 ? 'LOCKED' : 'LOST'}</span></div>
    <div className="radio-body">
      <div className="radio-readout"><div className="radio-label">CURRENT WAVELENGTH</div><div className="radio-hz">{frequency.toFixed(1)} <small>Hz</small></div>
        <div className="radio-scale" aria-label="Frequency scale">{[6,8,10,12,14].map((n) => <button key={n} className={n === frequency ? 'selected' : ''} onClick={() => step(n)} aria-label={`Tune ${n} Hz`}><i/><span>{n}</span></button>)}</div>
      </div>
      <div className="radio-dial-area"><div className="radio-dial" role="slider" aria-label="Tune frequency" aria-valuemin={6} aria-valuemax={14} aria-valuenow={frequency} tabIndex={0} onKeyDown={e => { if (e.key === 'ArrowLeft') step(frequency - 2); if (e.key === 'ArrowRight') step(frequency + 2); }} onPointerDown={e => { dragStart.current = { x: e.clientX, freq: frequency }; setDragging(true); }} style={{ transform: `rotate(${(frequency - 10) * 15}deg)` }}><span className="dial-notch"/><span className="dial-core">✦</span></div><div className="dial-buttons"><button onClick={() => step(frequency - 2)} aria-label="Previous frequency">◄</button><button onClick={() => step(frequency + 2)} aria-label="Next frequency">►</button></div></div>
    </div>
    <div className="radio-station"><span className="station-tag">NOW PLAYING</span><strong>{station.name}</strong><span className="station-desc">{station.desc}</span><div className="radio-eq" aria-hidden="true">{Array.from({length:22},(_,i)=><i key={i} style={{animationDelay:`-${i*0.07}s`}}/>)}</div></div>
    <div className="radio-footer"><span>CH. {frequency.toFixed(1)} / {station.rig}</span><span>DRAG DIAL OR STEP</span></div>
  </section>;
}

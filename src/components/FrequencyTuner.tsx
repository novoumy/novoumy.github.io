import { useEffect, useRef, useState, type CSSProperties } from 'react';

const stations: Record<number, { name: string; badge: string; rig: string; desc: string; signal: string }> = {
  6: { name: 'DEEP SEA SIGNAL', badge: 'ABYSSAL / 06', rig: 'ABYSSAL_DEEP', desc: 'bioluminescent relay · pressure waves', signal: 'SUBSEA CARRIER' },
  8: { name: 'MIDNIGHT LO-FI', badge: 'NIGHT / 08', rig: 'MIDNIGHT_LOFI', desc: 'late-night transmissions · orbital dust', signal: 'AFTER-HOURS FM' },
  10: { name: 'TINTED LILAC', badge: 'WARM / 10', rig: 'TINTED_LILAC', desc: 'soft pixel ambience · familiar signal', signal: 'LOCAL FAVOURITE' },
  12: { name: 'SOLAR OVERDRIVE', badge: 'SOLAR / 12', rig: 'SOLAR_OVERDRIVE', desc: 'golden-hour carrier · ember drift', signal: 'SUNSPOT RADIO' },
  14: { name: 'SYSTEM BREACH', badge: 'BREACH / 14', rig: 'SYSTEM_BREACH', desc: 'encrypted packet stream · unstable carrier', signal: 'UNAUTHORIZED FM' },
};

const frequencies = [6, 8, 10, 12, 14] as const;

export default function FrequencyTuner({ frequency, onTune }: { frequency: number; onTune: (frequency: number) => void }) {
  const [dragging, setDragging] = useState(false);
  const [pressed, setPressed] = useState<'prev' | 'next' | null>(null);
  const dragStart = useRef<{ x: number; frequency: number } | null>(null);
  const station = stations[frequency] ?? stations[10]!;
  const dialAngle = (frequency - 10) * 24;
  const needlePosition = ((frequency - 6) / 8) * 100;
  const step = (next: number) => onTune(Math.max(6, Math.min(14, next)));

  useEffect(() => {
    if (!dragging) return;
    const move = (event: PointerEvent) => {
      if (!dragStart.current) return;
      const delta = Math.round((event.clientX - dragStart.current.x) / 22);
      const next = Math.max(6, Math.min(14, dragStart.current.frequency + delta * 2));
      onTune(next);
    };
    const up = () => {
      setDragging(false);
      dragStart.current = null;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [dragging, onTune]);

  return (
    <section className="radio-tuner" aria-label="Frequency radio tuner">
      <div className="radio-chassis-header">
        <div className="radio-brand"><span className="radio-brand-mark">N</span><span>NW / FREQUENCY RECEIVER <small>MODEL 08—FM</small></span></div>
        <div className="radio-online"><i aria-hidden="true" /> <span>SIGNAL LOCKED</span><b>STEREO</b></div>
      </div>

      <div className="radio-hardware-grid">
        <div className="radio-lcd" aria-live="polite">
          <div className="lcd-topline"><span>NOW TUNED TO</span><span>FM ◉</span></div>
          <div className="radio-hz">{frequency.toFixed(1)}<small>Hz</small></div>
          <div className="lcd-station-badge">{station.badge}</div>
          <div className="lcd-bottomline"><span className="lcd-led" /> <span>[ SIGNAL LOCKED ]</span></div>
          <div className="lcd-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
        </div>

        <div className="radio-center-console">
          <div className="console-label"><span>ANALOG TUNING GLASS</span><span>MHz / Hz CARRIER</span></div>
          <div className="radio-scale-window" aria-label={`Frequency scale, selected ${frequency} hertz`}>
            <div className="scale-track" />
            <div className="scale-needle" style={{ left: `${needlePosition}%` }} />
            <div className="scale-ticks">
              {frequencies.map((value) => (
                <button
                  type="button"
                  key={value}
                  className={value === frequency ? 'selected' : ''}
                  onClick={() => onTune(value)}
                  aria-label={`Tune to ${value}.0 hertz`}
                  aria-pressed={value === frequency}
                >
                  <i />
                  <span>{value}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="speaker-module">
            <div className="speaker-label"><span>MONITOR / OUTPUT</span><span>LIVE WAVEFORM</span></div>
            <div className="speaker-grille" aria-hidden="true">
              {Array.from({ length: 7 }, (_, row) => <i key={row} />)}
            </div>
            <div className="radio-waveform" aria-label="Animated signal visualizer" role="img">
              {Array.from({ length: 30 }, (_, index) => <i key={index} style={{ animationDelay: `${-(index * 0.047)}s` }} />)}
            </div>
          </div>
        </div>

        <div className="radio-controls">
          <div className="console-label knob-caption"><span>FINE TUNING</span><span>DETENT / 02</span></div>
          <div
            className={`radio-dial${dragging ? ' is-dragging' : ''}`}
            role="slider"
            aria-label="Rotary frequency tuner"
            aria-valuemin={6}
            aria-valuemax={14}
            aria-valuenow={frequency}
            aria-valuetext={`${frequency.toFixed(1)} hertz, ${station.name}`}
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') { event.preventDefault(); step(frequency - 2); }
              if (event.key === 'ArrowRight' || event.key === 'ArrowUp') { event.preventDefault(); step(frequency + 2); }
              if (event.key === 'Home') { event.preventDefault(); onTune(6); }
              if (event.key === 'End') { event.preventDefault(); onTune(14); }
            }}
            onPointerDown={(event) => {
              event.preventDefault();
              dragStart.current = { x: event.clientX, frequency };
              setDragging(true);
              event.currentTarget.setPointerCapture?.(event.pointerId);
            }}
            style={{ '--dial-angle': `${dialAngle}deg` } as CSSProperties}
          >
            <span className="dial-ridge" />
            <span className="dial-face"><i className="dial-indicator" /><b className="dial-hub">N<span>•</span></b></span>
          </div>
          <div className="dial-buttons">
            <button type="button" className={pressed === 'prev' ? 'is-pressed' : ''} onPointerDown={() => setPressed('prev')} onPointerLeave={() => setPressed(null)} onPointerUp={() => setPressed(null)} onClick={() => { setPressed(null); step(frequency - 2); }} aria-label="Previous frequency"><span>[</span> ◄ <span>]</span></button>
            <button type="button" className={pressed === 'next' ? 'is-pressed' : ''} onPointerDown={() => setPressed('next')} onPointerLeave={() => setPressed(null)} onPointerUp={() => setPressed(null)} onClick={() => { setPressed(null); step(frequency + 2); }} aria-label="Next frequency"><span>[</span> ► <span>]</span></button>
          </div>
          <div className="dial-hint">TURN TO TUNE</div>
        </div>
      </div>

      <div className="radio-station-marquee">
        <span className="marquee-label">ON AIR</span>
        <div className="marquee-window"><strong>{station.name}</strong><span> // {station.signal} // {station.desc} //</span></div>
        <div className="radio-eq" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ animationDelay: `${-(index * 0.063)}s` }} />)}</div>
      </div>
      <div className="radio-chassis-footer"><span>RIG ID / {station.rig}</span><span>CH {String(frequencies.indexOf(frequency as (typeof frequencies)[number]) + 1).padStart(2, '0')} OF 05</span><span>ROTARY CONTROL / LOCKED STEP</span></div>
    </section>
  );
}

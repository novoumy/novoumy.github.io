type Station = {
  name: string;
  rig: string;
  desc: string;
  signal: string;
};

const stations: Record<number, Station> = {
  6: { name: 'DEEP SEA SIGNAL', rig: 'ABYSSAL_DEEP', desc: 'bioluminescent relay · pressure waves', signal: 'SUBSEA CARRIER' },
  8: { name: 'MIDNIGHT LO-FI', rig: 'MIDNIGHT_LOFI', desc: 'late-night transmissions · orbital dust', signal: 'AFTER-HOURS FM' },
  10: { name: 'TINTED LILAC', rig: 'TINTED_LILAC', desc: 'soft pixel ambience · familiar signal', signal: 'LOCAL FAVOURITE' },
  12: { name: 'SOLAR OVERDRIVE', rig: 'SOLAR_OVERDRIVE', desc: 'golden-hour carrier · ember drift', signal: 'SUNSPOT RADIO' },
  14: { name: 'SYSTEM BREACH', rig: 'SYSTEM_BREACH', desc: 'encrypted packet stream · unstable carrier', signal: 'UNAUTHORIZED FM' },
};

const frequencies = [6, 8, 10, 12, 14] as const;

export default function FrequencyTuner({ frequency, onTune }: { frequency: number; onTune: (frequency: number) => void }) {
  const station = stations[frequency] ?? stations[10]!;
  const step = (next: number) => onTune(Math.max(6, Math.min(14, next)));
  const marqueeText = `${station.name} // ${station.signal} // ${station.desc}`;

  return (
    <section className="radio-tuner" aria-label="Frequency radio tuner">
      <header className="radio-header">
        <span className="radio-headline">[ FREQ_TUNER ]</span>
        <span className="radio-status"><i aria-hidden="true" />[ ACTIVE ]</span>
      </header>

      <div className="radio-main">
        <div className="radio-display" aria-live="polite">
          <div className="radio-display-caption">
            <span>CHANNEL / CARRIER</span>
            <span>FM · DIGITAL</span>
          </div>

          <div className="radio-frequency-row">
            <div className="radio-frequency">{frequency.toFixed(1)} <small>Hz</small></div>
            <span className="radio-lock"><i aria-hidden="true" />SIGNAL LOCKED</span>
          </div>

          <div className="radio-station">{station.name}</div>

          <div className="radio-scale" role="group" aria-label={`Frequency selector, currently ${frequency.toFixed(1)} hertz`}>
            <div className="radio-scale-line" aria-hidden="true" />
            <div className="radio-ticks">
              {frequencies.map((value) => (
                <button
                  type="button"
                  key={value}
                  className={value === frequency ? 'is-selected' : ''}
                  onClick={() => onTune(value)}
                  aria-label={`Tune to ${value.toFixed(1)} hertz`}
                  aria-pressed={value === frequency}
                >
                  <i aria-hidden="true" />
                  <span>{value}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="radio-controls" role="group" aria-label="Tuning controls">
          <span className="radio-control-label">STEP / 2.0 Hz</span>
          <button
            type="button"
            className="radio-step-button"
            onClick={() => step(frequency - 2)}
            disabled={frequency <= 6}
            aria-label="Previous frequency"
          >
            <span aria-hidden="true">[ ◄ ]</span>
            <small>DOWN</small>
          </button>
          <button
            type="button"
            className="radio-step-button"
            onClick={() => step(frequency + 2)}
            disabled={frequency >= 14}
            aria-label="Next frequency"
          >
            <span aria-hidden="true">[ ► ]</span>
            <small>UP</small>
          </button>
        </div>
      </div>

      <div className="radio-marquee" aria-label={`On air: ${marqueeText}`}>
        <span className="radio-marquee-tag">[ ON AIR ]</span>
        <div className="radio-marquee-window" aria-hidden="true">
          <div className="radio-marquee-track">
            <span>{marqueeText}</span>
            <span>{marqueeText}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

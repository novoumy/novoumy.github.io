let context: AudioContext | null = null;
// 0..1 multiplier relative to the original blip loudness (set by AudioProvider).
let sfxLevel = 1;

export function setSfxLevel(level: number) {
  sfxLevel = Math.max(0, level);
}

export function playMenuBlip() {
  if (sfxLevel <= 0) return;
  context ??= new AudioContext();
  const ctx = context;
  if (ctx.state === 'suspended') void ctx.resume();

  const start = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(660, start);
  osc.frequency.setValueAtTime(990, start + 0.05);

  gain.gain.setValueAtTime(0.12 * sfxLevel, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);

  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + 0.12);
}

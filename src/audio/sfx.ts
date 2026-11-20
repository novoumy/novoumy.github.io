// Tiny 8-bit synth for UI sounds (Web Audio, no files). Every kind has its own character,
// with a touch of random pitch so repeated clicks don't sound robotic.
let context: AudioContext | null = null;
// 0..1 multiplier relative to the original blip loudness (set by AudioProvider).
let sfxLevel = 1;
let sfxMuted = false;

export type SfxKind =
  | 'tab'
  | 'open'
  | 'close'
  | 'link'
  | 'toggle-on'
  | 'toggle-off'
  | 'play'
  | 'roll'
  | 'select'
  | 'copy'
  | 'click'
  | 'mute'
  | 'unmute'
  | 'volume'
  | 'static';

export function setSfxLevel(level: number) {
  sfxLevel = Math.max(0, level);
}

export function setSfxMuted(muted: boolean) {
  sfxMuted = muted;
}

// Browsers unlock Web Audio only after a real visitor gesture. The site calls this
// from its existing gesture listener so delayed CRT transitions can still make sound.
export function unlockSfxAudio() {
  const ctx = audio(true);
  if (ctx?.state === 'suspended') void ctx.resume();
}

function audio(force = false): AudioContext | null {
  if (!force && (sfxMuted || sfxLevel <= 0)) return null;
  context ??= new AudioContext();
  if (context.state === 'suspended') void context.resume();
  return context;
}

const jitter = (amount = 0.03) => 1 + (Math.random() * 2 - 1) * amount;

interface ToneOptions {
  at?: number; // seconds after now
  dur: number;
  type?: OscillatorType;
  vol?: number;
  to?: number; // slide to this frequency
}

function tone(
  ctx: AudioContext,
  freq: number,
  { at = 0, dur, type = 'square', vol = 0.12, to }: ToneOptions,
  gainScale = sfxLevel,
) {
  const start = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + dur);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol * gainScale), start + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

let noiseBuffer: AudioBuffer | null = null;

function noise(
  ctx: AudioContext,
  { at = 0, dur = 0.03, vol = 0.08, freq = 3000 }: { at?: number; dur?: number; vol?: number; freq?: number },
  gainScale = sfxLevel,
) {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  }
  const start = ctx.currentTime + at;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = noiseBuffer;
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = 1.2;
  gain.gain.setValueAtTime(Math.max(0.0001, vol * gainScale), start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(start);
  source.stop(start + dur + 0.02);
}

// `step` lets a row of controls (the tab bar) climb in pitch from left to right.
export function playSfx(kind: SfxKind, step = 0, force = false) {
  const ctx = audio(force);
  if (!ctx) return;
  const j = jitter();
  const gainScale = force ? Math.max(0.35, sfxLevel || 0.5) : sfxLevel;

  switch (kind) {
    case 'tab': {
      const base = 523 * 2 ** ((step * 3) / 12) * j;
      noise(ctx, { dur: 0.02, vol: 0.05, freq: 4000 }, gainScale);
      tone(ctx, base, { dur: 0.05, vol: 0.1 }, gainScale);
      tone(ctx, base * 1.5, { at: 0.045, dur: 0.09, vol: 0.1 }, gainScale);
      break;
    }
    case 'open': {
      // Rising arpeggio + sparkle: a folder "boots up".
      [523, 659, 784, 1047].forEach((freq, i) => tone(ctx, freq * j, { at: i * 0.04, dur: 0.08, type: 'triangle', vol: 0.16 }, gainScale));
      tone(ctx, 2093 * j, { at: 0.16, dur: 0.12, vol: 0.05 }, gainScale);
      noise(ctx, { dur: 0.05, vol: 0.04, freq: 6000 }, gainScale);
      break;
    }
    case 'close': {
      // Falling arpeggio with a soft "power down" slide.
      [784, 622, 466].forEach((freq, i) => tone(ctx, freq * j, { at: i * 0.035, dur: 0.07, type: 'triangle', vol: 0.15 }, gainScale));
      tone(ctx, 400 * j, { at: 0.1, dur: 0.14, vol: 0.06, to: 120 }, gainScale);
      break;
    }
    case 'static': {
      // Short broadband carrier break with a low mechanical tuning click.
      noise(ctx, { dur: 0.19, vol: 0.11, freq: 4800 }, gainScale);
      noise(ctx, { at: 0.115, dur: 0.055, vol: 0.08, freq: 2100 }, gainScale);
      tone(ctx, 145 * j, { dur: 0.16, type: 'sawtooth', vol: 0.035, to: 62 }, gainScale);
      break;
    }
    case 'link': {
      // Coin-style ping for links that open a new tab.
      tone(ctx, 988 * j, { dur: 0.06, vol: 0.1 }, gainScale);
      tone(ctx, 1319 * j, { at: 0.06, dur: 0.22, vol: 0.09 }, gainScale);
      break;
    }
    case 'toggle-on':
      tone(ctx, 440 * j, { dur: 0.08, vol: 0.11, to: 880 }, gainScale);
      noise(ctx, { dur: 0.015, vol: 0.05, freq: 5000 }, gainScale);
      break;
    case 'toggle-off':
      tone(ctx, 880 * j, { dur: 0.08, vol: 0.11, to: 440 }, gainScale);
      noise(ctx, { dur: 0.015, vol: 0.05, freq: 2500 }, gainScale);
      break;
    case 'mute':
      tone(ctx, 740 * j, { dur: 0.07, type: 'triangle', vol: 0.1, to: 300 }, gainScale);
      noise(ctx, { dur: 0.02, vol: 0.04, freq: 1800 }, gainScale);
      break;
    case 'unmute':
      tone(ctx, 330 * j, { dur: 0.07, type: 'triangle', vol: 0.1, to: 780 }, gainScale);
      tone(ctx, 990 * j, { at: 0.05, dur: 0.05, vol: 0.06 }, gainScale);
      break;
    case 'volume': {
      const v = Math.max(0, Math.min(200, step));
      const base = 420 + (v / 200) * 520;
      tone(ctx, base * j, { dur: 0.03, vol: 0.06 }, gainScale);
      break;
    }
    case 'play':
      tone(ctx, 196 * j, { dur: 0.09, type: 'triangle', vol: 0.2, to: 98 }, gainScale);
      tone(ctx, 784 * j, { at: 0.02, dur: 0.05, vol: 0.06 }, gainScale);
      break;
    case 'roll':
      // Dice rattling, then a "ding" when it lands.
      for (let i = 0; i < 6; i += 1) noise(ctx, { at: i * 0.055, dur: 0.03, vol: 0.09, freq: 1800 + Math.random() * 2500 }, gainScale);
      tone(ctx, 1175 * j, { at: 0.36, dur: 0.18, type: 'triangle', vol: 0.14 }, gainScale);
      break;
    case 'select':
      noise(ctx, { dur: 0.025, vol: 0.07, freq: 2200 }, gainScale);
      tone(ctx, 330 * j, { dur: 0.04, vol: 0.07 }, gainScale);
      break;
    case 'copy':
      tone(ctx, 1047 * j, { dur: 0.05, vol: 0.09 }, gainScale);
      tone(ctx, 1568 * j, { at: 0.05, dur: 0.05, vol: 0.09 }, gainScale);
      tone(ctx, 2093 * j, { at: 0.1, dur: 0.1, vol: 0.07 }, gainScale);
      break;
    default: {
      // Generic button: crisp mechanical tick + short blip.
      noise(ctx, { dur: 0.018, vol: 0.07, freq: 3500 }, gainScale);
      tone(ctx, 660 * j, { dur: 0.04, vol: 0.09 }, gainScale);
      tone(ctx, 990 * j, { at: 0.035, dur: 0.06, vol: 0.08 }, gainScale);
    }
  }
}

// Kept for existing callers: the original two-note menu blip.
export function playMenuBlip() {
  playSfx('click');
}

// Picks a sound for a clicked control. Elements can force one with data-sfx="...".
export function sfxForElement(el: Element): { kind: SfxKind; step: number } {
  const forced = el.getAttribute('data-sfx') as SfxKind | null;
  if (forced) return { kind: forced, step: 0 };

  const label = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().toLowerCase();
  if (el.getAttribute('role') === 'tab') {
    const tabs = el.parentElement ? Array.from(el.parentElement.querySelectorAll('[role="tab"]')) : [];
    return { kind: 'tab', step: Math.max(0, tabs.indexOf(el)) };
  }
  if (label.startsWith('close') || label.startsWith('back')) return { kind: 'close', step: 0 };
  if (label.startsWith('open ')) return { kind: 'open', step: 0 };
  if (el.tagName === 'SELECT') return { kind: 'select', step: 0 };
  if (/\b(play|pause)\b/.test(label)) return { kind: 'play', step: 0 };
  if (/\b(roll|random|dice)\b/.test(label)) return { kind: 'roll', step: 0 };
  if (el.hasAttribute('aria-pressed')) {
    // Capture phase runs before React flips the state, so "true" means it's turning off.
    return { kind: el.getAttribute('aria-pressed') === 'true' ? 'toggle-off' : 'toggle-on', step: 0 };
  }
  if (el.tagName === 'A' && (el.getAttribute('target') === '_blank' || /^https?:/.test(el.getAttribute('href') ?? ''))) {
    return { kind: 'link', step: 0 };
  }
  return { kind: 'click', step: 0 };
}

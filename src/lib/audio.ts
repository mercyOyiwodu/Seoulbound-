/**
 * Procedural ambient audio and notification chimes powered purely by the native Web Audio API.
 * 100% offline, zero network requests, zero external assets.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a peaceful, resonant Korean bell/chime sound upon timer completion.
 */
export function playChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Harmonic frequencies simulating a peaceful meditation bowl (C5, G5, C6)
    const freqs = [523.25, 783.99, 1046.5];

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      const initialVolume = 0.15 / (i + 1);
      gain.gain.setValueAtTime(initialVolume, now);
      // Long gentle decay
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.5);
    });
  } catch (err) {
    console.warn("Could not play chime audio:", err);
  }
}

/**
 * Plays an uplifting, triumphant celebratory fanfare for major scholarship milestones.
 */
export function playFanfare(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Arpeggiated celebratory notes (C5, E5, G5, C6)
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.6 },
      { freq: 659.25, time: 0.12, dur: 0.6 },
      { freq: 783.99, time: 0.24, dur: 0.8 },
      { freq: 1046.5, time: 0.36, dur: 1.8 },
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.16, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    });
  } catch (err) {
    console.warn("Could not play fanfare audio:", err);
  }
}

export type AmbientSoundType = "rain" | "whitenoise" | "brownnoise";

export interface AmbientController {
  stop: () => void;
  setVolume: (volume: number) => void;
}

/**
 * Generates continuous procedural ambient sound in real time (Rain, White Noise, Deep Brown Noise).
 */
export function startAmbientSound(type: AmbientSoundType, volume = 0.5): AmbientController {
  const ctx = getAudioContext();
  const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer, looped
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Fill buffer based on sound type
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    if (type === "whitenoise") {
      data[i] = white * 0.1;
    } else if (type === "brownnoise") {
      // Brown noise: integrated white noise (deep warm rumble)
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 1.5;
    } else {
      // Rain: filtered noise with random droplet impulses
      lastOut = (lastOut + 0.04 * white) / 1.04;
      const drop = Math.random() > 0.992 ? (Math.random() * 2 - 1) * 0.4 : 0;
      data[i] = lastOut * 0.8 + drop;
    }
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  // Filter for natural resonance
  const filter = ctx.createBiquadFilter();
  if (type === "rain") {
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1400, ctx.currentTime);
  } else if (type === "brownnoise") {
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, ctx.currentTime);
  } else {
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
  }

  const gain = ctx.createGain();
  const clampedVol = Math.max(0, Math.min(1, volume));
  gain.gain.setValueAtTime(clampedVol * 0.35, ctx.currentTime);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start();

  return {
    stop: () => {
      try {
        gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
        setTimeout(() => {
          noise.stop();
          noise.disconnect();
        }, 350);
      } catch {
        // ignore
      }
    },
    setVolume: (newVol: number) => {
      try {
        const v = Math.max(0, Math.min(1, newVol));
        gain.gain.linearRampToValueAtTime(v * 0.35, ctx.currentTime + 0.1);
      } catch {
        // ignore
      }
    },
  };
}

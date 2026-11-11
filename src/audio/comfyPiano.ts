export type PianoStatus = 'waiting' | 'playing' | 'muted' | 'stopped';

interface PianoNoteEvent {
  /** Beat offset inside the 8-bar (32-beat) phrase. */
  beat: number;
  midi: number;
  velocity: number;
  durationBeats: number;
}

const TEMPO_BPM = 66;
const BEAT_SEC = 60 / TEMPO_BPM;
const PHRASE_BEATS = 32;
const TARGET_MASTER_GAIN = 0.34;

/**
 * Intimate 8-bar nocturnal felt-piano progression (Fmaj9 -> C/E -> Dm9 -> Bbmaj7 -> F/A -> Gm9/C9 -> Dm7/Bbmaj7 -> C6/9).
 * Carefully voiced in the warm middle register so laptop & mobile speakers sound full and tender.
 */
const NOCTURNE_PHRASE: readonly PianoNoteEvent[] = [
  // Bar 1: Fmaj9 (warm opening chord + singing upper motif)
  { beat: 0.0, midi: 53, velocity: 0.54, durationBeats: 3.9 }, // F3
  { beat: 0.04, midi: 60, velocity: 0.42, durationBeats: 3.7 }, // C4
  { beat: 0.08, midi: 64, velocity: 0.44, durationBeats: 3.7 }, // E4
  { beat: 0.13, midi: 67, velocity: 0.40, durationBeats: 3.6 }, // G4
  { beat: 1.0, midi: 72, velocity: 0.58, durationBeats: 1.6 }, // C5
  { beat: 2.0, midi: 69, velocity: 0.52, durationBeats: 1.4 }, // A4
  { beat: 3.0, midi: 67, velocity: 0.48, durationBeats: 1.3 }, // G4

  // Bar 2: C/E (tender suspended resolution)
  { beat: 4.0, midi: 52, velocity: 0.52, durationBeats: 3.9 }, // E3
  { beat: 4.05, midi: 60, velocity: 0.40, durationBeats: 3.6 }, // C4
  { beat: 4.1, midi: 67, velocity: 0.44, durationBeats: 3.6 }, // G4
  { beat: 4.15, midi: 74, velocity: 0.42, durationBeats: 2.4 }, // D5
  { beat: 5.5, midi: 76, velocity: 0.54, durationBeats: 1.3 }, // E5
  { beat: 6.5, midi: 74, velocity: 0.48, durationBeats: 1.1 }, // D5
  { beat: 7.25, midi: 72, velocity: 0.46, durationBeats: 1.1 }, // C5

  // Bar 3: Dm9 (wistful reflection)
  { beat: 8.0, midi: 50, velocity: 0.55, durationBeats: 3.9 }, // D3
  { beat: 8.05, midi: 57, velocity: 0.42, durationBeats: 3.6 }, // A3
  { beat: 8.1, midi: 64, velocity: 0.44, durationBeats: 3.6 }, // E4
  { beat: 8.15, midi: 65, velocity: 0.40, durationBeats: 3.5 }, // F4
  { beat: 9.0, midi: 72, velocity: 0.56, durationBeats: 1.6 }, // C5
  { beat: 10.0, midi: 69, velocity: 0.50, durationBeats: 1.3 }, // A4
  { beat: 11.0, midi: 65, velocity: 0.46, durationBeats: 1.4 }, // F4

  // Bar 4: Bbmaj7 (soft sigh)
  { beat: 12.0, midi: 46, velocity: 0.52, durationBeats: 3.9 }, // Bb2
  { beat: 12.05, midi: 53, velocity: 0.40, durationBeats: 3.6 }, // F3
  { beat: 12.1, midi: 57, velocity: 0.40, durationBeats: 3.6 }, // A3
  { beat: 12.15, midi: 62, velocity: 0.44, durationBeats: 3.5 }, // D4
  { beat: 13.0, midi: 74, velocity: 0.54, durationBeats: 1.5 }, // D5
  { beat: 14.0, midi: 72, velocity: 0.50, durationBeats: 1.4 }, // C5
  { beat: 15.0, midi: 70, velocity: 0.46, durationBeats: 1.4 }, // Bb4

  // Bar 5: Fadd9/A (gentle bloom upward)
  { beat: 16.0, midi: 45, velocity: 0.50, durationBeats: 3.9 }, // A2
  { beat: 16.05, midi: 53, velocity: 0.42, durationBeats: 3.6 }, // F3
  { beat: 16.1, midi: 60, velocity: 0.42, durationBeats: 3.6 }, // C4
  { beat: 16.15, midi: 67, velocity: 0.44, durationBeats: 3.5 }, // G4
  { beat: 17.0, midi: 69, velocity: 0.52, durationBeats: 1.2 }, // A4
  { beat: 18.0, midi: 72, velocity: 0.56, durationBeats: 1.2 }, // C5
  { beat: 19.0, midi: 77, velocity: 0.54, durationBeats: 1.8 }, // F5

  // Bar 6: Gm9 -> C9sus4
  { beat: 20.0, midi: 43, velocity: 0.48, durationBeats: 2.0 }, // G2
  { beat: 20.05, midi: 62, velocity: 0.42, durationBeats: 2.0 }, // D4
  { beat: 20.1, midi: 65, velocity: 0.42, durationBeats: 2.0 }, // F4
  { beat: 20.15, midi: 69, velocity: 0.44, durationBeats: 2.0 }, // A4
  { beat: 22.0, midi: 48, velocity: 0.52, durationBeats: 2.1 }, // C3
  { beat: 22.05, midi: 55, velocity: 0.40, durationBeats: 2.0 }, // G3
  { beat: 22.1, midi: 62, velocity: 0.42, durationBeats: 2.0 }, // D4
  { beat: 22.15, midi: 65, velocity: 0.42, durationBeats: 2.0 }, // F4
  { beat: 22.5, midi: 74, velocity: 0.52, durationBeats: 1.2 }, // D5
  { beat: 23.5, midi: 72, velocity: 0.48, durationBeats: 1.0 }, // C5

  // Bar 7: Dm7 -> Bbmaj7
  { beat: 24.0, midi: 50, velocity: 0.50, durationBeats: 2.0 }, // D3
  { beat: 24.05, midi: 57, velocity: 0.40, durationBeats: 2.0 }, // A3
  { beat: 24.1, midi: 60, velocity: 0.40, durationBeats: 2.0 }, // C4
  { beat: 24.15, midi: 65, velocity: 0.44, durationBeats: 2.0 }, // F4
  { beat: 25.0, midi: 69, velocity: 0.50, durationBeats: 1.1 }, // A4
  { beat: 26.0, midi: 46, velocity: 0.50, durationBeats: 2.1 }, // Bb2
  { beat: 26.05, midi: 53, velocity: 0.38, durationBeats: 2.0 }, // F3
  { beat: 26.1, midi: 57, velocity: 0.40, durationBeats: 2.0 }, // A3
  { beat: 26.15, midi: 62, velocity: 0.42, durationBeats: 2.0 }, // D4
  { beat: 27.0, midi: 72, velocity: 0.52, durationBeats: 1.2 }, // C5

  // Bar 8: C6/9 warm settling turnaround
  { beat: 28.0, midi: 48, velocity: 0.52, durationBeats: 3.9 }, // C3
  { beat: 28.05, midi: 55, velocity: 0.40, durationBeats: 3.8 }, // G3
  { beat: 28.1, midi: 62, velocity: 0.40, durationBeats: 3.8 }, // D4
  { beat: 28.15, midi: 64, velocity: 0.42, durationBeats: 3.8 }, // E4
  { beat: 28.2, midi: 69, velocity: 0.44, durationBeats: 3.8 }, // A4
  { beat: 29.5, midi: 67, velocity: 0.46, durationBeats: 1.6 }, // G4
  { beat: 31.0, midi: 69, velocity: 0.42, durationBeats: 1.4 }, // A4
];

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Builds a smooth stereo hall impulse response with damped high-frequency shimmer. */
function createWarmHallImpulse(ctx: AudioContext, durationSec = 2.8): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * durationSec);
  const buffer = ctx.createBuffer(2, length, sampleRate);

  for (let ch = 0; ch < 2; ch += 1) {
    const channel = buffer.getChannelData(ch);
    let lpState = 0;

    for (let i = 0; i < length; i += 1) {
      const progress = i / length;
      const envelope = Math.pow(1 - progress, 2.65);
      const earlyBloom = Math.min(1, i / (sampleRate * 0.045));
      const white = Math.random() * 2 - 1;
      // Progressive dark smoothing models felt & wooden hall reflections
      const cutoff = 0.24 - progress * 0.16;
      lpState += (white - lpState) * cutoff;
      channel[i] = lpState * envelope * earlyBloom * 0.72;
    }
  }

  return buffer;
}

class ComfyPianoEngine {
  private ctx: AudioContext | null = null;
  private voiceBus: GainNode | null = null;
  private scrollDuckGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private hammerNoiseBuffer: AudioBuffer | null = null;

  private schedulerTimer = 0;
  private stopTimer = 0;
  private nextEventIdx = 0;
  private phraseOriginTime = 0;
  private status: PianoStatus = 'waiting';
  private userMuted = false;
  private currentDuck = 1;
  private lastWokeAt = 0;
  private pendingStart: Promise<boolean> | null = null;
  private listeners = new Set<(status: PianoStatus) => void>();

  subscribe(listener: (status: PianoStatus) => void): () => void {
    this.listeners.add(listener);
    listener(this.status);

    return () => {
      this.listeners.delete(listener);
    };
  }

  getStatus(): PianoStatus {
    return this.status;
  }

  private setStatus(next: PianoStatus) {
    if (this.status === next) return;

    this.status = next;
    this.listeners.forEach((cb) => cb(next));
  }

  private ensureAudioGraph(): AudioContext | null {
    if (this.ctx) return this.ctx;

    const AudioCtx = window.AudioContext;

    if (!AudioCtx) return null;

    const ctx = new AudioCtx();
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-16, ctx.currentTime);
    compressor.knee.setValueAtTime(18, ctx.currentTime);
    compressor.ratio.setValueAtTime(2.5, ctx.currentTime);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);

    const scrollDuckGain = ctx.createGain();
    scrollDuckGain.gain.setValueAtTime(this.currentDuck, ctx.currentTime);

    const voiceBus = ctx.createGain();
    voiceBus.gain.setValueAtTime(1, ctx.currentTime);

    // Wool felt damping lowpass removes synthetic edges
    const feltFilter = ctx.createBiquadFilter();
    feltFilter.type = 'lowpass';
    feltFilter.frequency.setValueAtTime(1420, ctx.currentTime);
    feltFilter.Q.setValueAtTime(0.42, ctx.currentTime);

    const dryGain = ctx.createGain();
    dryGain.gain.setValueAtTime(0.68, ctx.currentTime);

    const wetGain = ctx.createGain();
    wetGain.gain.setValueAtTime(0.44, ctx.currentTime);

    const convolver = ctx.createConvolver();
    convolver.buffer = createWarmHallImpulse(ctx, 2.8);

    voiceBus.connect(feltFilter);
    feltFilter.connect(dryGain);
    feltFilter.connect(convolver);
    convolver.connect(wetGain);

    dryGain.connect(scrollDuckGain);
    wetGain.connect(scrollDuckGain);
    scrollDuckGain.connect(masterGain);
    masterGain.connect(compressor);
    compressor.connect(ctx.destination);

    // Shared 28ms soft felt hammer noise buffer
    const noiseLen = Math.floor(ctx.sampleRate * 0.028);
    const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);

    for (let i = 0; i < noiseLen; i += 1) {
      const env = Math.sin((i / noiseLen) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env;
    }

    this.ctx = ctx;
    this.voiceBus = voiceBus;
    this.scrollDuckGain = scrollDuckGain;
    this.masterGain = masterGain;
    this.hammerNoiseBuffer = noiseBuf;

    return ctx;
  }

  private triggerFeltNote(when: number, midi: number, velocity: number, durationBeats: number) {
    const ctx = this.ctx;
    const bus = this.voiceBus;

    if (!ctx || !bus) return;

    const baseFreq = midiToFreq(midi);
    const noteGain = ctx.createGain();
    const registerWarmth = midi < 56 ? 1.25 : 1.0;
    const durationSec = Math.max(0.85, durationBeats * BEAT_SEC * registerWarmth);
    const peakAmp = 0.16 * velocity;

    noteGain.gain.setValueAtTime(0.0001, when);
    noteGain.gain.linearRampToValueAtTime(peakAmp, when + 0.022);
    noteGain.gain.exponentialRampToValueAtTime(Math.max(0.0008, peakAmp * 0.34), when + durationSec * 0.42);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, when + durationSec);
    noteGain.connect(bus);

    // Primary fundamental string
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, when);
    osc1.connect(noteGain);
    osc1.start(when);
    osc1.stop(when + durationSec + 0.05);

    // Warm 2nd partial with subtle stretched string stiffness
    const partial2Gain = ctx.createGain();
    partial2Gain.gain.setValueAtTime(0.28, when);
    partial2Gain.gain.exponentialRampToValueAtTime(0.02, when + durationSec * 0.55);
    partial2Gain.connect(noteGain);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 2.0014, when);
    osc2.connect(partial2Gain);
    osc2.start(when);
    osc2.stop(when + durationSec * 0.65 + 0.05);

    // Soft 3rd harmonic color
    const partial3Gain = ctx.createGain();
    partial3Gain.gain.setValueAtTime(0.07, when);
    partial3Gain.gain.exponentialRampToValueAtTime(0.004, when + durationSec * 0.28);
    partial3Gain.connect(noteGain);

    const osc3 = ctx.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(baseFreq * 3.003, when);
    osc3.connect(partial3Gain);
    osc3.start(when);
    osc3.stop(when + durationSec * 0.35 + 0.05);

    // Subtle mechanical felt-on-wood hammer thump
    if (this.hammerNoiseBuffer) {
      const hammerFilter = ctx.createBiquadFilter();
      hammerFilter.type = 'lowpass';
      hammerFilter.frequency.setValueAtTime(240, when);

      const hammerGain = ctx.createGain();
      hammerGain.gain.setValueAtTime(0.032 * velocity, when);

      const hammerSrc = ctx.createBufferSource();
      hammerSrc.buffer = this.hammerNoiseBuffer;
      hammerSrc.connect(hammerFilter);
      hammerFilter.connect(hammerGain);
      hammerGain.connect(bus);
      hammerSrc.start(when);
    }
  }

  private runSchedulerTick = () => {
    const ctx = this.ctx;

    if (!ctx || this.status === 'stopped' || ctx.state !== 'running') return;

    const lookaheadUntil = ctx.currentTime + 0.55;

    while (true) {
      const event = NOCTURNE_PHRASE[this.nextEventIdx];
      const eventTime = this.phraseOriginTime + event.beat * BEAT_SEC;

      if (eventTime > lookaheadUntil) break;

      // Micro-rubato variance prevents machine-like spacing
      const humanOffset = (Math.sin(event.beat * 1.7) * 0.008);
      this.triggerFeltNote(
        Math.max(ctx.currentTime + 0.01, eventTime + humanOffset),
        event.midi,
        event.velocity,
        event.durationBeats
      );

      this.nextEventIdx += 1;

      if (this.nextEventIdx >= NOCTURNE_PHRASE.length) {
        this.nextEventIdx = 0;
        this.phraseOriginTime += PHRASE_BEATS * BEAT_SEC;
      }
    }
  };

  private beginNoteLoop() {
    if (!this.ctx || this.schedulerTimer) return;

    this.phraseOriginTime = this.ctx.currentTime + 0.08;
    this.nextEventIdx = 0;
    this.runSchedulerTick();
    this.schedulerTimer = window.setInterval(this.runSchedulerTick, 120);
  }

  /** Attempts immediate playback on load or resumes cleanly on first gesture. */
  async startOrResume(userInitiated = false): Promise<boolean> {
    if (this.getStatus() === 'stopped') return false;

    if (this.pendingStart) {
      return this.pendingStart;
    }

    const run = async (): Promise<boolean> => {
      const ctx = this.ensureAudioGraph();

      if (!ctx || !this.masterGain) return false;

      if (ctx.state === 'suspended') {
        if (!userInitiated) {
          this.setStatus('waiting');

          return false;
        }

        try {
          await ctx.resume();
          this.lastWokeAt = performance.now();
        } catch {
          return false;
        }
      }

      if (ctx.state !== 'running') {
        this.setStatus('waiting');

        return false;
      }

      if (this.getStatus() === 'stopped') return false;

      this.beginNoteLoop();

      if (!this.userMuted) {
        const now = ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
        this.masterGain.gain.linearRampToValueAtTime(TARGET_MASTER_GAIN, now + 1.6);
        this.setStatus('playing');
      }

      return true;
    };

    this.pendingStart = run().finally(() => {
      this.pendingStart = null;
    });

    return this.pendingStart;
  }

  /** Smoothly attenuates the felt piano as the soundtrack headline begins entering view. */
  setScrollDuckFactor(factor: number) {
    const clamped = Math.max(0, Math.min(1, factor));
    this.currentDuck = clamped;

    if (!this.ctx || !this.scrollDuckGain || this.status === 'stopped') return;

    const now = this.ctx.currentTime;
    this.scrollDuckGain.gain.setTargetAtTime(clamped, now, 0.14);
  }

  /**
   * Seamless gradual fade-out when "Songs that we listen all throughout the years" is introduced.
   * Decays to silence naturally before halting the Web Audio scheduler.
   */
  fadeOutAndStop(fadeSeconds = 2.4) {
    if (this.status === 'stopped') return;

    this.setStatus('stopped');

    if (this.stopTimer) {
      window.clearTimeout(this.stopTimer);
      this.stopTimer = 0;
    }

    if (!this.ctx || !this.masterGain) {
      this.haltAudioNow();

      return;
    }

    const now = this.ctx.currentTime;
    const safeFade = Math.max(0.5, fadeSeconds);
    const tau = safeFade / 3.4;

    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(0.0001, now, tau);

    this.stopTimer = window.setTimeout(() => {
      this.haltAudioNow();
    }, Math.round(safeFade * 1000) + 180);
  }

  /** Toggles manual mute before soundtrack intro or starts audio if waiting for a browser gesture. */
  async toggleMute() {
    if (this.status === 'stopped') return;

    if (this.status === 'waiting') {
      this.userMuted = false;
      await this.startOrResume(true);

      return;
    }

    if (performance.now() - this.lastWokeAt < 450 && !this.userMuted) {
      return;
    }

    this.userMuted = !this.userMuted;

    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(this.userMuted ? 0.0001 : TARGET_MASTER_GAIN, now, 0.18);
    this.setStatus(this.userMuted ? 'muted' : 'playing');
  }

  private haltAudioNow() {
    if (this.schedulerTimer) {
      window.clearInterval(this.schedulerTimer);
      this.schedulerTimer = 0;
    }

    if (this.ctx) {
      const ctxToClose = this.ctx;
      this.ctx = null;
      this.voiceBus = null;
      this.scrollDuckGain = null;
      this.masterGain = null;
      this.hammerNoiseBuffer = null;
      ctxToClose.close().catch(() => {});
    }
  }
}

export const comfyPiano = new ComfyPianoEngine();

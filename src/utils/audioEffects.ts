/**
 * Audio effects and playback utility using Web Audio API
 */

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private startTime = 0;
  private pauseTime = 0;
  private isPlaying = false;
  private gainNode: GainNode | null = null;
  private onEndedCallback: (() => void) | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public async loadAudioFromUrl(url: string): Promise<AudioBuffer> {
    this.initContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const decoded = await this.ctx!.decodeAudioData(arrayBuffer);
    this.audioBuffer = decoded;
    return decoded;
  }

  public play(options: {
    speed?: number;
    pitchPercent?: number; // e.g. -50 to +50
    effect?: 'none' | 'helium' | 'deep' | 'radio' | 'reverb';
    volume?: number;
    onEnded?: () => void;
    offset?: number;
  }) {
    this.stop();
    if (!this.audioBuffer || !this.ctx) return;

    this.initContext();
    const source = this.ctx.createBufferSource();
    source.buffer = this.audioBuffer;

    // Rate & Pitch calculation
    // Web Audio detune is measured in cents (1 semitone = 100 cents, 1 octave = 1200 cents)
    const pitchDetuneCents = (options.pitchPercent || 0) * 24; // -50 to +50 -> -1200 to +1200 cents
    source.detune.value = pitchDetuneCents;
    source.playbackRate.value = options.speed || 1.0;

    // Build processing chain
    let lastNode: AudioNode = source;

    const effect = options.effect || 'none';

    if (effect === 'helium') {
      // High-pass filter + slight peak for cartoon squeak
      const highPass = this.ctx.createBiquadFilter();
      highPass.type = 'highpass';
      highPass.frequency.value = 400;

      const peak = this.ctx.createBiquadFilter();
      peak.type = 'peaking';
      peak.frequency.value = 2400;
      peak.gain.value = 6;

      lastNode.connect(highPass);
      highPass.connect(peak);
      lastNode = peak;
    } else if (effect === 'deep') {
      // Low-shelf boost + low-pass filter for theatrical deep voice
      const lowShelf = this.ctx.createBiquadFilter();
      lowShelf.type = 'lowshelf';
      lowShelf.frequency.value = 250;
      lowShelf.gain.value = 7;

      const lowPass = this.ctx.createBiquadFilter();
      lowPass.type = 'lowpass';
      lowPass.frequency.value = 3500;

      lastNode.connect(lowShelf);
      lowShelf.connect(lowPass);
      lastNode = lowPass;
    } else if (effect === 'radio') {
      // Band-pass telephone / walkie-talkie effect
      const bandPass = this.ctx.createBiquadFilter();
      bandPass.type = 'bandpass';
      bandPass.frequency.value = 1600;
      bandPass.Q.value = 1.2;

      lastNode.connect(bandPass);
      lastNode = bandPass;
    } else if (effect === 'reverb') {
      // Synthetic reverb buffer
      const reverb = this.createSyntheticReverb(this.ctx, 1.6, 2.0);
      const wetGain = this.ctx.createGain();
      wetGain.gain.value = 0.35;
      const dryGain = this.ctx.createGain();
      dryGain.gain.value = 0.8;

      const merger = this.ctx.createGain();
      lastNode.connect(dryGain);
      lastNode.connect(reverb);
      reverb.connect(wetGain);

      dryGain.connect(merger);
      wetGain.connect(merger);
      lastNode = merger;
    }

    // Volume Gain
    const gain = this.ctx.createGain();
    gain.gain.value = options.volume !== undefined ? options.volume : 1.0;
    this.gainNode = gain;
    lastNode.connect(gain);
    gain.connect(this.ctx.destination);

    this.currentSource = source;
    this.onEndedCallback = options.onEnded || null;

    source.onended = () => {
      this.isPlaying = false;
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
    };

    const offset = options.offset || 0;
    source.start(0, offset);
    this.startTime = this.ctx.currentTime - offset;
    this.isPlaying = true;
  }

  public stop() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch {
        // source may already be stopped
      }
      this.currentSource = null;
    }
    this.isPlaying = false;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getDuration(): number {
    return this.audioBuffer ? this.audioBuffer.duration : 0;
  }

  private createSyntheticReverb(ctx: AudioContext, duration: number, decay: number): ConvolverNode {
    const rate = ctx.sampleRate;
    const length = rate * duration;
    const impulse = ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i;
      left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }

    const convolver = ctx.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  }
}

/**
 * Downloads a data URL or blob URL with specified filename
 */
export function triggerAudioDownload(audioUrl: string, fileName: string) {
  const anchor = document.createElement('a');
  anchor.href = audioUrl;
  anchor.download = fileName.endsWith('.wav') ? fileName : `${fileName}.wav`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/**
 * Converts a File object to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // remove the data:audio/*;base64, header if needed or keep full
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Converts audio Blob to base64
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

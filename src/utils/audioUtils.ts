// Audio conversion utilities for Gemini Live API
// Live API requires 16-bit linear PCM little-endian at 16kHz for input
// and outputs 24kHz 16-bit linear PCM little-endian for audio response.

/**
 * Converts Float32Array from AudioContext to 16-bit PCM ArrayBuffer
 */
export function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const output = new DataView(new ArrayBuffer(input.length * 2));
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return output.buffer;
}

/**
 * Encodes an ArrayBuffer to a Base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes a base64 string to Float32Array audio buffer for Web Audio API
 */
export function base64ToFloat32Audio(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const dataView = new DataView(bytes.buffer);
  const numSamples = Math.floor(bytes.length / 2);
  const float32 = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    float32[i] = int16 < 0 ? int16 / 0x8000 : int16 / 0x7fff;
  }

  return float32;
}

/**
 * Audio Queue Player for gapless playback of 24kHz PCM streams from Gemini Live
 */
export class LiveAudioPlayer {
  private ctx: AudioContext | null = null;
  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  public init() {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx({ sampleRate: 24000 });
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playChunk(base64Pcm: string, onLevel?: (level: number) => void) {
    try {
      this.init();
      if (!this.ctx) return;

      const samples = base64ToFloat32Audio(base64Pcm);
      if (samples.length === 0) return;

      // Calculate approximate RMS for visualizer
      if (onLevel) {
        let sum = 0;
        for (let i = 0; i < samples.length; i += 10) {
          sum += samples[i] * samples[i];
        }
        const rms = Math.sqrt(sum / (samples.length / 10));
        onLevel(Math.min(1, rms * 5));
      }

      const audioBuffer = this.ctx.createBuffer(1, samples.length, 24000);
      audioBuffer.copyToChannel(samples, 0);

      const source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.ctx.destination);

      const currentTime = this.ctx.currentTime;
      const startTime = Math.max(currentTime, this.nextStartTime);
      source.start(startTime);
      this.nextStartTime = startTime + audioBuffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        const index = this.activeSources.indexOf(source);
        if (index > -1) {
          this.activeSources.splice(index, 1);
        }
      };
    } catch (err) {
      console.error('Error playing Live audio chunk:', err);
    }
  }

  public stopAll() {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch (_) {}
    }
    this.activeSources = [];
    if (this.ctx) {
      this.nextStartTime = this.ctx.currentTime;
    }
  }

  public close() {
    this.stopAll();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

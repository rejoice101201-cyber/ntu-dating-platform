export type SfxName = 'munch' | 'power' | 'ghost' | 'death' | 'extra' | 'fruit';

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private gainMusic: GainNode | null = null;
  private gainSfx: GainNode | null = null;
  private bgSource: AudioBufferSourceNode | null = null;
  private sfx: Record<string, AudioBuffer> = {};
  private muted = false;

  async init() {
    if (this.audioContext) return;
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainMusic = this.audioContext.createGain();
      this.gainSfx = this.audioContext.createGain();
      this.gainMusic.connect(this.audioContext.destination);
      this.gainSfx.connect(this.audioContext.destination);
    } catch {}
  }

  setMuted(muted: boolean) { this.muted = muted; this.updateGains(); }
  setMusicVolume(v: number) { if (this.gainMusic) this.gainMusic.gain.value = this.muted ? 0 : v; }
  setSfxVolume(v: number) { if (this.gainSfx) this.gainSfx.gain.value = this.muted ? 0 : v; }
  private updateGains() {
    if (this.gainMusic) this.gainMusic.gain.value = this.muted ? 0 : this.gainMusic.gain.value;
    if (this.gainSfx) this.gainSfx.gain.value = this.muted ? 0 : this.gainSfx.gain.value;
  }

  private async fetchArrayBuffer(url: string): Promise<ArrayBuffer | null> {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.arrayBuffer();
    } catch { return null; }
  }

  private async decodeAudio(data: ArrayBuffer): Promise<AudioBuffer | null> {
    if (!this.audioContext) return null;
    try { return await this.audioContext.decodeAudioData(data.slice(0)); } catch { return null; }
  }

  async loadSound(name: string, url: string) {
    await this.init();
    const buf = await this.fetchArrayBuffer(url);
    if (buf) {
      const decoded = await this.decodeAudio(buf);
      if (decoded) this.sfx[name] = decoded;
    }
  }

  async loadBackground(url: string) {
    await this.init();
    const buf = await this.fetchArrayBuffer(url);
    if (!buf) return;
    const decoded = await this.decodeAudio(buf);
    if (!decoded || !this.audioContext || !this.gainMusic) return;
    this.bgSource = this.audioContext.createBufferSource();
    this.bgSource.buffer = decoded;
    this.bgSource.loop = true;
    this.bgSource.connect(this.gainMusic);
  }

  startBackground() {
    if (!this.audioContext || !this.bgSource) return;
    try { this.bgSource.start(0); } catch {}
  }

  stopBackground() { try { this.bgSource?.stop(); } catch {} finally { this.bgSource = null; } }

  private synthBeep(freq: number, duration: number, destination: GainNode) {
    if (!this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.value = this.muted ? 0 : 0.08;
    osc.connect(gain);
    gain.connect(destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }

  playSfx(name: SfxName) {
    if (!this.audioContext || !this.gainSfx) return;
    const buffer = this.sfx[name];
    if (buffer) {
      const src = this.audioContext.createBufferSource();
      src.buffer = buffer;
      src.connect(this.gainSfx);
      try { src.start(0); } catch {}
      return;
    }
    // fallback synth
    const table: Record<SfxName, [number, number]> = {
      munch: [800, 0.06], power: [300, 0.2], ghost: [500, 0.12], death: [120, 0.6], extra: [1000, 0.2], fruit: [900, 0.1]
    };
    const conf = table[name];
    if (conf) this.synthBeep(conf[0], conf[1], this.gainSfx);
  }
}

export const soundManager = new SoundManager();



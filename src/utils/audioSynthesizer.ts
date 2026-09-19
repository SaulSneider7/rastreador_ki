/**
 * Web Audio API synthesizer for authentic Dragon Ball Z Scouter sound effects
 */

class ScouterAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private scanInterval: number | null = null;
  private isUnlocked: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  public unlockAudio() {
    if (this.isUnlocked && this.ctx && this.ctx.state === 'running') return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioContextClass();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.isUnlocked = true;
    } catch (e) {
      console.warn('AudioContext failed to initialize:', e);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.scanInterval) {
      this.stopScanningAudio();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Iconic Dragon Ball Z Scouter single rapid chirp
   */
  public playChirp(freq: number = 1850, duration: number = 0.045) {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Scouter tone uses a rich square/saw hybrid timbre
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.35, now + duration);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // ignore audio glitches
    }
  }

  /**
   * Rapid burst of 2-3 chirps when detecting subtle energy shifts
   */
  public playChirpBurst() {
    if (this.isMuted) return;
    this.playChirp(1600, 0.04);
    setTimeout(() => this.playChirp(2100, 0.04), 50);
  }

  /**
   * High-tech target lock-on ping
   */
  public playLockOn() {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Primary tone
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(2400, now);
      osc1.frequency.setValueAtTime(3200, now + 0.08);

      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      // Sub-harmonic tone
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1200, now);
      osc2.frequency.setValueAtTime(1600, now + 0.08);

      gain2.gain.setValueAtTime(0.08, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(this.ctx.destination);
      gain2.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
    } catch (e) {}
  }

  /**
   * Scouter button mechanical click / beep
   */
  public playButtonBeep() {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.06);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  /**
   * Over 9000 alarm siren
   */
  public playOver9000Alert() {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      
      // Siren warble: 1800Hz <-> 2700Hz
      const duration = 0.6;
      for (let i = 0; i < 4; i++) {
        const step = now + i * 0.15;
        osc.frequency.setValueAtTime(1800, step);
        osc.frequency.exponentialRampToValueAtTime(2600, step + 0.07);
        osc.frequency.exponentialRampToValueAtTime(1800, step + 0.14);
      }

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  /**
   * Scouter explosion / glass shatter sound effect when power breaks scouter limit
   */
  public playGlassExplosion() {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Noise generator for explosive shatter
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2800, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      // High-pitched crystal ping
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(4800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
      oscGain.gain.setValueAtTime(0.15, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      noise.start(now);
      osc.start(now);
      noise.stop(now + 0.4);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  /**
   * Continuous dynamic scanning routine with pitch-shifting clicks
   */
  public startScanningAudio(speedMs: number = 65) {
    if (this.isMuted || this.scanInterval !== null) return;
    this.unlockAudio();

    let step = 0;
    const baseFreqs = [1400, 1650, 1850, 2100, 2400, 2800];

    this.scanInterval = window.setInterval(() => {
      step++;
      const freq = baseFreqs[step % baseFreqs.length] + (Math.random() * 200 - 100);
      this.playChirp(freq, 0.035);
    }, speedMs);
  }

  public stopScanningAudio() {
    if (this.scanInterval !== null) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  /**
   * Ki Aura Energy Surge Hum
   */
  public playAuraCharge() {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.4);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {}
  }
}

export const scouterAudio = new ScouterAudioEngine();

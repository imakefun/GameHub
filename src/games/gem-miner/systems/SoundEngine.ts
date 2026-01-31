// ============================================================
// Gem Miner - Web Audio Sound Engine
// All sounds are procedurally synthesized - no audio files needed
// ============================================================

type SoundType =
  | 'select' | 'swap' | 'badSwap'
  | 'match' | 'matchBig' | 'matchSuper'
  | 'cascade' | 'combo'
  | 'rockBreak' | 'iceBreak' | 'dirtClear'
  | 'specialCreate' | 'specialActivate'
  | 'powerUpUse' | 'powerUpDynamite' | 'powerUpDrill'
  | 'win' | 'lose'
  | 'buttonClick' | 'levelStart';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicNodes: OscillatorNode[] = [];
  private _sfxEnabled = true;
  private _musicEnabled = true;
  private musicPlaying = false;

  get sfxEnabled() { return this._sfxEnabled; }
  get musicEnabled() { return this._musicEnabled; }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.6;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.7;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.15;
      this.musicGain.connect(this.masterGain);

    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  toggleSfx(): boolean {
    this._sfxEnabled = !this._sfxEnabled;
    return this._sfxEnabled;
  }

  toggleMusic(): boolean {
    this._musicEnabled = !this._musicEnabled;
    if (!this._musicEnabled) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this._musicEnabled;
  }

  // --- Utility oscillator helpers ---

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.3,
    delay = 0,
    detune = 0,
  ) {
    if (!this._sfxEnabled) return;
    const ctx = this.ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    gain.gain.value = 0;
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.05);
  }

  private playNoise(duration: number, volume = 0.15, delay = 0, highpass = 1000) {
    if (!this._sfxEnabled) return;
    const ctx = this.ensureContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = highpass;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);
    source.start(ctx.currentTime + delay);
  }

  // --- Sound Effects ---

  play(sound: SoundType, options?: { cascade?: number }) {
    switch (sound) {
      case 'select': return this.playSelect();
      case 'swap': return this.playSwap();
      case 'badSwap': return this.playBadSwap();
      case 'match': return this.playMatch(options?.cascade || 0);
      case 'matchBig': return this.playMatchBig(options?.cascade || 0);
      case 'matchSuper': return this.playMatchSuper();
      case 'cascade': return this.playCascade(options?.cascade || 1);
      case 'combo': return this.playCombo(options?.cascade || 2);
      case 'rockBreak': return this.playRockBreak();
      case 'iceBreak': return this.playIceBreak();
      case 'dirtClear': return this.playDirtClear();
      case 'specialCreate': return this.playSpecialCreate();
      case 'specialActivate': return this.playSpecialActivate();
      case 'powerUpUse': return this.playPowerUpUse();
      case 'powerUpDynamite': return this.playDynamite();
      case 'powerUpDrill': return this.playDrill();
      case 'win': return this.playWin();
      case 'lose': return this.playLose();
      case 'buttonClick': return this.playButtonClick();
      case 'levelStart': return this.playLevelStart();
    }
  }

  private playSelect() {
    this.playTone(880, 0.08, 'sine', 0.15);
    this.playTone(1100, 0.06, 'sine', 0.1, 0.03);
  }

  private playSwap() {
    this.playTone(440, 0.12, 'sine', 0.2);
    this.playTone(550, 0.1, 'sine', 0.15, 0.06);
  }

  private playBadSwap() {
    this.playTone(220, 0.15, 'square', 0.1);
    this.playTone(180, 0.15, 'square', 0.1, 0.1);
  }

  private playMatch(cascade: number) {
    const baseFreq = 523 + cascade * 80; // C5, go up with cascades
    this.playTone(baseFreq, 0.15, 'sine', 0.25);
    this.playTone(baseFreq * 1.25, 0.12, 'sine', 0.2, 0.05);
    this.playTone(baseFreq * 1.5, 0.1, 'sine', 0.15, 0.1);
  }

  private playMatchBig(cascade: number) {
    const base = 587 + cascade * 80; // D5
    this.playTone(base, 0.2, 'sine', 0.3);
    this.playTone(base * 1.25, 0.18, 'sine', 0.25, 0.05);
    this.playTone(base * 1.5, 0.15, 'sine', 0.2, 0.1);
    this.playTone(base * 2, 0.12, 'triangle', 0.15, 0.15);
    this.playNoise(0.08, 0.1, 0.05, 4000);
  }

  private playMatchSuper() {
    // Ascending arpeggio
    const notes = [523, 659, 784, 1047, 1319]; // C5 major
    notes.forEach((freq, i) => {
      this.playTone(freq, 0.2, 'sine', 0.25, i * 0.06);
      this.playTone(freq * 2, 0.15, 'triangle', 0.1, i * 0.06);
    });
    this.playNoise(0.15, 0.12, 0.1, 6000);
  }

  private playCascade(level: number) {
    const base = 440 + level * 110;
    this.playTone(base, 0.12, 'sine', 0.2);
    this.playTone(base * 1.5, 0.1, 'sine', 0.15, 0.04);
  }

  private playCombo(level: number) {
    const base = 660 + level * 50;
    for (let i = 0; i < Math.min(level, 5); i++) {
      this.playTone(base + i * 100, 0.15, 'triangle', 0.15, i * 0.05);
    }
  }

  private playRockBreak() {
    this.playNoise(0.2, 0.25, 0, 200);
    this.playTone(120, 0.2, 'sawtooth', 0.15);
    this.playTone(80, 0.25, 'sine', 0.2, 0.05);
  }

  private playIceBreak() {
    this.playNoise(0.15, 0.15, 0, 3000);
    this.playTone(2000, 0.1, 'sine', 0.12);
    this.playTone(3000, 0.08, 'sine', 0.08, 0.03);
    this.playTone(4000, 0.06, 'sine', 0.05, 0.06);
  }

  private playDirtClear() {
    this.playNoise(0.12, 0.12, 0, 500);
    this.playTone(200, 0.12, 'sine', 0.1);
  }

  private playSpecialCreate() {
    const notes = [880, 1109, 1319, 1760];
    notes.forEach((f, i) => {
      this.playTone(f, 0.25 - i * 0.04, 'sine', 0.2, i * 0.07);
      this.playTone(f, 0.25 - i * 0.04, 'triangle', 0.08, i * 0.07, 5);
    });
    this.playNoise(0.2, 0.08, 0.1, 5000);
  }

  private playSpecialActivate() {
    this.playTone(440, 0.3, 'sawtooth', 0.15);
    this.playTone(880, 0.25, 'sine', 0.2, 0.05);
    this.playTone(1320, 0.2, 'sine', 0.15, 0.1);
    this.playNoise(0.25, 0.15, 0.05, 2000);
  }

  private playPowerUpUse() {
    this.playTone(330, 0.15, 'sine', 0.2);
    this.playTone(440, 0.12, 'sine', 0.18, 0.08);
    this.playTone(660, 0.1, 'sine', 0.15, 0.15);
  }

  private playDynamite() {
    // Boom!
    this.playTone(60, 0.5, 'sine', 0.4);
    this.playTone(40, 0.6, 'sine', 0.3, 0.05);
    this.playNoise(0.35, 0.35, 0, 100);
    this.playNoise(0.2, 0.15, 0.1, 2000);
  }

  private playDrill() {
    // Drilling sound
    for (let i = 0; i < 6; i++) {
      this.playTone(200 + i * 50, 0.08, 'sawtooth', 0.12, i * 0.05);
      this.playNoise(0.04, 0.08, i * 0.05, 1500);
    }
  }

  private playWin() {
    // Victory fanfare - C major arpeggio with harmony
    const melody = [523, 659, 784, 1047, 784, 1047, 1319];
    const timing = [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8];
    const durations = [0.15, 0.15, 0.15, 0.25, 0.15, 0.2, 0.5];
    melody.forEach((freq, i) => {
      this.playTone(freq, durations[i], 'sine', 0.25, timing[i]);
      this.playTone(freq * 0.5, durations[i], 'triangle', 0.1, timing[i]);
    });
    // Sparkle overtones
    this.playTone(2093, 0.3, 'sine', 0.06, 0.8);
    this.playTone(2637, 0.25, 'sine', 0.04, 0.9);
  }

  private playLose() {
    // Sad descending tones
    this.playTone(392, 0.3, 'sine', 0.2, 0);
    this.playTone(349, 0.3, 'sine', 0.2, 0.25);
    this.playTone(311, 0.3, 'sine', 0.2, 0.5);
    this.playTone(261, 0.5, 'sine', 0.25, 0.75);
  }

  private playButtonClick() {
    this.playTone(660, 0.04, 'sine', 0.12);
  }

  private playLevelStart() {
    this.playTone(523, 0.12, 'sine', 0.18, 0);
    this.playTone(659, 0.12, 'sine', 0.18, 0.1);
    this.playTone(784, 0.18, 'sine', 0.22, 0.2);
  }

  // --- Background Music ---
  // Ambient mining loop using a pentatonic scale

  startMusic() {
    if (!this._musicEnabled || this.musicPlaying) return;

    this.ensureContext();
    this.musicPlaying = true;

    // Create a gentle ambient pad
    const notes = [130.81, 146.83, 164.81, 196.00, 220.00]; // C3 pentatonic

    const playMusicNote = () => {
      if (!this.musicPlaying || !this._musicEnabled) return;
      const ctx2 = this.ensureContext();
      const noteFreq = notes[Math.floor(Math.random() * notes.length)];
      const osc = ctx2.createOscillator();
      const gain = ctx2.createGain();
      osc.type = 'sine';
      osc.frequency.value = noteFreq;
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.08, ctx2.currentTime + 0.5);
      gain.gain.linearRampToValueAtTime(0.05, ctx2.currentTime + 2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 3.5);
      osc.connect(gain);
      gain.connect(this.musicGain!);
      osc.start(ctx2.currentTime);
      osc.stop(ctx2.currentTime + 4);
      this.musicNodes.push(osc);

      // Occasional 5th harmony
      if (Math.random() > 0.5) {
        const osc2 = ctx2.createOscillator();
        const gain2 = ctx2.createGain();
        osc2.type = 'triangle';
        osc2.frequency.value = noteFreq * 1.5;
        gain2.gain.value = 0;
        gain2.gain.linearRampToValueAtTime(0.03, ctx2.currentTime + 0.8);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 3);
        osc2.connect(gain2);
        gain2.connect(this.musicGain!);
        osc2.start(ctx2.currentTime);
        osc2.stop(ctx2.currentTime + 3.5);
        this.musicNodes.push(osc2);
      }

      // Schedule next note
      const delay = 2000 + Math.random() * 2000;
      if (this.musicPlaying) {
        setTimeout(playMusicNote, delay);
      }
    };

    // Start with initial notes
    playMusicNote();
    setTimeout(playMusicNote, 800);
  }

  stopMusic() {
    this.musicPlaying = false;
    this.musicNodes.forEach(osc => {
      try { osc.stop(); } catch { /* already stopped */ }
    });
    this.musicNodes = [];
  }

  dispose() {
    this.stopMusic();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// Singleton instance
export const soundEngine = new SoundEngine();

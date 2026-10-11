// Synthesized soft chime sound effects using Web Audio API

class SoundEffects {
  private ctx: AudioContext | null = null;
  private isMemoryLanePlaying = false;
  private memoryLaneInterval: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Helper to ring a single delicate windchime tube with subtle harmonic overtone
  private ringChimeTone(freq: number, delayMs: number, peakGain: number = 0.038, durationSec: number = 0.9) {
    if (!this.ctx) return;
    const startTime = this.ctx.currentTime + delayMs / 1000;

    // Fundamental pure chime tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + durationSec);

    // Silvery high-harmonic chime overtone (shimmering resonance)
    const overtoneOsc = this.ctx.createOscillator();
    const overtoneGain = this.ctx.createGain();

    overtoneOsc.type = 'sine';
    overtoneOsc.frequency.setValueAtTime(freq * 2.756, startTime);

    overtoneGain.gain.setValueAtTime(0.0001, startTime);
    overtoneGain.gain.exponentialRampToValueAtTime(peakGain * 0.25, startTime + 0.005);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec * 0.45);

    overtoneOsc.connect(overtoneGain);
    overtoneGain.connect(this.ctx.destination);

    overtoneOsc.start(startTime);
    overtoneOsc.stop(startTime + durationSec * 0.45);
  }

  // Subtle windchime effect for pinning (ascending airy crystal chime)
  playPinWindchime() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      // Staggered delicate chimes: G6, B6, E7
      this.ringChimeTone(1567.98, 0, 0.035, 0.85);
      this.ringChimeTone(1975.53, 40, 0.040, 0.95);
      this.ringChimeTone(2637.02, 85, 0.030, 1.1);
    } catch {
      // Audio fallback
    }
  }

  // Subtle windchime effect for unpinning (gentle breeze resolving downward)
  playUnpinWindchime() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      // Staggered breeze chimes resolving downward: D7, A6, F#6
      this.ringChimeTone(2349.32, 0, 0.032, 0.85);
      this.ringChimeTone(1760.00, 38, 0.038, 0.9);
      this.ringChimeTone(1479.98, 80, 0.028, 1.05);
    } catch {
      // Audio fallback
    }
  }

  // Pin drop / pin action uses subtle windchime
  playPinDrop() {
    this.playPinWindchime();
  }

  // Soft romantic pop/chime when clicking a heart or reaction
  playHeartReaction() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, this.ctx.currentTime + 0.12); // G5

      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.045, this.ctx.currentTime + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch {
      // Audio autoplay policy or unavailable
    }
  }

  // Subtle, soft velvet tap / droplet sound for icon clicks and tab switching
  playSoftChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Gentle organic micro-tap: warm sine tone slightly softening
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, t);
      osc.frequency.exponentialRampToValueAtTime(460, t + 0.055);

      // Low, non-intrusive volume with smooth attack and quick natural decay
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.022, t + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.065);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.065);
    } catch {
      // Audio fallback
    }
  }

  // Dedicated alias for tab switching
  playTabSwitch() {
    this.playSoftChime();
  }

  // Memory lane peaceful music box melody
  startMemoryLaneMelody() {
    this.stopMemoryLaneMelody();
    this.isMemoryLanePlaying = true;
    try {
      this.initCtx();
      const notes = [
        523.25, 659.25, 783.99, 1046.50, // C E G C
        880.00, 698.46, 659.25, 587.33, // A F E D
        523.25, 783.99, 880.00, 1046.50, // C G A C
        987.77, 783.99, 659.25, 523.25  // B G E C
      ];
      let step = 0;

      const playNote = () => {
        if (!this.isMemoryLanePlaying || !this.ctx) return;
        const freq = notes[step % notes.length];
        step++;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 1.2);
      };

      playNote();
      this.memoryLaneInterval = window.setInterval(playNote, 1400);
    } catch {
      // Fallback
    }
  }

  stopMemoryLaneMelody() {
    this.isMemoryLanePlaying = false;
    if (this.memoryLaneInterval !== null) {
      clearInterval(this.memoryLaneInterval);
      this.memoryLaneInterval = null;
    }
  }

  isMusicPlaying() {
    return this.isMemoryLanePlaying;
  }
}

export const sound = new SoundEffects();

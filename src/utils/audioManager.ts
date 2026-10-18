import { SongTrack } from '../types';

class RomanticSynthEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timer: number | null = null;
  private currentTheme: string = 'nostalgic';
  private gainNode: GainNode | null = null;

  private chordProgressions: Record<string, number[][]> = {
    nostalgic: [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23], // G7
    ],
    gentle: [
      [293.66, 369.99, 440.00, 554.37], // Dmaj7
      [246.94, 293.66, 369.99, 440.00], // Bm7
      [196.00, 246.94, 293.66, 369.99], // Gmaj7
      [220.00, 277.18, 329.63, 392.00], // A7
    ],
    deep: [
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 392.00], // Gsus4
      [164.81, 196.00, 246.94, 329.63], // Em7
    ],
    warm: [
      [349.23, 440.00, 523.25, 659.25], // Fmaj7
      [261.63, 329.63, 392.00, 523.25], // Cmaj7
      [293.66, 349.23, 440.00, 523.25], // Dm7
      [196.00, 246.94, 293.66, 392.00], // G
    ],
    dreamy: [
      [329.63, 415.30, 493.88, 622.25], // Emaj7
      [277.18, 329.63, 415.30, 493.88], // C#m7
      [220.00, 277.18, 329.63, 415.30], // Amaj7
      [246.94, 311.13, 369.99, 440.00], // B7
    ],
    hopeful: [
      [261.63, 329.63, 392.00, 523.25], // C
      [196.00, 246.94, 293.66, 392.00], // G
      [220.00, 261.63, 329.63, 392.00], // Am
      [174.61, 220.00, 261.63, 349.23], // F
    ],
    joyful: [
      [293.66, 369.99, 440.00, 587.33], // D
      [220.00, 277.18, 329.63, 440.00], // A
      [246.94, 293.66, 369.99, 440.00], // Bm
      [196.00, 246.94, 293.66, 392.00], // G
    ],
    radiant: [
      [349.23, 440.00, 523.25, 659.25], // Fmaj7
      [329.63, 392.00, 493.88, 587.33], // Em7
      [293.66, 349.23, 440.00, 523.25], // Dm7
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
    ],
    celebration: [
      [261.63, 329.63, 392.00, 523.25], // C
      [329.63, 392.00, 493.88, 587.33], // Em
      [349.23, 440.00, 523.25, 659.25], // F
      [392.00, 493.88, 587.33, 783.99], // G
    ]
  };

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.04, this.ctx.currentTime); // 50% default volume scale
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(volume * 0.08, this.ctx.currentTime, 0.1);
    }
  }

  public playTheme(theme: string) {
    this.init();
    this.currentTheme = theme;
    if (this.isPlaying) return;
    this.isPlaying = true;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.gainNode.gain.setValueAtTime(0.04, this.ctx.currentTime);
    }
    this.scheduleNextChord(0);
  }

  private scheduleNextChord(step: number) {
    if (!this.isPlaying || !this.ctx || !this.gainNode) return;
    
    const chords = this.chordProgressions[this.currentTheme] || this.chordProgressions.nostalgic;
    const currentChord = chords[step % chords.length];

    currentChord.forEach((freq, idx) => {
      if (!this.ctx || !this.gainNode) return;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      const noteDelay = idx * 0.08;
      const duration = 2.8;

      noteGain.gain.setValueAtTime(0, now + noteDelay);
      noteGain.gain.linearRampToValueAtTime(0.03, now + noteDelay + 0.35);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + noteDelay + duration);

      osc.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.start(now + noteDelay);
      osc.stop(now + noteDelay + duration + 0.1);
    });

    this.timer = window.setTimeout(() => {
      this.scheduleNextChord(step + 1);
    }, 2400);
  }

  public stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }
}

class AudioManager {
  private currentAudio: HTMLAudioElement | null = null;
  private activeAudios: Set<HTMLAudioElement> = new Set();
  private trackSessionId = 0;
  private currentTrack: SongTrack | null = null;
  private isPlaying = false;
  private isMuted = false;
  private volume = 0.5; // Default volume set to 50%
  private listeners: Array<() => void> = [];
  private synthEngine = new RomanticSynthEngine();
  private usingSynth = false;

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => {
      try {
        l();
      } catch {
        // ignore listener errors
      }
    });
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      currentTrack: this.currentTrack,
      usingSynth: this.usingSynth
    };
  }

  private stopAudioElement(audio: HTMLAudioElement | null) {
    if (!audio) return;
    try {
      audio.oncanplay = null;
      audio.onerror = null;
      audio.onended = null;
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute('src');
      audio.load();
    } catch {
      // safe fallback
    }
  }

  private disposeAllAudios() {
    this.activeAudios.forEach(audio => {
      this.stopAudioElement(audio);
    });
    this.activeAudios.clear();
    this.currentAudio = null;
  }

  public async playTrack(track: SongTrack) {
    // If the exact same track is already playing smoothly, do not interrupt
    if (
      this.currentTrack?.audioUrl === track.audioUrl &&
      this.isPlaying &&
      this.currentAudio &&
      !this.currentAudio.paused &&
      !this.currentAudio.ended
    ) {
      return;
    }

    const sessionId = ++this.trackSessionId;
    this.currentTrack = track;
    this.isPlaying = true;

    // Immediately stop synth
    this.synthEngine.stop();

    // Synchronously and thoroughly destroy all previous audio elements
    this.disposeAllAudios();

    // Create new HTML5 Audio
    const audio = new Audio();
    audio.preload = 'auto';
    audio.loop = true;
    audio.volume = this.isMuted ? 0 : this.volume;

    this.activeAudios.add(audio);
    this.currentAudio = audio;
    this.usingSynth = false;

    audio.oncanplay = () => {
      // Obsolete request safeguard
      if (this.trackSessionId !== sessionId || this.currentAudio !== audio) {
        this.stopAudioElement(audio);
        this.activeAudios.delete(audio);
        return;
      }
      if (this.isPlaying) {
        this.usingSynth = false;
        audio.play().catch(() => {
          // Autoplay policy restriction fallback
        });
        this.notify();
      }
    };

    audio.onerror = () => {
      if (this.trackSessionId !== sessionId || this.currentAudio !== audio) {
        this.stopAudioElement(audio);
        this.activeAudios.delete(audio);
        return;
      }
      // Audio file missing or invalid URL -> fallback to ambient harmonic synth
      this.usingSynth = true;
      if (this.isPlaying) {
        this.synthEngine.setVolume(this.isMuted ? 0 : this.volume);
        this.synthEngine.playTheme(track.synthTheme);
      }
      this.notify();
    };

    audio.src = track.audioUrl;

    // Start playing
    audio.play()
      .then(() => {
        if (this.trackSessionId !== sessionId || this.currentAudio !== audio) {
          this.stopAudioElement(audio);
          this.activeAudios.delete(audio);
          return;
        }
        this.notify();
      })
      .catch(() => {
        // Will play upon next user gesture or oncanplay
      });

    this.notify();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public pause() {
    this.isPlaying = false;
    this.activeAudios.forEach(audio => {
      try {
        audio.pause();
      } catch {
        // safe fallback
      }
    });
    this.synthEngine.stop();
    this.notify();
  }

  public resume() {
    this.isPlaying = true;
    if (this.usingSynth || !this.currentAudio) {
      if (this.currentTrack) {
        this.synthEngine.setVolume(this.isMuted ? 0 : this.volume);
        this.synthEngine.playTheme(this.currentTrack.synthTheme);
      }
    } else if (this.currentAudio) {
      this.currentAudio.volume = this.isMuted ? 0 : this.volume;
      this.currentAudio.play().catch(() => {});
    }
    this.notify();
  }

  public stop() {
    this.isPlaying = false;
    this.disposeAllAudios();
    this.synthEngine.stop();
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    const targetVol = this.isMuted ? 0 : this.volume;
    this.activeAudios.forEach(audio => {
      try {
        audio.volume = targetVol;
      } catch {
        // safe fallback
      }
    });
    this.synthEngine.setVolume(targetVol);
    this.notify();
  }

  public setVolume(newVolume: number) {
    this.volume = Math.max(0, Math.min(1, newVolume));
    const targetVol = this.isMuted ? 0 : this.volume;
    this.activeAudios.forEach(audio => {
      try {
        audio.volume = targetVol;
      } catch {
        // safe fallback
      }
    });
    this.synthEngine.setVolume(targetVol);
    this.notify();
  }
}

export const audioManager = new AudioManager();

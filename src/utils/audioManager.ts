import { Howl } from 'howler';
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
      this.gainNode.gain.setValueAtTime(0.12, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(volume * 0.12, this.ctx.currentTime, 0.1);
    }
  }

  public playTheme(theme: string) {
    this.init();
    this.currentTheme = theme;
    if (this.isPlaying) return;
    this.isPlaying = true;
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
      
      // Warm sine / triangle mix
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      const noteDelay = idx * 0.08;
      const duration = 2.8;

      noteGain.gain.setValueAtTime(0, now + noteDelay);
      noteGain.gain.linearRampToValueAtTime(0.045, now + noteDelay + 0.35);
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
  }
}

class AudioManager {
  private currentHowl: Howl | null = null;
  private currentTrack: SongTrack | null = null;
  private isPlaying = false;
  private isMuted = false;
  private volume = 0.7;
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
    this.listeners.forEach(l => l());
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      currentTrack: this.currentTrack,
      usingSynth: this.usingSynth
    };
  }

  public async playTrack(track: SongTrack) {
    if (this.currentTrack?.title === track.title && this.isPlaying) {
      return;
    }

    const previousHowl = this.currentHowl;
    this.currentTrack = track;

    // Fade out previous track
    if (previousHowl) {
      previousHowl.fade(previousHowl.volume(), 0, 1000);
      setTimeout(() => {
        previousHowl.stop();
        previousHowl.unload();
      }, 1000);
    }
    this.synthEngine.stop();

    // Attempt to load howler track, fallback to synth on error or missing file
    try {
      const howl = new Howl({
        src: [track.audioUrl],
        html5: true,
        volume: 0,
        loop: true,
        onload: () => {
          this.usingSynth = false;
          if (this.isPlaying) {
            howl.play();
            howl.fade(0, this.isMuted ? 0 : this.volume, 1200);
          }
          this.notify();
        },
        onloaderror: () => {
          // Fallback to warm synth ambient
          this.usingSynth = true;
          if (this.isPlaying) {
            this.synthEngine.setVolume(this.isMuted ? 0 : this.volume);
            this.synthEngine.playTheme(track.synthTheme);
          }
          this.notify();
        }
      });

      this.currentHowl = howl;
      this.isPlaying = true;
      howl.play();
      this.notify();
    } catch {
      this.usingSynth = true;
      this.isPlaying = true;
      this.synthEngine.setVolume(this.isMuted ? 0 : this.volume);
      this.synthEngine.playTheme(track.synthTheme);
      this.notify();
    }
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
    if (this.currentHowl) {
      this.currentHowl.fade(this.currentHowl.volume(), 0, 600);
      setTimeout(() => {
        if (!this.isPlaying) {
          this.currentHowl?.pause();
        }
      }, 600);
    }
    this.synthEngine.stop();
    this.notify();
  }

  public resume() {
    this.isPlaying = true;
    if (this.usingSynth || !this.currentHowl) {
      if (this.currentTrack) {
        this.synthEngine.setVolume(this.isMuted ? 0 : this.volume);
        this.synthEngine.playTheme(this.currentTrack.synthTheme);
      }
    } else if (this.currentHowl) {
      this.currentHowl.play();
      this.currentHowl.fade(0, this.isMuted ? 0 : this.volume, 800);
    }
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.currentHowl) {
      this.currentHowl.mute(this.isMuted);
    }
    this.synthEngine.setVolume(this.isMuted ? 0 : this.volume);
    this.notify();
  }
}

export const audioManager = new AudioManager();

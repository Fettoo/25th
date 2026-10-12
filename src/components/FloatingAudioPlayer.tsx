import React, { useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Disc3 } from 'lucide-react';
import { audioManager } from '../utils/audioManager';
import { SongTrack } from '../types';

interface FloatingAudioPlayerProps {
  currentTrack: SongTrack;
}

export const FloatingAudioPlayer: React.FC<FloatingAudioPlayerProps> = ({ currentTrack }) => {
  const [audioState, setAudioState] = useState(audioManager.getState());

  useEffect(() => {
    const unsubscribe = audioManager.subscribe(() => {
      setAudioState(audioManager.getState());
    });
    return () => unsubscribe();
  }, []);

  const handleTogglePlay = () => {
    audioManager.togglePlay();
  };

  const handleToggleMute = () => {
    audioManager.toggleMute();
  };

  return (
    <header className="sticky top-3 z-40 px-4 mb-4">
      <div className="bg-cream-100/90 backdrop-blur-md border border-cream-200/80 rounded-2xl shadow-float px-3.5 py-2.5 flex items-center justify-between gap-3 transition-all duration-300">
        
        {/* Left: Spinning Disc & Track Info */}
        <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
          <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-cream-50 border border-cream-200 flex items-center justify-center text-rose-accent">
            <Disc3 
              size={18} 
              strokeWidth={1.5} 
              className={audioState.isPlaying && !audioState.isMuted ? "animate-spin" : ""}
              style={{ animationDuration: '4s' }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-rose-hover font-semibold">
                SOUNDTRACK
              </span>
              <span className="text-[10px] text-charcoal-subtle">•</span>
              <span className="text-[10px] text-charcoal-subtle font-mono truncate">
                {currentTrack.fileName}
              </span>
            </div>
            <p className="text-xs font-serif font-medium text-charcoal truncate">
              {currentTrack.title}
            </p>
          </div>
        </div>

        {/* Right: Controls & Equalizer */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Animated mini sound bars */}
          <div className="flex items-center gap-[2.5px] h-3.5 px-1.5">
            <span 
              className={`w-[2px] bg-rose-accent rounded-full transition-all duration-200 ${
                audioState.isPlaying && !audioState.isMuted ? 'h-3 animate-pulse' : 'h-1.5'
              }`} 
            />
            <span 
              className={`w-[2px] bg-rose-accent rounded-full transition-all duration-300 ${
                audioState.isPlaying && !audioState.isMuted ? 'h-4 animate-pulse delay-75' : 'h-2'
              }`} 
            />
            <span 
              className={`w-[2px] bg-rose-accent rounded-full transition-all duration-200 ${
                audioState.isPlaying && !audioState.isMuted ? 'h-2.5 animate-pulse delay-150' : 'h-1'
              }`} 
            />
          </div>

          {/* Mute button */}
          <button
            onClick={handleToggleMute}
            aria-label={audioState.isMuted ? "Unmute audio" : "Mute audio"}
            className="w-8 h-8 rounded-full bg-cream-50 hover:bg-cream-200/50 flex items-center justify-center text-charcoal border border-cream-200 transition-colors cursor-pointer"
          >
            {audioState.isMuted ? (
              <VolumeX size={15} strokeWidth={1.5} />
            ) : (
              <Volume2 size={15} strokeWidth={1.5} />
            )}
          </button>

          {/* Play / Pause button */}
          <button
            onClick={handleTogglePlay}
            aria-label={audioState.isPlaying ? "Pause music" : "Play music"}
            className="w-8 h-8 rounded-full bg-rose-accent hover:bg-rose-hover text-white flex items-center justify-center transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
          >
            {audioState.isPlaying ? (
              <Pause size={14} strokeWidth={2} />
            ) : (
              <Play size={14} strokeWidth={2} className="ml-0.5" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};

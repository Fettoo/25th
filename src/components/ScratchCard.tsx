import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Eye, MapPin, Calendar, Sparkles, Film, Camera, Volume2, VolumeX, Maximize2, Play } from 'lucide-react';
import { MemoryPhoto } from '../types';

interface ScratchCardProps {
  photo: MemoryPhoto;
  cardIndex: number;
  onPhotoCleared?: (id: string) => void;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({
  photo,
  cardIndex,
  onPhotoCleared,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isCleared, setIsCleared] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [isScratching, setIsScratching] = useState(false);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastCheckTimeRef = useRef<number>(0);

  // Check if media is video
  const isVideo = photo.mediaType === 'video' ||
    Boolean(photo.imageUrl && photo.imageUrl.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) ||
    Boolean(photo.imageUrl && photo.imageUrl.startsWith('data:video/'));

  // Autoplay video helper
  const startVideoPlayback = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.muted = true; // Muted is mandatory for mobile browser autoplay
    setIsVideoMuted(true);
    
    const playPromise = videoRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsVideoPlaying(true))
        .catch(() => {
          // If prevented, retry muted
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play()
              .then(() => setIsVideoPlaying(true))
              .catch(() => setIsVideoPlaying(false));
          }
        });
    }
  }, []);

  // Initialize canvas overlay
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // Muted Bronze / Soft Gold background
    ctx.fillStyle = '#C8B29B';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Add subtle luxury speckled / brush texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * rect.width;
      const ry = Math.random() * rect.height;
      const rSize = Math.random() * 2 + 1;
      ctx.fillRect(rx, ry, rSize, rSize);
    }

    // Editorial text on overlay
    ctx.fillStyle = '#2D2926';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '0.2em';
    ctx.fillText('SCRATCH TO UNCOVER', rect.width / 2, rect.height / 2 - 12);

    ctx.fillStyle = 'rgba(45, 41, 38, 0.6)';
    ctx.font = '400 11px "Cormorant Garamond", serif';
    ctx.fillText(`${isVideo ? 'VIDEO' : 'FOTO'} MEMORI #${cardIndex + 1}`, rect.width / 2, rect.height / 2 + 10);

    // Subtle decorative border inside canvas
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 12, rect.width - 24, rect.height - 24);
  }, [cardIndex, isVideo]);

  useEffect(() => {
    if (!isCleared) {
      initCanvas();
    }
  }, [initCanvas, isCleared]);

  // Autoplay video immediately when card is cleared
  useEffect(() => {
    if (isCleared && isVideo) {
      startVideoPlayback();
    }
  }, [isCleared, isVideo, startVideoPlayback]);

  // Calculate scratched area percentage (> 50% triggers auto-clear)
  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas || isCleared) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Sample a 20x20 grid for high performance
    const stepX = Math.floor(width / 20);
    const stepY = Math.floor(height / 20);
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let transparentPixels = 0;
    let totalSamples = 0;

    for (let y = stepY / 2; y < height; y += stepY) {
      for (let x = stepX / 2; x < width; x += stepX) {
        const index = (Math.floor(y) * width + Math.floor(x)) * 4;
        const alpha = data[index + 3];
        if (alpha < 64) {
          transparentPixels++;
        }
        totalSamples++;
      }
    }

    const percent = Math.round((transparentPixels / totalSamples) * 100);
    setScratchPercent(percent);

    if (percent >= 50 && !isCleared) {
      setIsCleared(true);
      onPhotoCleared?.(photo.id);
      if (isVideo) {
        startVideoPlayback();
      }
    }
  };

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isCleared) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const x = (clientX - rect.left) * dpr;
    const y = (clientY - rect.top) * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 42 * dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (lastPosRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 22 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }

    lastPosRef.current = { x, y };
  };

  // Touch & Pointer event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isCleared) return;
    setIsScratching(true);
    lastPosRef.current = null;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isScratching || isCleared) return;
    scratch(e.clientX, e.clientY);
    
    // Throttle heavy getImageData calculation to once every 220ms
    const now = Date.now();
    if (now - lastCheckTimeRef.current > 220) {
      lastCheckTimeRef.current = now;
      checkScratchPercentage();
    }
  };

  const handlePointerUp = () => {
    setIsScratching(false);
    lastPosRef.current = null;
    checkScratchPercentage();
  };

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play()
        .then(() => setIsVideoPlaying(true))
        .catch(() => {});
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const toggleVideoMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isVideoMuted;
    videoRef.current.muted = nextMuted;
    setIsVideoMuted(nextMuted);
  };

  return (
    <>
      <div className="bg-cream-100 rounded-card p-4 border border-cream-200/80 shadow-soft transition-all duration-300">
        
        {/* Card Header Tag */}
        <div className="flex items-center justify-between mb-3 text-charcoal-muted">
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <Calendar size={13} strokeWidth={1.5} className="text-rose-accent" />
            <span>{photo.date}</span>
          </div>

          <div className="flex items-center gap-2">
            {photo.location && (
              <div className="flex items-center gap-1 text-[11px] text-charcoal-subtle">
                <MapPin size={12} strokeWidth={1.5} />
                <span>{photo.location}</span>
              </div>
            )}
            
            <span className="flex items-center gap-1 text-[10px] font-mono uppercase bg-cream-50 px-2 py-0.5 rounded-md border border-cream-200/60 text-charcoal-subtle">
              {isVideo ? <Film size={11} strokeWidth={1.5} /> : <Camera size={11} strokeWidth={1.5} />}
              <span>{isVideo ? 'VIDEO' : 'FOTO'}</span>
            </span>
          </div>
        </div>

        {/* Scratch Area Container - Auto Adjusts to box template */}
        <div
          ref={containerRef}
          className="relative w-full aspect-[4/3] rounded-inner overflow-hidden bg-cream-50 select-none shadow-inner flex items-center justify-center"
        >
          {/* Ambient blurred backdrop for seamless auto-adjust if aspect differs */}
          {!isVideo && (
            <div 
              className="absolute inset-0 bg-cover bg-center filter blur-md opacity-25 scale-110 pointer-events-none"
              style={{ backgroundImage: `url(${photo.imageUrl})` }}
            />
          )}

          {/* Media Element: Photo Image or Video Clip */}
          {isVideo ? (
            <div 
              className="relative w-full h-full flex items-center justify-center cursor-pointer"
              onClick={isCleared ? toggleVideoPlay : undefined}
            >
              <video
                ref={videoRef}
                src={photo.imageUrl}
                muted={isVideoMuted}
                playsInline
                loop
                autoPlay={isCleared}
                preload="auto"
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                className={`w-full h-full select-none transition-all duration-300 ${
                  fitMode === 'cover' ? 'object-cover' : 'object-contain'
                }`}
              />

              {/* Video Paused Indicator Overlay when cleared */}
              {isCleared && !isVideoPlaying && (
                <div className="absolute inset-0 bg-charcoal/20 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-cream-50/90 text-charcoal flex items-center justify-center shadow-md">
                    <Play size={16} strokeWidth={2} className="ml-0.5" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <img
              src={photo.imageUrl}
              alt={photo.title}
              loading="lazy"
              className={`relative z-0 w-full h-full select-none transition-transform duration-700 hover:scale-105 ${
                fitMode === 'cover' ? 'object-cover' : 'object-contain'
              }`}
            />
          )}

          {/* Canvas Scratch Overlay */}
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`scratch-canvas absolute inset-0 w-full h-full cursor-crosshair z-10 transition-opacity duration-700 ease-out ${
              isCleared ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          />

          {/* Scratch progress indicator */}
          {!isCleared && scratchPercent > 5 && (
            <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-full bg-charcoal/70 text-white text-[9px] font-mono tracking-wider backdrop-blur-xs pointer-events-none transition-all">
              {scratchPercent}%
            </div>
          )}

          {/* Controls when cleared */}
          {isCleared && (
            <div className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1.5">
              {/* Fit Mode Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFitMode(prev => prev === 'cover' ? 'contain' : 'cover');
                }}
                aria-label="Ubah mode proporsi kotak"
                title="Sesuaikan ukuran kotak"
                className="px-2 py-1 rounded-full bg-cream-50/90 hover:bg-cream-100 text-charcoal text-[10px] font-medium flex items-center gap-1 shadow-sm backdrop-blur-xs transition-colors cursor-pointer"
              >
                <Maximize2 size={11} strokeWidth={1.5} />
                <span>{fitMode === 'cover' ? 'PAS KOTAK' : 'UTUH'}</span>
              </button>

              {/* Video Audio Unmute Toggle */}
              {isVideo && (
                <button
                  onClick={toggleVideoMute}
                  aria-label={isVideoMuted ? "Aktifkan suara video" : "Bisukan suara video"}
                  className="p-1 rounded-full bg-cream-50/90 hover:bg-cream-100 text-charcoal shadow-sm backdrop-blur-xs transition-colors cursor-pointer"
                >
                  {isVideoMuted ? <VolumeX size={13} strokeWidth={1.5} /> : <Volume2 size={13} strokeWidth={1.5} />}
                </button>
              )}

              {/* Expand Full View Modal Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullViewOpen(true);
                }}
                aria-label="Lihat media penuh"
                className="px-2.5 py-1 rounded-full bg-cream-50/90 hover:bg-cream-100 text-charcoal text-[10px] font-medium tracking-wide flex items-center gap-1 shadow-sm backdrop-blur-xs transition-colors cursor-pointer"
              >
                <Eye size={12} strokeWidth={1.5} />
                <span>LIHAT</span>
              </button>
            </div>
          )}
        </div>

        {/* Caption & Metadata */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-medium text-charcoal">
              {photo.title}
            </h2>
            {isCleared && (
              <span className="text-[10px] uppercase tracking-widest text-rose-hover font-semibold flex items-center gap-1">
                <Sparkles size={11} strokeWidth={1.5} />
                TERBUKA
              </span>
            )}
          </div>
          <p className="text-xs text-charcoal-muted mt-1 leading-relaxed font-normal">
            {photo.caption}
          </p>
        </div>
      </div>

      {/* Full Media Modal */}
      {isFullViewOpen && (
        <div 
          className="fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsFullViewOpen(false)}
        >
          <div 
            className="bg-cream-50 rounded-card p-4 max-w-[460px] w-full max-h-[92dvh] overflow-y-auto shadow-float text-charcoal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-inner overflow-hidden mb-3 bg-charcoal/5 flex items-center justify-center">
              {isVideo ? (
                <video
                  src={photo.imageUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[65dvh] object-contain rounded-inner"
                />
              ) : (
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full max-h-[65dvh] object-contain"
                />
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs text-charcoal-muted mb-1 font-mono">
              <span>{photo.date}</span>
              <div className="flex items-center gap-2">
                {photo.location && <span>{photo.location}</span>}
                <span className="uppercase text-[10px] bg-cream-200/60 px-1.5 py-0.5 rounded">
                  {isVideo ? 'VIDEO' : 'FOTO'}
                </span>
              </div>
            </div>

            <h3 className="font-serif text-xl font-medium text-charcoal">{photo.title}</h3>
            <p className="text-xs text-charcoal-muted mt-1.5 leading-relaxed">{photo.caption}</p>

            <button
              onClick={() => setIsFullViewOpen(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-cream-200/60 hover:bg-cream-200 text-charcoal text-xs font-medium tracking-wider uppercase transition-colors cursor-pointer"
            >
              TUTUP
            </button>
          </div>
        </div>
      )}
    </>
  );
};

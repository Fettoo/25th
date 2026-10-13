import React from 'react';
import { MemoryPhoto } from '../types';
import { ScratchCard } from './ScratchCard';
import { Sparkles } from 'lucide-react';

interface ScratchGalleryProps {
  photos: MemoryPhoto[];
  year: number;
}

export const ScratchGallery: React.FC<ScratchGalleryProps> = ({ photos, year }) => {
  return (
    <section className="px-4 mb-6" aria-label={`Galeri Kenangan Tahun ${year}`}>
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-rose-hover font-semibold block">
            GALERI KENANGAN
          </span>
          <h2 className="font-serif text-lg font-medium text-charcoal">
            Foto Tersembunyi
          </h2>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-charcoal-muted font-mono bg-cream-100 px-2.5 py-1 rounded-full border border-cream-200">
          <Sparkles size={11} strokeWidth={1.5} className="text-rose-accent" />
          <span>{photos.length} FOTO</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {photos.map((photo, idx) => (
          <ScratchCard
            key={photo.id}
            photo={photo}
            cardIndex={idx}
          />
        ))}
      </div>
    </section>
  );
};


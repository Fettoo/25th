import React, { useState } from 'react';
import { Quote, ChevronDown, ChevronUp, Feather } from 'lucide-react';
import { YearlyWish } from '../types';

interface WishCardProps {
  wish: YearlyWish;
  year: number;
}

export const WishCard: React.FC<WishCardProps> = ({ wish, year }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="px-4 mb-6" aria-label={`Pesan dan Doa Tahun ${year}`}>
      <div className="bg-cream-100 rounded-card p-5 border border-cream-200/90 shadow-soft relative overflow-hidden">
        
        {/* Subtle decorative background quote glyph */}
        <div className="absolute -top-3 -right-2 text-cream-200/50 pointer-events-none select-none">
          <Quote size={80} strokeWidth={1} />
        </div>

        {/* Header Tag */}
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-1.5 text-rose-hover">
            <Feather size={14} strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">
              SURAT KENANGAN
            </span>
          </div>
          <span className="text-[10px] text-charcoal-subtle font-mono">
            {wish.authorNote}
          </span>
        </div>

        {/* Theme Title */}
        <h2 className="font-serif text-xl sm:text-2xl font-medium text-charcoal mb-3 relative z-10 leading-snug">
          {wish.themeTitle}
        </h2>

        {/* Short Wish (Always fully displayed) */}
        <div className="relative z-10 p-3.5 rounded-inner bg-cream-50/70 border border-cream-200/60 mb-3.5">
          <p className="text-xs sm:text-sm font-serif italic text-charcoal leading-relaxed">
            "{wish.shortWish}"
          </p>
        </div>

        {/* Long Wish (Accordion Expandable) */}
        <div className="relative z-10 text-xs text-charcoal-muted leading-relaxed font-normal">
          <div 
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-16 opacity-80'
            }`}
          >
            <p className="whitespace-pre-line">
              {wish.longWish}
            </p>
          </div>

          {/* Expand/Collapse Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase text-rose-hover hover:text-charcoal transition-colors cursor-pointer py-1"
          >
            <span>{isExpanded ? '[ RINGKAS TULISAN ]' : '[ BACA SELENGKAPNYA ]'}</span>
            {isExpanded ? (
              <ChevronUp size={13} strokeWidth={1.5} />
            ) : (
              <ChevronDown size={13} strokeWidth={1.5} />
            )}
          </button>
        </div>

      </div>
    </section>
  );
};

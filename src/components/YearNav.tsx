import React, { useRef, useEffect } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { YearData } from '../types';

interface YearNavProps {
  years: YearData[];
  selectedYear: number;
  unlockedYears: number[];
  onSelectYear: (year: number) => void;
  onLockedClick: (year: number) => void;
}

export const YearNav: React.FC<YearNavProps> = ({
  years,
  selectedYear,
  unlockedYears,
  onSelectYear,
  onLockedClick,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-center the active year tab
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector(`[data-year="${selectedYear}"]`) as HTMLElement;
      if (activeEl) {
        const containerWidth = scrollRef.current.offsetWidth;
        const targetLeft = activeEl.offsetLeft - containerWidth / 2 + activeEl.offsetWidth / 2;
        scrollRef.current.scrollTo({
          left: Math.max(0, targetLeft),
          behavior: 'smooth',
        });
      }
    }
  }, [selectedYear]);

  return (
    <nav className="px-4 mb-5" aria-label="Navigasi Tahun Kenangan">
      <div 
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth"
      >
        {years.map((item) => {
          const isUnlocked = unlockedYears.includes(item.year);
          const isSelected = selectedYear === item.year;
          const isFinale = item.year === 2026;

          return (
            <button
              key={item.year}
              data-year={item.year}
              onClick={() => {
                if (isUnlocked) {
                  onSelectYear(item.year);
                } else {
                  onLockedClick(item.year);
                }
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-medium transition-all duration-300 flex items-center gap-1.5 cursor-pointer border ${
                isSelected
                  ? 'bg-rose-accent text-white border-rose-accent shadow-soft scale-105'
                  : isUnlocked
                  ? 'bg-cream-100/90 text-charcoal border-cream-200/80 hover:bg-cream-200/60'
                  : 'bg-cream-100/40 text-charcoal-subtle border-dashed border-cream-200/60'
              }`}
            >
              {isFinale && (
                <Sparkles size={13} strokeWidth={1.5} className={isSelected ? 'text-white' : 'text-rose-hover'} />
              )}
              
              <span className="font-mono tracking-tight">{item.year}</span>

              {!isUnlocked && (
                <Lock size={12} strokeWidth={1.5} className="text-charcoal-subtle/70 ml-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};


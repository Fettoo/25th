import React from 'react';
import { Lock, ArrowLeft, KeyRound } from 'lucide-react';

interface LockedYearCardProps {
  lockedYear: number;
  previousYear: number;
  onReturnToYear: (year: number) => void;
}

export const LockedYearCard: React.FC<LockedYearCardProps> = ({
  lockedYear,
  previousYear,
  onReturnToYear,
}) => {
  return (
    <div className="px-4 py-8">
      <div className="bg-cream-100 rounded-card p-6 border border-cream-200/90 shadow-soft text-center flex flex-col items-center">
        
        <div className="w-14 h-14 rounded-full bg-cream-50 border border-cream-200 flex items-center justify-center text-charcoal-muted mb-4 shadow-card">
          <Lock size={22} strokeWidth={1.5} />
        </div>

        <span className="text-[10px] uppercase tracking-[0.25em] text-rose-hover font-semibold mb-1">
          BABAK TERKUNCI
        </span>

        <h3 className="font-serif text-xl sm:text-2xl font-medium text-charcoal mb-2">
          SABAR YA, TAHUN {lockedYear} AKAN SEGERA TERBUKA
        </h3>

        <div className="w-10 h-[1px] bg-cream-200 my-2" />

        <p className="text-xs text-charcoal-muted max-w-[300px] leading-relaxed mb-6 font-normal">
          Setiap babak kenangan memiliki urutannya sendiri. Selesaikan tantangan dan mini-game di babak tahun {previousYear} terlebih dahulu untuk membuka kunci babak ini.
        </p>

        <button
          onClick={() => onReturnToYear(previousYear)}
          className="w-full py-3 px-5 rounded-xl bg-rose-accent hover:bg-rose-hover text-white text-xs font-medium tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          <span>KEMBALI KE TAHUN {previousYear}</span>
        </button>

        <div className="flex items-center gap-1.5 text-[11px] text-charcoal-subtle font-mono mt-4">
          <KeyRound size={12} strokeWidth={1.5} />
          <span>Tantangan tahun {previousYear} siap dikerjakan</span>
        </div>

      </div>
    </div>
  );
};

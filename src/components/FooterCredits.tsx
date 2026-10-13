import React from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';

interface FooterCreditsProps {
  onResetProgress: () => void;
  unlockedCount: number;
  totalYears: number;
}

export const FooterCredits: React.FC<FooterCreditsProps> = ({
  onResetProgress,
  unlockedCount,
  totalYears,
}) => {
  return (
    <footer className="mt-8 mb-12 px-6 text-center text-charcoal-muted">
      <div className="w-12 h-[1px] bg-cream-200 mx-auto mb-6" />

      <div className="flex items-center justify-center gap-1.5 text-rose-hover mb-2">
        <Sparkles size={13} strokeWidth={1.5} />
        <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">
          SOPHIE GRISELLA OLIVIA 25TH JOURNAL
        </span>
      </div>

      <p className="text-xs font-serif italic text-charcoal">
        "Tiap detik yang berlalu adalah kenangan yang abadi."
      </p>

      <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-charcoal-subtle mt-4">
        <span>PROGRES: {unlockedCount} DARI {totalYears} TAHUN</span>
        <span>•</span>
        <button
          onClick={onResetProgress}
          className="text-rose-hover hover:underline inline-flex items-center gap-1 cursor-pointer"
          title="Reset progres untuk mengulang dari awal"
        >
          <RotateCcw size={11} strokeWidth={1.5} />
          <span>RESET PROGRES</span>
        </button>
      </div>
    </footer>
  );
};

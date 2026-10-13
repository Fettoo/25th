import React from 'react';
import { RotateCcw, Sparkles, Sliders } from 'lucide-react';

interface FooterCreditsProps {
  onResetProgress: () => void;
  onOpenStudio?: () => void;
  unlockedCount: number;
  totalYears: number;
}

export const FooterCredits: React.FC<FooterCreditsProps> = ({
  onResetProgress,
  onOpenStudio,
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

      {/* Studio Dashboard Entry Button */}
      {onOpenStudio && (
        <div className="mt-4 pt-3 border-t border-cream-200/50 flex justify-center">
          <button
            onClick={onOpenStudio}
            className="px-3.5 py-1.5 rounded-full bg-cream-100 hover:bg-cream-200/70 border border-cream-200 text-charcoal text-[11px] font-medium tracking-wide flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Sliders size={12} strokeWidth={1.5} className="text-rose-hover" />
            <span>STUDIO PENGATURAN KENANGAN</span>
          </button>
        </div>
      )}

      <p className="text-[10px] text-charcoal-subtle/70 mt-3 font-mono">
        DIRANCANG UNTUK PWA & GITHUB PAGES • MOBILE-FIRST
      </p>
    </footer>
  );
};

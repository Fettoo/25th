import React from 'react';
import { Sparkles, ArrowRight, BookOpen, Music, HeartHandshake } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-dvh flex flex-col justify-between px-6 py-12 max-w-[480px] mx-auto text-charcoal bg-cream-50 paper-grain">
      {/* Top Header Tag */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] tracking-[0.25em] uppercase text-charcoal-muted font-medium border-b border-cream-200 pb-1">
          EDISI ULANG TAHUN KE-25
        </span>
        <div className="flex items-center gap-1.5 text-rose-accent">
          <Sparkles size={16} strokeWidth={1.5} />
          <span className="text-[11px] tracking-widest uppercase font-semibold">2018 — 2026</span>
        </div>
      </div>

      {/* Main Hero Section */}
      <div className="my-auto py-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-cream-100 border border-cream-200 flex items-center justify-center mb-6 shadow-soft">
          <BookOpen size={24} strokeWidth={1.5} className="text-charcoal" />
        </div>

        <p className="text-xs uppercase tracking-[0.3em] text-charcoal-muted mb-3 font-medium">
          YEARLY JOURNAL & MEMORIES
        </p>

        <h1 className="font-serif text-3xl sm:text-4xl leading-tight font-medium text-charcoal tracking-normal mb-4">
          Sophie Grisella Olivia
          <span className="block italic text-2xl sm:text-3xl font-normal text-rose-hover mt-1">
            25th Chronicle
          </span>
        </h1>

        <div className="w-12 h-[1px] bg-bronze-overlay/60 my-4" />

        <p className="text-sm text-charcoal-muted leading-relaxed max-w-[340px] font-normal">
          Sebuah rekap perjalanan waktu, foto tersembunyi yang menunggu untuk digosok, harmoni musik di setiap tahun, dan surat kasih di setiap persimpangan cerita.
        </p>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-[320px] text-left">
          <div className="p-3.5 rounded-2xl bg-cream-100/70 border border-cream-200/60 shadow-card">
            <Music size={16} strokeWidth={1.5} className="text-charcoal mb-2" />
            <p className="text-[11px] font-semibold tracking-wide text-charcoal">Soundtrack Tahunan</p>
            <p className="text-[10px] text-charcoal-muted mt-0.5">Lagu berbeda di setiap babak</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-cream-100/70 border border-cream-200/60 shadow-card">
            <HeartHandshake size={16} strokeWidth={1.5} className="text-charcoal mb-2" />
            <p className="text-[11px] font-semibold tracking-wide text-charcoal">Scratch & Mini-Game</p>
            <p className="text-[10px] text-charcoal-muted mt-0.5">Buka babak dengan kenangan</p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="w-full flex flex-col items-center pt-4">
        <button
          onClick={onStart}
          className="w-full py-4 px-6 rounded-card bg-rose-accent hover:bg-rose-hover active:scale-[0.98] transition-all duration-300 text-white font-medium text-sm tracking-wider uppercase shadow-float flex items-center justify-center gap-3 cursor-pointer"
        >
          <span>MULAI PERJALANAN</span>
          <ArrowRight size={16} strokeWidth={1.5} />
        </button>

        <p className="text-[11px] text-charcoal-subtle mt-4 text-center tracking-wide">
          Sentuh tombol untuk memutar soundtrack otomatis & membuka jurnal
        </p>
      </div>
    </div>
  );
};


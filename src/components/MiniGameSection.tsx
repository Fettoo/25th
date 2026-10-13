import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  CheckCircle2, 
  RotateCcw, 
  Unlock, 
  ArrowRight, 
  CloudSun, 
  Coffee, 
  Music, 
  Utensils, 
  Lamp, 
  BookOpen, 
  HelpCircle,
  KeyRound,
  Sparkles,
  Heart,
  Camera,
  Star,
  Gift,
  Sun,
  Moon,
  Film,
  MapPin,
  Compass
} from 'lucide-react';
import { YearMiniGame, QuizQuestion, MemoryCardItem } from '../types';

interface MiniGameSectionProps {
  miniGame: YearMiniGame;
  currentYear: number;
  nextYear?: number;
  isNextYearUnlocked: boolean;
  onUnlockNextYear: () => void;
  onGoToNextYear?: () => void;
}

export const MiniGameSection: React.FC<MiniGameSectionProps> = ({
  miniGame,
  currentYear,
  nextYear,
  isNextYearUnlocked,
  onUnlockNextYear,
  onGoToNextYear,
}) => {
  const [completed, setCompleted] = useState(false);

  // Sync completion if next year is already unlocked
  useEffect(() => {
    if (isNextYearUnlocked) {
      setCompleted(true);
    } else {
      setCompleted(false);
    }
  }, [isNextYearUnlocked, currentYear]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#D8A7B1', '#C8B29B', '#F7EBE1', '#EADBCE'],
      disableForReducedMotion: true,
    });
  };

  const handleGameSuccess = () => {
    setCompleted(true);
    triggerConfetti();
    onUnlockNextYear();
  };

  return (
    <section className="px-4 mb-8" aria-label={`Tantangan Kunci Tahun ${currentYear}`}>
      <div className="bg-cream-100 rounded-card p-5 border border-cream-200/90 shadow-soft">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-[0.25em] text-rose-hover font-semibold">
            {miniGame.badgeLabel}
          </span>
          {completed ? (
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 size={12} strokeWidth={1.5} />
              <span>TERSELESAIKAN</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-mono text-charcoal-muted bg-cream-50 px-2 py-0.5 rounded-full border border-cream-200">
              <KeyRound size={11} strokeWidth={1.5} />
              <span>KUNCI BABAK</span>
            </span>
          )}
        </div>

        <h3 className="font-serif text-xl font-medium text-charcoal mb-1">
          {miniGame.title}
        </h3>
        
        <p className="text-xs text-charcoal-muted mb-4 leading-relaxed font-normal">
          {miniGame.instructions}
        </p>

        {/* Mini Game Sub-Components */}
        {miniGame.type === 'quiz' && miniGame.quizData && (
          <QuizGame
            questions={miniGame.quizData}
            onComplete={handleGameSuccess}
            isAlreadyCompleted={completed}
          />
        )}

        {miniGame.type === 'memory-match' && miniGame.matchData && (
          <MemoryMatchGame
            items={miniGame.matchData}
            onComplete={handleGameSuccess}
            isAlreadyCompleted={completed}
          />
        )}

        {miniGame.type === 'word-unscramble' && miniGame.wordData && (
          <WordUnscrambleGame
            wordData={miniGame.wordData}
            onComplete={handleGameSuccess}
            isAlreadyCompleted={completed}
          />
        )}

        {miniGame.type === 'cipher-code' && miniGame.cipherData && (
          <CipherCodeGame
            cipherData={miniGame.cipherData}
            onComplete={handleGameSuccess}
            isAlreadyCompleted={completed}
          />
        )}

        {miniGame.type === 'final-celebration' && miniGame.finalData && (
          <FinalCelebrationSection
            finalData={miniGame.finalData}
            onComplete={handleGameSuccess}
          />
        )}

        {/* Unlocked Next Year Banner & Navigation */}
        {completed && nextYear && (
          <div className="mt-5 p-4 rounded-2xl bg-cream-50 border border-cream-200 flex flex-col gap-2.5 shadow-sm transition-all duration-300">
            <div className="flex items-center gap-2 text-rose-hover">
              <Unlock size={16} strokeWidth={1.5} />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Babak Tahun {nextYear} Berhasil Terbuka
              </span>
            </div>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Selamat, kamu telah menyelesaikan tantangan tahun {currentYear}. Pintu kenangan tahun {nextYear} kini telah dapat kamu jelajahi.
            </p>
            {onGoToNextYear && (
              <button
                onClick={onGoToNextYear}
                className="mt-1 w-full py-2.5 px-4 rounded-xl bg-rose-accent hover:bg-rose-hover text-white text-xs font-medium tracking-wider uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>BUKA TAHUN {nextYear}</span>
                <ArrowRight size={14} strokeWidth={1.5} />
              </button>
            )}
          </div>
        )}

      </div>
    </section>
  );
};

/* -------------------------------------------------------------
   1. QUIZ MINI GAME
-------------------------------------------------------------- */
interface QuizGameProps {
  questions: QuizQuestion[];
  onComplete: () => void;
  isAlreadyCompleted: boolean;
}

const QuizGame: React.FC<QuizGameProps> = ({ questions, onComplete, isAlreadyCompleted }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const q = questions[currentIdx];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === q.correctIndex) {
      setFeedback('Jawaban tepat!');
      setTimeout(() => {
        if (currentIdx + 1 < questions.length) {
          setCurrentIdx(currentIdx + 1);
          setSelectedOption(null);
          setIsAnswered(false);
          setFeedback(null);
        } else {
          onComplete();
        }
      }, 900);
    } else {
      setFeedback(`Kurang tepat. Petunjuk: ${q.hint}`);
    }
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setFeedback(null);
  };

  if (isAlreadyCompleted) {
    return (
      <div className="p-3 rounded-inner bg-cream-50/60 border border-cream-200/80 text-center">
        <p className="text-xs text-charcoal-muted font-mono">
          Semua pertanyaan kuis telah dijawab dengan benar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 rounded-inner p-4 border border-cream-200/80">
      <div className="flex items-center justify-between text-[11px] font-mono text-charcoal-subtle mb-2">
        <span>PERTANYAAN {currentIdx + 1} DARI {questions.length}</span>
      </div>

      <p className="text-xs sm:text-sm font-medium text-charcoal mb-3">
        {q.question}
      </p>

      <div className="flex flex-col gap-2">
        {q.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = isAnswered && idx === q.correctIndex;
          const isWrong = isAnswered && isSelected && idx !== q.correctIndex;

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={isAnswered}
              className={`p-2.5 rounded-xl text-left text-xs transition-all border cursor-pointer ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                  : isWrong
                  ? 'bg-rose-soft border-rose-300 text-rose-900'
                  : 'bg-white border-cream-200 hover:border-rose-accent/50 text-charcoal'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[11px] text-charcoal-muted">{feedback}</p>
          {selectedOption !== q.correctIndex && (
            <button
              onClick={handleRetry}
              className="text-[11px] text-rose-hover hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <RotateCcw size={12} strokeWidth={1.5} />
              <span>COBA LAGI</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------
   2. MEMORY MATCH MINI GAME
-------------------------------------------------------------- */
interface MemoryMatchGameProps {
  items: MemoryCardItem[];
  onComplete: () => void;
  isAlreadyCompleted: boolean;
}

interface CardItem {
  uid: number;
  id: number;
  label: string;
  iconName: string;
}

const renderIcon = (name: string) => {
  switch (name) {
    case 'CloudSun': return <CloudSun size={18} strokeWidth={1.5} />;
    case 'Coffee': return <Coffee size={18} strokeWidth={1.5} />;
    case 'Music': return <Music size={18} strokeWidth={1.5} />;
    case 'Utensils': return <Utensils size={18} strokeWidth={1.5} />;
    case 'Lamp': return <Lamp size={18} strokeWidth={1.5} />;
    case 'BookOpen': return <BookOpen size={18} strokeWidth={1.5} />;
    case 'Heart': return <Heart size={18} strokeWidth={1.5} />;
    case 'Camera': return <Camera size={18} strokeWidth={1.5} />;
    case 'Star': return <Star size={18} strokeWidth={1.5} />;
    case 'Gift': return <Gift size={18} strokeWidth={1.5} />;
    case 'Sun': return <Sun size={18} strokeWidth={1.5} />;
    case 'Moon': return <Moon size={18} strokeWidth={1.5} />;
    case 'Film': return <Film size={18} strokeWidth={1.5} />;
    case 'MapPin': return <MapPin size={18} strokeWidth={1.5} />;
    case 'Compass': return <Compass size={18} strokeWidth={1.5} />;
    default: return <Sparkles size={18} strokeWidth={1.5} />;
  }
};

const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({ items, onComplete, isAlreadyCompleted }) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);

  useEffect(() => {
    // Generate pairs
    const pairs: CardItem[] = [];
    items.forEach((item, index) => {
      pairs.push({ uid: index * 2, id: item.id, label: item.label, iconName: item.iconName });
      pairs.push({ uid: index * 2 + 1, id: item.id, label: item.label, iconName: item.iconName });
    });
    // Shuffle
    setCards(pairs.sort(() => Math.random() - 0.5));
  }, [items]);

  const handleCardClick = (uid: number) => {
    if (flipped.length === 2 || flipped.includes(uid) || matched.includes(uid)) return;

    const newFlipped = [...flipped, uid];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const first = cards.find(c => c.uid === newFlipped[0]);
      const second = cards.find(c => c.uid === newFlipped[1]);

      if (first && second && first.id === second.id) {
        const nextMatched = [...matched, first.uid, second.uid];
        setMatched(nextMatched);
        setFlipped([]);
        if (nextMatched.length === cards.length) {
          onComplete();
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 900);
      }
    }
  };

  if (isAlreadyCompleted) {
    return (
      <div className="p-3 rounded-inner bg-cream-50/60 border border-cream-200/80 text-center">
        <p className="text-xs text-charcoal-muted font-mono">
          Semua pasangan memori telah berhasil dicocokkan.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 rounded-inner p-4 border border-cream-200/80">
      <div className={`grid ${cards.length <= 6 ? 'grid-cols-3' : 'grid-cols-4'} gap-2 sm:gap-2.5`}>
        {cards.map((c) => {
          const isCardFlipped = flipped.includes(c.uid) || matched.includes(c.uid);
          const isCardMatched = matched.includes(c.uid);

          return (
            <button
              key={c.uid}
              onClick={() => handleCardClick(c.uid)}
              className={`aspect-square rounded-xl p-2 flex flex-col items-center justify-center transition-all duration-300 border cursor-pointer ${
                isCardMatched
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : isCardFlipped
                  ? 'bg-white border-rose-accent text-rose-hover shadow-sm'
                  : 'bg-cream-100 hover:bg-cream-200/60 border-cream-200 text-charcoal-subtle'
              }`}
            >
              {isCardFlipped ? (
                <>
                  {renderIcon(c.iconName)}
                  <span className="text-[9px] mt-1 font-medium truncate max-w-full">
                    {c.label}
                  </span>
                </>
              ) : (
                <HelpCircle size={18} strokeWidth={1.5} />
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-charcoal-subtle text-center mt-3 font-mono">
        Cocokkan {items.length} pasang simbol kenangan
      </p>
    </div>
  );
};

/* -------------------------------------------------------------
   3. WORD UNSCRAMBLE MINI GAME
-------------------------------------------------------------- */
interface WordUnscrambleGameProps {
  wordData: {
    letters: string[];
    answer: string;
    hint: string;
  };
  onComplete: () => void;
  isAlreadyCompleted: boolean;
}

const WordUnscrambleGame: React.FC<WordUnscrambleGameProps> = ({
  wordData,
  onComplete,
  isAlreadyCompleted,
}) => {
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);
  const [availableLetters, setAvailableLetters] = useState<{ id: number; char: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState(false);

  useEffect(() => {
    // Shuffle initial letters
    const pool = wordData.letters.map((char, index) => ({ id: index, char }));
    setAvailableLetters(pool.sort(() => Math.random() - 0.5));
  }, [wordData]);

  const currentWord = selectedLetters
    .map(id => availableLetters.find(l => l.id === id)?.char)
    .join('');

  const handleTileClick = (id: number) => {
    if (selectedLetters.includes(id)) return;
    const nextSelected = [...selectedLetters, id];
    setSelectedLetters(nextSelected);

    const formedWord = nextSelected
      .map(tid => availableLetters.find(l => l.id === tid)?.char)
      .join('');

    if (formedWord.length === wordData.answer.length) {
      if (formedWord === wordData.answer) {
        onComplete();
      } else {
        setErrorMsg(true);
      }
    }
  };

  const handleClear = () => {
    setSelectedLetters([]);
    setErrorMsg(false);
  };

  if (isAlreadyCompleted) {
    return (
      <div className="p-3 rounded-inner bg-cream-50/60 border border-cream-200/80 text-center">
        <p className="text-xs text-charcoal-muted font-mono">
          Kata rahasia telah terangkai: "{wordData.answer}"
        </p>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 rounded-inner p-4 border border-cream-200/80">
      <p className="text-[11px] text-charcoal-muted mb-2 font-mono">
        Petunjuk: {wordData.hint}
      </p>

      {/* Answer Slots */}
      <div className="min-h-10 p-2.5 rounded-xl bg-white border border-cream-200 flex items-center justify-center gap-1.5 mb-3 tracking-widest font-mono text-sm font-semibold text-charcoal">
        {currentWord || <span className="text-charcoal-subtle text-xs font-normal">Pilih huruf di bawah...</span>}
      </div>

      {/* Available Letter Tiles */}
      <div className="flex flex-wrap gap-1.5 justify-center mb-3">
        {availableLetters.map((item) => {
          const isUsed = selectedLetters.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => handleTileClick(item.id)}
              disabled={isUsed}
              className={`w-8 h-8 rounded-lg text-xs font-mono font-semibold transition-all border cursor-pointer ${
                isUsed
                  ? 'bg-cream-100 text-cream-300 border-transparent cursor-not-allowed opacity-40'
                  : 'bg-white hover:bg-cream-100 border-cream-200 text-charcoal shadow-xs active:scale-95'
              }`}
            >
              {item.char}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-rose-hover font-medium">
          {errorMsg ? 'Susunan belum tepat, silakan ulangi.' : ''}
        </span>
        <button
          onClick={handleClear}
          className="text-[11px] text-charcoal-muted hover:text-charcoal flex items-center gap-1 cursor-pointer font-medium"
        >
          <RotateCcw size={12} strokeWidth={1.5} />
          <span>HAPUS</span>
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   4. CIPHER CODE MINI GAME
-------------------------------------------------------------- */
interface CipherCodeGameProps {
  cipherData: {
    targetCode: string;
    prompt: string;
    hint: string;
  };
  onComplete: () => void;
  isAlreadyCompleted: boolean;
}

const CipherCodeGame: React.FC<CipherCodeGameProps> = ({
  cipherData,
  onComplete,
  isAlreadyCompleted,
}) => {
  const [pin, setPin] = useState('');
  const [isWrong, setIsWrong] = useState(false);

  // Allow up to 6 digits dynamically based on configured targetCode (default 4 if not set)
  const targetCode = (cipherData.targetCode || '1806').trim().slice(0, 6);
  const maxDigits = Math.min(6, Math.max(1, targetCode.length));

  const handleDigit = (digit: string) => {
    if (pin.length >= maxDigits) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setIsWrong(false);

    if (nextPin.length === maxDigits) {
      if (nextPin === targetCode) {
        onComplete();
      } else {
        setIsWrong(true);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setIsWrong(false);
  };

  if (isAlreadyCompleted) {
    return (
      <div className="p-3 rounded-inner bg-cream-50/60 border border-cream-200/80 text-center">
        <p className="text-xs text-charcoal-muted font-mono">
          Kunci kombinasi telah terbuka dengan kode: {targetCode}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 rounded-inner p-4 border border-cream-200/80">
      <p className="text-xs text-charcoal-muted mb-3 font-normal leading-relaxed">
        {cipherData.prompt}
      </p>

      {/* Code Display: Individual digit boxes (up to 6 digits) */}
      <div className={`py-3.5 px-3 rounded-xl bg-white border text-center mb-4 transition-colors flex items-center justify-center gap-2 sm:gap-2.5 ${
        isWrong ? 'border-rose-300 text-rose-900 bg-rose-soft/40' : 'border-cream-200 text-charcoal'
      }`}>
        {Array.from({ length: maxDigits }).map((_, idx) => {
          const char = pin[idx];
          return (
            <div
              key={idx}
              className={`w-9 h-11 sm:w-10 sm:h-12 rounded-lg flex items-center justify-center font-mono text-lg font-bold transition-all border ${
                char
                  ? 'bg-cream-100 border-rose-accent/40 text-charcoal shadow-xs scale-105'
                  : 'bg-cream-50/60 border-cream-200 text-charcoal-subtle'
              }`}
            >
              {char ? char : '•'}
            </div>
          );
        })}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
          <button
            key={num}
            onClick={() => handleDigit(num)}
            className="py-2.5 rounded-xl bg-white hover:bg-cream-100 border border-cream-200 text-sm font-mono font-medium text-charcoal shadow-xs active:scale-95 cursor-pointer"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleBackspace}
          className="py-2.5 rounded-xl bg-cream-100 hover:bg-cream-200/60 border border-cream-200 text-xs font-mono font-medium text-charcoal cursor-pointer"
        >
          DEL
        </button>
        <button
          onClick={() => handleDigit('0')}
          className="py-2.5 rounded-xl bg-white hover:bg-cream-100 border border-cream-200 text-sm font-mono font-medium text-charcoal shadow-xs active:scale-95 cursor-pointer"
        >
          0
        </button>
        <button
          onClick={() => setPin('')}
          className="py-2.5 rounded-xl bg-cream-100 hover:bg-cream-200/60 border border-cream-200 text-xs font-mono font-medium text-charcoal cursor-pointer"
        >
          CLR
        </button>
      </div>

      {isWrong && (
        <p className="text-[11px] text-rose-hover text-center mt-3 font-mono">
          Kode keliru. Petunjuk: {cipherData.hint}
        </p>
      )}
    </div>
  );
};

/* -------------------------------------------------------------
   5. FINAL CELEBRATION (YEAR 2026 - 25TH BIRTHDAY FINALE)
-------------------------------------------------------------- */
interface FinalCelebrationSectionProps {
  finalData: {
    title: string;
    dedication: string;
    letterLines: string[];
  };
  onComplete: () => void;
}

const FinalCelebrationSection: React.FC<FinalCelebrationSectionProps> = ({
  finalData,
  onComplete,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenCapsule = () => {
    setIsOpen(true);
    onComplete();
  };

  return (
    <div className="bg-cream-50 rounded-inner p-5 border border-cream-200/80 text-center">
      <div className="w-12 h-12 rounded-full bg-cream-100 border border-cream-200 flex items-center justify-center mx-auto mb-3 text-rose-accent">
        <Trophy size={20} strokeWidth={1.5} />
      </div>

      <h4 className="font-serif text-lg font-medium text-charcoal">
        {finalData.title}
      </h4>
      <p className="text-xs text-charcoal-muted mt-1 font-mono">
        {finalData.dedication}
      </p>

      {!isOpen ? (
        <button
          onClick={handleOpenCapsule}
          className="mt-4 w-full py-3 px-4 rounded-xl bg-rose-accent hover:bg-rose-hover text-white text-xs font-medium tracking-wider uppercase flex items-center justify-center gap-2 shadow-soft transition-all cursor-pointer"
        >
          <Sparkles size={14} strokeWidth={1.5} />
          <span>BUKA KAPSUL SURAT 25 TAHUN</span>
        </button>
      ) : (
        <div className="mt-4 p-4 rounded-2xl bg-white border border-cream-200 text-left transition-all duration-700 animate-fadeIn shadow-card">
          <div className="space-y-3 font-serif text-xs sm:text-sm text-charcoal leading-relaxed">
            {finalData.letterLines.map((line, idx) => (
              <p key={idx} className={idx === finalData.letterLines.length - 1 ? 'font-semibold text-rose-hover pt-2 border-t border-cream-200' : ''}>
                {line}
              </p>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-cream-200/60 flex items-center justify-between text-[10px] font-mono text-charcoal-subtle">
            <span>TERSIMPAN DALAM HATI</span>
            <span>2018 — 2026</span>
          </div>
        </div>
      )}
    </div>
  );
};


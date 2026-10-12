import React, { useState, useEffect } from 'react';
import { JOURNAL_DATA } from './data/journalData';
import { WelcomeScreen } from './components/WelcomeScreen';
import { FloatingAudioPlayer } from './components/FloatingAudioPlayer';
import { YearNav } from './components/YearNav';
import { ScratchGallery } from './components/ScratchGallery';
import { WishCard } from './components/WishCard';
import { MiniGameSection } from './components/MiniGameSection';
import { LockedYearCard } from './components/LockedYearCard';
import { FooterCredits } from './components/FooterCredits';
import { audioManager } from './utils/audioManager';
import { Sparkles } from 'lucide-react';

const STORAGE_KEY = 'sophie_journal_unlocked_years';

export const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2018);
  const [unlockedYears, setUnlockedYears] = useState<number[]>([2018]);

  // Load unlocked years from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUnlockedYears(parsed);
        }
      }
    } catch {
      // Ignore localStorage error
    }
  }, []);

  // Sync unlocked years to localStorage
  const saveUnlockedYears = (years: number[]) => {
    setUnlockedYears(years);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(years));
    } catch {
      // Ignore localStorage error
    }
  };

  const currentYearData = JOURNAL_DATA.find((y) => y.year === selectedYear) || JOURNAL_DATA[0];
  const isCurrentYearUnlocked = unlockedYears.includes(selectedYear);

  // Index of current year in list
  const currentIdx = JOURNAL_DATA.findIndex((y) => y.year === selectedYear);
  const nextYearData = currentIdx < JOURNAL_DATA.length - 1 ? JOURNAL_DATA[currentIdx + 1] : undefined;
  const isNextYearUnlocked = nextYearData ? unlockedYears.includes(nextYearData.year) : true;

  // On Start Journey (Welcome Screen button clicked)
  const handleStart = () => {
    setHasStarted(true);
    audioManager.playTrack(currentYearData.song);
  };

  // Change Year Handler
  const handleSelectYear = (year: number) => {
    setSelectedYear(year);
    const targetData = JOURNAL_DATA.find((y) => y.year === year);
    if (targetData && hasStarted) {
      audioManager.playTrack(targetData.song);
    }
  };

  const handleLockedClick = (year: number) => {
    setSelectedYear(year);
  };

  // Mini-game unlock trigger
  const handleUnlockNextYear = () => {
    if (nextYearData && !unlockedYears.includes(nextYearData.year)) {
      const updated = [...unlockedYears, nextYearData.year];
      saveUnlockedYears(updated);
    }
  };

  const handleGoToNextYear = () => {
    if (nextYearData) {
      handleSelectYear(nextYearData.year);
    }
  };

  // Reset Progress
  const handleResetProgress = () => {
    if (window.confirm("Apakah kamu yakin ingin mereset seluruh progres kenangan dan mengulang dari tahun 2018?")) {
      saveUnlockedYears([2018]);
      handleSelectYear(2018);
    }
  };

  // If user hasn't started yet, display the Welcome Screen
  if (!hasStarted) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return (
    <div className="min-h-dvh bg-cream-50 text-charcoal paper-grain flex flex-col justify-between selection:bg-rose-accent selection:text-white">
      {/* Container Constraints: max-width 480px centered */}
      <div className="w-full max-w-[480px] mx-auto min-h-dvh flex flex-col relative pb-safe">
        
        {/* Floating Top Audio Player */}
        <FloatingAudioPlayer currentTrack={currentYearData.song} />

        {/* Year Navigation Bar */}
        <YearNav
          years={JOURNAL_DATA}
          selectedYear={selectedYear}
          unlockedYears={unlockedYears}
          onSelectYear={handleSelectYear}
          onLockedClick={handleLockedClick}
        />

        {/* Main Content Area */}
        <main className="flex-1 transition-opacity duration-300">
          {isCurrentYearUnlocked ? (
            <>
              {/* Year Chapter Title Section */}
              <div className="px-5 mb-5">
                <div className="flex items-center justify-between mb-1 text-rose-hover">
                  <span className="text-[11px] uppercase tracking-[0.25em] font-semibold">
                    {currentYearData.chapter}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-charcoal-subtle">
                    <Sparkles size={12} strokeWidth={1.5} className="text-rose-accent" />
                    <span>TAHUN {currentYearData.year}</span>
                  </div>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal leading-tight">
                  {currentYearData.title}
                </h1>

                <p className="text-xs text-charcoal-muted mt-1 font-normal leading-relaxed">
                  {currentYearData.subtitle}
                </p>
                
                <div className="w-8 h-[1px] bg-cream-200 mt-3" />
              </div>

              {/* 1. Scratch Card Photo Gallery */}
              <ScratchGallery
                photos={currentYearData.photos}
                year={currentYearData.year}
              />

              {/* 2. Flexible Wish & Narrative Card (Short + Long Accordion) */}
              <WishCard
                wish={currentYearData.wish}
                year={currentYearData.year}
              />

              {/* 3. Yearly Mini-Game & Chapter Unlock System */}
              <MiniGameSection
                miniGame={currentYearData.miniGame}
                currentYear={currentYearData.year}
                nextYear={nextYearData?.year}
                isNextYearUnlocked={isNextYearUnlocked}
                onUnlockNextYear={handleUnlockNextYear}
                onGoToNextYear={handleGoToNextYear}
              />
            </>
          ) : (
            /* Locked Year Notification Card */
            <LockedYearCard
              lockedYear={selectedYear}
              previousYear={JOURNAL_DATA[Math.max(0, currentIdx - 1)].year}
              onReturnToYear={handleSelectYear}
            />
          )}
        </main>

        {/* Footer Editorial Credits */}
        <FooterCredits
          onResetProgress={handleResetProgress}
          unlockedCount={unlockedYears.length}
          totalYears={JOURNAL_DATA.length}
        />

      </div>
    </div>
  );
};

export default App;

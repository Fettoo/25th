import React, { useState, useEffect } from 'react';
import { getStoredJournalData } from './data/journalData';
import { YearData } from './types/index';
import { WelcomeScreen } from './components/WelcomeScreen';
import { FloatingAudioPlayer } from './components/FloatingAudioPlayer';
import { YearNav } from './components/YearNav';
import { ScratchGallery } from './components/ScratchGallery';
import { WishCard } from './components/WishCard';
import { MiniGameSection } from './components/MiniGameSection';
import { LockedYearCard } from './components/LockedYearCard';
import { FooterCredits } from './components/FooterCredits';
import { StudioDashboard } from './components/StudioDashboard';
import { audioManager } from './utils/audioManager';
import { Sparkles, Sliders } from 'lucide-react';

const STORAGE_KEY = 'sophie_journal_unlocked_years';

export const App: React.FC = () => {
  const [journalData, setJournalData] = useState<YearData[]>(() => getStoredJournalData());
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2018);
  const [unlockedYears, setUnlockedYears] = useState<number[]>([2018]);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Check URL params for auto-open studio (e.g. ?studio=true or ?admin=true)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('studio') === 'true' || params.get('admin') === 'true') {
      setIsStudioOpen(true);
    }
  }, []);

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

  const currentYearData = journalData.find((y) => y.year === selectedYear) || journalData[0];
  const isCurrentYearUnlocked = unlockedYears.includes(selectedYear);

  // Index of current year in list
  const currentIdx = journalData.findIndex((y) => y.year === selectedYear);
  const nextYearData = currentIdx < journalData.length - 1 ? journalData[currentIdx + 1] : undefined;
  const isNextYearUnlocked = nextYearData ? unlockedYears.includes(nextYearData.year) : true;

  // On Start Journey (Welcome Screen button clicked)
  const handleStart = () => {
    setHasStarted(true);
    audioManager.playTrack(currentYearData.song);
  };

  // Change Year Handler
  const handleSelectYear = (year: number) => {
    setSelectedYear(year);
    const targetData = journalData.find((y) => y.year === year);
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

  // Handle data updated from Studio
  const handleDataUpdated = (newData: YearData[]) => {
    setJournalData(newData);
    const updatedCurrent = newData.find((y) => y.year === selectedYear);
    if (updatedCurrent && hasStarted) {
      audioManager.playTrack(updatedCurrent.song);
    }
  };

  // If user hasn't started yet and studio is not open, display the Welcome Screen
  if (!hasStarted && !isStudioOpen) {
    return (
      <div className="relative">
        <WelcomeScreen onStart={handleStart} />
        {/* Subtle studio button on welcome screen */}
        <button
          onClick={() => setIsStudioOpen(true)}
          className="fixed bottom-4 right-4 z-40 p-2.5 rounded-full bg-cream-100 hover:bg-cream-200 border border-cream-200 text-charcoal-muted shadow-card transition-all cursor-pointer"
          title="Buka Studio Pengaturan Kenangan"
          aria-label="Studio Pengaturan"
        >
          <Sliders size={15} strokeWidth={1.5} />
        </button>
        <StudioDashboard
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          journalData={journalData}
          onDataUpdated={handleDataUpdated}
        />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-cream-50 text-charcoal paper-grain flex flex-col justify-between selection:bg-rose-accent selection:text-white">
      {/* Container Constraints: max-width 480px centered */}
      <div className="w-full max-w-[480px] mx-auto min-h-dvh flex flex-col relative pb-safe">
        
        {/* Floating Top Audio Player */}
        <FloatingAudioPlayer currentTrack={currentYearData.song} />

        {/* Year Navigation Bar */}
        <YearNav
          years={journalData}
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
              previousYear={journalData[Math.max(0, currentIdx - 1)].year}
              onReturnToYear={handleSelectYear}
            />
          )}
        </main>

        {/* Footer Editorial Credits */}
        <FooterCredits
          onResetProgress={handleResetProgress}
          onOpenStudio={() => setIsStudioOpen(true)}
          unlockedCount={unlockedYears.length}
          totalYears={journalData.length}
        />

        {/* Studio Dashboard Drawer/Modal */}
        <StudioDashboard
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          journalData={journalData}
          onDataUpdated={handleDataUpdated}
        />

      </div>
    </div>
  );
};

export default App;

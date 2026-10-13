export interface MemoryPhoto {
  id: string;
  title: string;
  date: string;
  caption: string;
  imageUrl: string;
  location?: string;
}

export interface YearlyWish {
  shortWish: string;
  longWish: string;
  themeTitle: string;
  authorNote: string;
}

export type MiniGameType = 
  | 'quiz' 
  | 'memory-match' 
  | 'word-unscramble' 
  | 'cipher-code' 
  | 'trivia'
  | 'final-celebration';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
}

export interface MemoryCardItem {
  id: number;
  label: string;
  iconName: string;
}

export interface YearMiniGame {
  type: MiniGameType;
  title: string;
  instructions: string;
  badgeLabel: string;
  quizData?: QuizQuestion[];
  matchData?: MemoryCardItem[];
  cipherData?: {
    targetCode: string;
    prompt: string;
    hint: string;
  };
  wordData?: {
    letters: string[];
    answer: string;
    hint: string;
  };
  finalData?: {
    title: string;
    dedication: string;
    letterLines: string[];
  };
}

export interface SongTrack {
  title: string;
  fileName: string;
  artist: string;
  audioUrl: string;
  synthTheme: 'nostalgic' | 'dreamy' | 'gentle' | 'warm' | 'hopeful' | 'deep' | 'joyful' | 'radiant' | 'celebration';
}

export interface YearData {
  year: number;
  chapter: string;
  title: string;
  subtitle: string;
  song: SongTrack;
  photos: MemoryPhoto[];
  wish: YearlyWish;
  miniGame: YearMiniGame;
}


export type LessonCategory = 'ALLOWANCE' | 'SAVINGS' | 'PLANNING' | 'CREDIT' | 'BUDGETING' | 'DEBT';
export type LessonDifficulty = 'BEGINNER' | 'INTERMEDIATE';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string; // JSON string — parsed at render time
  category: LessonCategory;
  difficulty: LessonDifficulty;
  orderIndex: number;
  icon: string;
  estimatedMinutes: number;
  hasCalculator: boolean;
  completed: boolean;
  score: number | null;
  completedAt: string | null;
}

export interface UserProgress {
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  currentStreak: number;
  averageScore: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  levelMessage: string;
}

// Parsed content block types rendered by LessonContent
export type ContentBlock =
  | { type: 'intro'; text: string }
  | { type: 'tips'; title: string; items: string[] }
  | { type: 'example'; title: string; text: string }
  | { type: 'callout'; tone: 'warning' | 'positive' | 'info'; text: string }
  | { type: 'calculator'; label: string }
  | { type: 'quiz'; question: string; options: string[]; correctIndex: number; explanation: string };

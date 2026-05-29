export interface Achievement {
  code: string;
  title: string;
  description: string;
  icon: string; // lucide icon name hint
  unlocked: boolean;
  unlockedAt?: string | null;
}

export interface GamificationData {
  level: number;
  xp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  achievements: Achievement[];
}

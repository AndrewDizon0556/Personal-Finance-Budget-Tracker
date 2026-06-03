export type ChallengeType = 'NO_SPEND' | 'SAVINGS_TARGET' | 'STREAK';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  targetDays: number;
  rewardXp: number;
  type: ChallengeType;
  targetAmount: number | null;
  active: boolean;
  joined: boolean;
  completed: boolean;
  currentProgress: number;
  progressPercentage: number;
  startDate: string | null;
  completedAt: string | null;
}

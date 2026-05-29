export interface SavingsGoal {
  id: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  completed: boolean;
  targetDate: string | null;
  createdAt: string;
}

export interface SavingsGoalPayload {
  goalName: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string;
}

import type { AllowanceSchedule } from './auth';

export interface SemesterBudget {
  id: string;
  semesterName: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  targetSavings: number | null;
  allowanceSchedule: AllowanceSchedule | null;
  totalSpent: number;
  remaining: number;
  weeklyBudget: number;
  totalWeeks: number;
  weeksElapsed: number;
  weeksRemaining: number;
  progressPercentage: number;
  status: 'ON_TRACK' | 'WARNING' | 'CRITICAL' | 'COMPLETED';
  statusMessage: string;
  createdAt: string;
}

export interface WeeklyBreakdown {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  usagePercentage: number;
  status: 'SAFE' | 'WARNING' | 'OVERSPENT' | 'UPCOMING';
  isCurrent: boolean;
}

export interface SemesterBudgetPayload {
  semesterName: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  targetSavings?: number | null;
  allowanceSchedule?: AllowanceSchedule | null;
}

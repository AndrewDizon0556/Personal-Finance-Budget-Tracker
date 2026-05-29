import type { AllowanceSchedule } from './auth';
import type { Budget } from './budget';
import type { Expense } from './expense';
import type { RunwayStatus } from './runway';

export interface DashboardData {
  monthlyAllowance: number | null;
  allowanceSchedule: AllowanceSchedule | null;
  totalSpentThisMonth: number;
  remainingBalance: number;
  dailySafeSpend: number;
  daysLeftInMonth: number;
  budgets: Budget[];
  recentTransactions: Expense[];
  runwayStatus: RunwayStatus | null;
  estimatedDaysRemaining: number;
  daysUntilNextAllowance: number;
  runwayMessage: string;
}

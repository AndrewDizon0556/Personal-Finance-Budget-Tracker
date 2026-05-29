export type RunwayStatus = 'SAFE' | 'WARNING' | 'CRITICAL';

export interface RunwayData {
  remainingBalance: number;
  avgDailySpending: number;
  estimatedDaysRemaining: number;
  daysUntilNextAllowance: number;
  runwayStatus: RunwayStatus;
  message: string;
}

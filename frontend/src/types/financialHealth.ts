export type HealthLevel = 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';

export interface HealthFactor {
  name: string;
  points: number;
  maxPoints: number;
  status: HealthLevel;
  detail: string;
}

export interface FinancialHealthScore {
  score: number;
  level: HealthLevel;
  message: string;
  tip: string;
  factors: HealthFactor[];
}

export interface AllowancePrediction {
  remainingBalance: number;
  avgDailySpending: number;
  estimatedDaysRemaining: number;
  daysUntilNextAllowance: number;
  runwayStatus: 'SAFE' | 'WARNING' | 'CRITICAL';
  message: string;
  dailyRecommendedSpending: number;
  estimatedExhaustionDate: string | null;
  riskLevel: 'GREEN' | 'YELLOW' | 'RED';
  spendingTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
  smartTip: string;
  weeklyProjections: WeeklyProjection[];
}

export interface WeeklyProjection {
  weekNumber: number;
  weekStart: string;
  projectedSpend: number;
  projectedBalance: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
}

export interface PurchaseAdvisor {
  purchaseAmount: number;
  dailyBudget: number;
  spentToday: number;
  remainingTodayBefore: number;
  remainingTodayAfter: number;
  budgetImpactPercent: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  advice: string;
  hasBudget: boolean;
}

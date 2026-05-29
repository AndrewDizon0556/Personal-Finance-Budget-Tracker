export interface CategoryTotal {
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface AnalyticsData {
  totalSpentThisMonth: number;
  highestSpendingCategory: string | null;
  categoryTotals: CategoryTotal[];
  weeklyTotals: number[];
}

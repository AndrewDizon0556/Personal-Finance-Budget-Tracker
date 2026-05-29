import { useEffect, useState } from 'react';
import analyticsService from '../services/analyticsService';
import type { AnalyticsData } from '../types/analytics';
import CategoryPieChart from '../components/analytics/CategoryPieChart';
import WeeklySpendingChart from '../components/analytics/WeeklySpendingChart';

const formatPeso = (amount: number) =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyticsService.getAnalytics()
      .then(setAnalytics)
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setIsLoading(false));
  }, []);

  const month = new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400 text-sm">Loading analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-red-400 text-sm">{error ?? 'Something went wrong.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Analytics</h1>
        <p className="text-xs text-gray-400 mt-0.5">{month}</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 mb-1">Total Spent This Month</p>
          <p className="text-2xl font-bold text-gray-800">{formatPeso(analytics.totalSpentThisMonth)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 mb-1">Top Spending Category</p>
          <p className="text-lg font-bold text-gray-800 truncate">
            {analytics.highestSpendingCategory ?? '—'}
          </p>
        </div>
      </div>

      {/* Pie chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-4">Spending by Category</p>
        <CategoryPieChart data={analytics.categoryTotals} />

        {/* Category breakdown list */}
        {analytics.categoryTotals.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-gray-50 pt-4">
            {analytics.categoryTotals.map((cat) => (
              <div key={cat.categoryName} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{cat.categoryName}</span>
                <span className="text-gray-500">
                  {formatPeso(cat.amount)}{' '}
                  <span className="text-gray-300 text-xs">({cat.percentage.toFixed(1)}%)</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-700 mb-4">Weekly Spending</p>
        <WeeklySpendingChart weeklyTotals={analytics.weeklyTotals} />
      </div>
    </div>
  );
}

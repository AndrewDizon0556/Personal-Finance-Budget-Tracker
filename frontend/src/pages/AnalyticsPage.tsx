import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Crown, BarChart3 } from 'lucide-react';
import analyticsService from '../services/analyticsService';
import type { AnalyticsData } from '../types/analytics';
import CategoryPieChart from '../components/analytics/CategoryPieChart';
import WeeklySpendingChart from '../components/analytics/WeeklySpendingChart';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import { categoryStyle } from '../lib/categories';
import { formatPeso } from '../lib/utils';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyticsService
      .getAnalytics()
      .then(setAnalytics)
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setIsLoading(false));
  }, []);

  const month = new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="skeleton mb-6 h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="skeleton h-24" />
          <div className="skeleton h-24" />
        </div>
        <div className="skeleton mt-5 h-72" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <EmptyState icon={BarChart3} title="Couldn't load analytics" message={error ?? 'Something went wrong.'} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader title="Analytics" subtitle={month} />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card flex items-center gap-4 p-5">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-nu-blue-100 text-nu-blue-700 dark:bg-nu-blue-500/15">
            <TrendingUp size={22} />
          </span>
          <div>
            <p className="text-xs text-ink-faint">Total spent this month</p>
            <p className="font-display text-2xl font-extrabold text-ink">
              <AnimatedNumber value={analytics.totalSpentThisMonth} format={(n) => formatPeso(n)} />
            </p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card flex items-center gap-4 p-5">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-nu-gold-100 text-nu-gold-700 dark:bg-nu-gold-500/15">
            <Crown size={22} />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-ink-faint">Top category</p>
            <p className="truncate font-display text-xl font-bold text-ink">
              {analytics.highestSpendingCategory ?? '—'}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="card mb-5 p-5">
        <p className="mb-4 text-sm font-semibold text-ink">Spending by Category</p>
        <CategoryPieChart data={analytics.categoryTotals} />

        {analytics.categoryTotals.length > 0 && (
          <div className="mt-4 space-y-2.5 border-t border-surface-border/60 pt-4">
            {analytics.categoryTotals.map((cat) => {
              const style = categoryStyle(cat.categoryName);
              const Icon = style.icon;
              return (
                <div key={cat.categoryName} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink">
                    <span className={`grid h-7 w-7 place-items-center rounded-lg ${style.bg} ${style.fg}`}>
                      <Icon size={14} />
                    </span>
                    {cat.categoryName}
                  </span>
                  <span className="text-ink-soft">
                    {formatPeso(cat.amount)}{' '}
                    <span className="text-xs text-ink-faint">({cat.percentage.toFixed(1)}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card p-5">
        <p className="mb-4 text-sm font-semibold text-ink">Weekly Spending Trend</p>
        <WeeklySpendingChart weeklyTotals={analytics.weeklyTotals} />
      </div>
    </div>
  );
}

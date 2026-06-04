import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, CalendarDays, Coins, ArrowRight, Receipt } from 'lucide-react';
import dashboardService from '../services/dashboardService';
import insightsService from '../services/insightsService';
import { useUiStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { usePrefsStore } from '../store/prefsStore';
import type { DashboardData } from '../types/dashboard';
import BalanceCard from '../components/dashboard/BalanceCard';
import BudgetSummaryCard from '../components/dashboard/BudgetSummaryCard';
import RecentTransactionsList from '../components/dashboard/RecentTransactionsList';
import InsightsWidget, { type Insight } from '../components/dashboard/InsightsWidget';
import AllowanceRunwayCard from '../components/finance/AllowanceRunwayCard';
import StatCard from '../components/ui/StatCard';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import EmptyStateGuide from '../components/help/EmptyStateGuide';
import HealthScoreCard from '../components/finance/HealthScoreCard';
import { staggerContainer } from '../lib/motion';
import { TOOLTIPS } from '../lib/helpContent';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function deriveInsights(d: DashboardData): Insight[] {
  const out: Insight[] = [];
  const allowance = d.monthlyAllowance ?? 0;
  if (allowance > 0) {
    const spentPct = (d.totalSpentThisMonth / allowance) * 100;
    if (spentPct >= 85) out.push({ tone: 'warning', text: "You're close to exceeding your allowance this month. Ease up on spending." });
    else if (spentPct <= 50) out.push({ tone: 'positive', text: 'Great job staying well under your budget so far. Keep it up!' });
  }
  if (d.runwayStatus === 'CRITICAL') out.push({ tone: 'warning', text: 'Your funds may run out before your next allowance. Spend carefully.' });
  if (d.runwayStatus === 'SAFE' && d.estimatedDaysRemaining >= d.daysUntilNextAllowance) out.push({ tone: 'celebrate', text: 'Your money will comfortably last until your next allowance. ' });
  const topBudget = [...d.budgets].sort((a, b) => b.spentAmount - a.spentAmount)[0];
  if (topBudget && topBudget.spentAmount > 0) out.push({ tone: 'info', text: `${topBudget.categoryName} is your biggest spend category this month.` });
  return out.slice(0, 3);
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { openExpenseModal, mutationTick } = useUiStore();
  const daysLeftOverride = usePrefsStore((s) => s.daysLeftOverride);
  const setDaysLeftOverride = usePrefsStore((s) => s.setDaysLeftOverride);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      const data = await dashboardService.getDashboard();
      setDashboard(data);
      // Prefer backend-computed insights; fall back to client-side derivation.
      try {
        const remote = await insightsService.getInsights();
        setInsights(remote.length > 0 ? remote : deriveInsights(data));
      } catch {
        setInsights(deriveInsights(data));
      }
    } catch (err: unknown) {
      // Surface the real reason so the issue is diagnosable, not a generic message.
      const e = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const status = e?.response?.status;
      const detail = e?.response?.data?.message ?? e?.message ?? 'Unknown error';
      console.error('Dashboard load failed:', status, detail, err);
      setError(status ? `Error ${status}: ${detail}` : `Network error: ${detail}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [mutationTick]);
  const firstName = (user?.fullName ?? 'Student').split(' ')[0];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="skeleton mb-6 h-10 w-64" />
        <div className="skeleton mb-4 h-48 w-full" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <EmptyState
          icon={Receipt}
          title="Couldn't load your dashboard"
          message={error ?? 'Something went wrong. Please try again.'}
          action={
            <button onClick={loadDashboard} className="btn-primary">
              Retry
            </button>
          }
        />
      </div>
    );
  }

  const hasActivity = dashboard.recentTransactions.length > 0;

  // Days-left can be overridden by the user; safe-to-spend recalculates from it.
  const effectiveDays = daysLeftOverride && daysLeftOverride > 0 ? daysLeftOverride : dashboard.daysLeftInMonth;
  const effectiveSafeSpend =
    dashboard.remainingBalance > 0 && effectiveDays > 0 ? dashboard.remainingBalance / effectiveDays : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageHeader
        title={`${greeting()}, ${firstName} 👋`}
        help={TOOLTIPS.dashboard}
        subtitle={new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}
        action={
          <button onClick={() => openExpenseModal()} className="btn-gold hidden sm:inline-flex">
            <Plus size={18} /> Add Transaction
          </button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-5 lg:col-span-2">
          <BalanceCard
            monthlyAllowance={dashboard.monthlyAllowance}
            totalSpent={dashboard.totalSpentThisMonth}
            remainingBalance={dashboard.remainingBalance}
            dailySafeSpend={effectiveSafeSpend}
            daysLeft={effectiveDays}
            isCustomDays={daysLeftOverride != null}
            onDaysLeftChange={setDaysLeftOverride}
            onResetDaysLeft={() => setDaysLeftOverride(null)}
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            <StatCard label="Spent this month" value={dashboard.totalSpentThisMonth} icon={TrendingUp} />
            <StatCard label="Safe to spend / day" value={effectiveSafeSpend} icon={Coins} />
            <StatCard
              label="Days remaining"
              value={effectiveDays}
              icon={CalendarDays}
              currency={false}
              suffix="days"
            />
          </motion.div>

          {hasActivity ? (
            <>
              <RecentTransactionsList transactions={dashboard.recentTransactions} />
              <button
                onClick={() => navigate('/transactions')}
                className="flex w-full items-center justify-center gap-1.5 py-1 text-sm font-semibold text-nu-blue-600 hover:underline"
              >
                View all transactions <ArrowRight size={15} />
              </button>
            </>
          ) : (
            <EmptyStateGuide
              emoji="🎒"
              title="No transactions yet"
              message="Start tracking your first expense so Ipon Challenge can learn your spending habits."
              actionLabel="Add Expense"
              onAction={() => openExpenseModal()}
              helpHref="/help#expenses"
            />
          )}
        </div>

        {/* Side column */}
        <div className="space-y-5">
          <AllowanceRunwayCard />
          <InsightsWidget insights={insights} />
          <HealthScoreCard />
          {dashboard.budgets.length > 0 && <BudgetSummaryCard budgets={dashboard.budgets} />}
        </div>
      </div>
    </div>
  );
}

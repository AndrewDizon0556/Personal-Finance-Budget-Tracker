import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import { useExpenseStore } from '../store/expenseStore';
import type { DashboardData } from '../types/dashboard';
import BalanceCard from '../components/dashboard/BalanceCard';
import BudgetSummaryCard from '../components/dashboard/BudgetSummaryCard';
import RecentTransactionsList from '../components/dashboard/RecentTransactionsList';
import RunwayWidget from '../components/dashboard/RunwayWidget';
import ExpenseModal from '../components/expense/ExpenseModal';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { categories, fetchCategories, addExpense } = useExpenseStore();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const data = await dashboardService.getDashboard();
      setDashboard(data);
    } catch {
      setError('Failed to load dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    fetchCategories();
  }, []);

  const handleAddExpense = async (data: {
    categoryId?: string;
    amount: number;
    notes?: string;
    expenseDate: string;
    transactionType?: 'EXPENSE' | 'INCOME';
  }) => {
    await addExpense({
      categoryId: data.categoryId || undefined,
      amount: data.amount,
      notes: data.notes,
      expenseDate: data.expenseDate,
      transactionType: data.transactionType ?? 'EXPENSE',
    });
    await loadDashboard();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-red-400 text-sm">{error ?? 'Something went wrong.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Add Expense
        </button>
      </div>

      <div className="space-y-4">
        <BalanceCard
          monthlyAllowance={dashboard.monthlyAllowance}
          totalSpent={dashboard.totalSpentThisMonth}
          remainingBalance={dashboard.remainingBalance}
          dailySafeSpend={dashboard.dailySafeSpend}
          daysLeft={dashboard.daysLeftInMonth}
        />

        {dashboard.runwayStatus && (
          <RunwayWidget
            runwayStatus={dashboard.runwayStatus}
            estimatedDaysRemaining={dashboard.estimatedDaysRemaining}
            daysUntilNextAllowance={dashboard.daysUntilNextAllowance}
            message={dashboard.runwayMessage}
          />
        )}

        {dashboard.budgets.length > 0 && (
          <BudgetSummaryCard budgets={dashboard.budgets} />
        )}

        <RecentTransactionsList transactions={dashboard.recentTransactions} />

        {dashboard.recentTransactions.length > 0 && (
          <button
            onClick={() => navigate('/transactions')}
            className="w-full text-center text-sm text-blue-500 hover:underline py-2"
          >
            View all transactions
          </button>
        )}
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddExpense}
        categories={categories}
        editingExpense={null}
      />
    </div>
  );
}

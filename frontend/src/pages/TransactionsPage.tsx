import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, ArrowDownCircle, ArrowUpCircle, Receipt } from 'lucide-react';
import { useExpenseStore } from '../store/expenseStore';
import { useUiStore } from '../store/uiStore';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import EmptyStateGuide from '../components/help/EmptyStateGuide';
import TransactionRow from '../components/transactions/TransactionRow';
import { formatPeso } from '../lib/utils';
import { staggerContainer } from '../lib/motion';
import { TOOLTIPS } from '../lib/helpContent';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type Filter = 'ALL' | 'EXPENSE' | 'INCOME';

export default function TransactionsPage() {
  const { expenses, isLoading, fetchExpenses } = useExpenseStore();
  const { openExpenseModal, mutationTick } = useUiStore();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');

  useEffect(() => {
    fetchExpenses(month, year);
  }, [month, year, mutationTick]);

  const { totalIncome, totalExpense } = useMemo(() => {
    return expenses.reduce(
      (acc, e) => {
        if (e.transactionType === 'INCOME') acc.totalIncome += e.amount;
        else acc.totalExpense += e.amount;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 },
    );
  }, [expenses]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (filter !== 'ALL' && e.transactionType !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (e.notes ?? '').toLowerCase().includes(q) || e.categoryName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [expenses, filter, query]);

  // Group by date (descending)
  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const e of filtered) {
      const arr = map.get(e.expenseDate) ?? [];
      arr.push(e);
      map.set(e.expenseDate, arr);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Transactions"
        help={TOOLTIPS.transactions}
        subtitle="Every peso, tracked."
        action={
          <button onClick={() => openExpenseModal()} className="btn-gold hidden sm:inline-flex">
            <Plus size={18} /> Add
          </button>
        }
      />

      {/* Period summary */}
      <div className="mb-5 grid grid-cols-2 gap-4">
        <div className="card flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-300">
            <ArrowUpCircle size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-faint">Income</p>
            <p className="font-display text-lg font-bold text-ink">{formatPeso(totalIncome)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-nu-gold-100 text-nu-gold-700 dark:bg-nu-gold-500/25 dark:text-nu-gold-300">
            <ArrowDownCircle size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-faint">Spent</p>
            <p className="font-display text-lg font-bold text-ink">{formatPeso(totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="input-field pl-9"
          />
        </div>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="input-field w-auto">
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input-field w-auto">
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="mb-5 flex gap-2">
        {(['ALL', 'EXPENSE', 'INCOME'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`chip transition-colors ${
              filter === f
                ? 'bg-nu-blue-700 text-white'
                : 'bg-surface text-ink-soft border border-surface-border hover:border-nu-blue-300'
            }`}
          >
            {f === 'ALL' ? 'All' : f === 'EXPENSE' ? 'Expenses' : 'Income'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 w-full" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        query || filter !== 'ALL' ? (
          <EmptyState
            icon={Receipt}
            title="No matching transactions"
            message="Try adjusting your search or filters to find what you're looking for."
          />
        ) : (
          <EmptyStateGuide
            emoji="🎒"
            title="No expenses yet"
            message="Start tracking your first expense to understand your spending habits."
            actionLabel="Add Expense"
            onAction={() => openExpenseModal()}
            helpHref="/help#expenses"
          />
        )
      ) : (
        <div className="space-y-6">
          {groups.map(([date, items]) => (
            <div key={date}>
              <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                {new Date(date + 'T00:00:00').toLocaleDateString('en-PH', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="card space-y-1 p-2">
                {items.map((e) => (
                  <TransactionRow key={e.id} expense={e} />
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

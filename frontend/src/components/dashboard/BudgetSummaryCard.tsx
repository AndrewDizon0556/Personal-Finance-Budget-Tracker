import type { Budget } from '../../types/budget';

interface BudgetSummaryCardProps {
  budgets: Budget[];
}

const formatPeso = (amount: number) =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function BudgetRow({ budget }: { budget: Budget }) {
  const pct = budget.budgetAmount > 0
    ? Math.min((budget.spentAmount / budget.budgetAmount) * 100, 100)
    : 0;

  const barColor =
    pct >= 90 ? 'bg-red-400' : pct >= 60 ? 'bg-yellow-400' : 'bg-blue-400';

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 font-medium">{budget.categoryName}</span>
        <span className="text-gray-400">
          {formatPeso(budget.spentAmount)} / {formatPeso(budget.budgetAmount)}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function BudgetSummaryCard({ budgets }: BudgetSummaryCardProps) {
  if (budgets.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">Budgets</p>
        <p className="text-xs text-gray-400 text-center py-4">
          No budgets set for this month.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <p className="text-sm font-semibold text-gray-700 mb-4">Budgets</p>
      <div className="space-y-4">
        {budgets.map((b) => (
          <BudgetRow key={b.id} budget={b} />
        ))}
      </div>
    </div>
  );
}

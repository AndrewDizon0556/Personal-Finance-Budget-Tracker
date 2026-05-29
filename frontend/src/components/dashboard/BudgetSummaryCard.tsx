import { motion } from 'framer-motion';
import type { Budget } from '../../types/budget';
import { categoryStyle } from '../../lib/categories';
import { formatPeso, clamp } from '../../lib/utils';

interface BudgetSummaryCardProps {
  budgets: Budget[];
}

function BudgetRow({ budget }: { budget: Budget }) {
  const pct = budget.budgetAmount > 0 ? clamp((budget.spentAmount / budget.budgetAmount) * 100, 0, 100) : 0;
  const style = categoryStyle(budget.categoryName);
  const Icon = style.icon;
  const barColor = pct >= 90 ? 'bg-rose-400' : pct >= 60 ? 'bg-nu-gold-400' : 'bg-nu-blue-500';

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium text-ink">
          <span className={`grid h-7 w-7 place-items-center rounded-lg ${style.bg} ${style.fg}`}>
            <Icon size={14} />
          </span>
          {budget.categoryName}
        </span>
        <span className="text-xs text-ink-faint">
          {formatPeso(budget.spentAmount)} / {formatPeso(budget.budgetAmount)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-soft">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
    </div>
  );
}

export default function BudgetSummaryCard({ budgets }: BudgetSummaryCardProps) {
  return (
    <div className="card p-5">
      <p className="mb-4 text-sm font-semibold text-ink">Category Budgets</p>
      <div className="space-y-4">
        {budgets.map((b) => (
          <BudgetRow key={b.id} budget={b} />
        ))}
      </div>
    </div>
  );
}

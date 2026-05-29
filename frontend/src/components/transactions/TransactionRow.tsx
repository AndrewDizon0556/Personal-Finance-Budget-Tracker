import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import type { Expense } from '../../types/expense';
import { categoryStyle } from '../../lib/categories';
import { formatPeso, formatShortDate } from '../../lib/utils';
import { useUiStore } from '../../store/uiStore';
import { useExpenseStore } from '../../store/expenseStore';
import { fadeUpItem } from '../../lib/motion';

interface TransactionRowProps {
  expense: Expense;
  stagger?: boolean;
}

/** Interactive transaction card with category icon, color coding, and quick actions. */
export default function TransactionRow({ expense, stagger = true }: TransactionRowProps) {
  const openExpenseModal = useUiStore((s) => s.openExpenseModal);
  const bumpMutation = useUiStore((s) => s.bumpMutation);
  const removeExpense = useExpenseStore((s) => s.removeExpense);
  const [deleting, setDeleting] = useState(false);

  const isIncome = expense.transactionType === 'INCOME';
  const style = isIncome ? categoryStyle('income') : categoryStyle(expense.categoryName);
  const Icon = style.icon;
  const label = expense.notes?.trim() || expense.categoryName || 'Transaction';

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removeExpense(expense.id);
      bumpMutation();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      variants={stagger ? fadeUpItem : undefined}
      layout
      animate={{ opacity: deleting ? 0.4 : 1 }}
      className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-surface-soft/70"
    >
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${style.bg} ${style.fg}`}>
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{label}</p>
        <p className="text-xs text-ink-faint">
          {expense.categoryName} · {formatShortDate(expense.expenseDate)}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <span
          className={`font-display text-sm font-bold ${isIncome ? 'text-emerald-600' : 'text-ink'}`}
        >
          {isIncome ? '+' : '−'}
          {formatPeso(expense.amount).replace('₱', '₱')}
        </span>

        <div className="ml-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => openExpenseModal(expense)}
            className="grid h-7 w-7 place-items-center rounded-lg text-ink-faint hover:bg-surface hover:text-nu-blue-600"
            aria-label="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="grid h-7 w-7 place-items-center rounded-lg text-ink-faint hover:bg-surface hover:text-rose-500"
            aria-label="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { Pencil, Trash2, ChevronRight, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SemesterBudget } from '../../types/semesterBudget';
import { formatPeso, clamp } from '../../lib/utils';
import { fadeUpItem } from '../../lib/motion';

interface Props {
  semester: SemesterBudget;
  onEdit: (s: SemesterBudget) => void;
  onDelete: (id: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  ON_TRACK: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15',
  WARNING: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15',
  CRITICAL: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15',
  COMPLETED: 'bg-nu-blue-100 text-nu-blue-700 dark:bg-nu-blue-500/15',
};

const STATUS_LABELS: Record<string, string> = {
  ON_TRACK: 'On Track ✅',
  WARNING: 'Watch Spending ⚠️',
  CRITICAL: 'Over Budget 🚨',
  COMPLETED: 'Completed 🎓',
};

const PROGRESS_COLORS: Record<string, string> = {
  ON_TRACK: 'bg-emerald-500',
  WARNING: 'bg-amber-400',
  CRITICAL: 'bg-rose-500',
  COMPLETED: 'bg-nu-blue-600',
};

export default function SemesterBudgetCard({ semester, onEdit, onDelete }: Props) {
  const navigate = useNavigate();
  const pct = clamp(semester.progressPercentage, 0, 100);

  return (
    <motion.div variants={fadeUpItem} whileHover={{ y: -4 }} className="card overflow-hidden p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold text-ink">{semester.semesterName}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-faint">
            <CalendarDays size={12} />
            {semester.startDate} → {semester.endDate}
          </p>
        </div>
        <span className={`chip shrink-0 ${STATUS_STYLES[semester.status]}`}>
          {STATUS_LABELS[semester.status]}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-xs text-ink-faint">
          <span>{pct.toFixed(0)}% used</span>
          <span>{semester.weeksRemaining}w left</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-soft">
          <div
            className={`h-full rounded-full transition-all ${PROGRESS_COLORS[semester.status]}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Amounts */}
      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-surface-soft/60 px-2 py-2">
          <p className="text-[10px] text-ink-faint">Total</p>
          <p className="text-sm font-bold text-ink">{formatPeso(semester.totalBudget, { compact: true })}</p>
        </div>
        <div className="rounded-xl bg-surface-soft/60 px-2 py-2">
          <p className="text-[10px] text-ink-faint">Spent</p>
          <p className="text-sm font-bold text-ink">{formatPeso(semester.totalSpent, { compact: true })}</p>
        </div>
        <div className="rounded-xl bg-surface-soft/60 px-2 py-2">
          <p className="text-[10px] text-ink-faint">Weekly</p>
          <p className="text-sm font-bold text-ink">{formatPeso(semester.weeklyBudget, { compact: true })}</p>
        </div>
      </div>

      <p className="mb-3 text-xs text-ink-soft">{semester.statusMessage}</p>

      <div className="flex gap-2 border-t border-surface-border/60 pt-3">
        <button
          onClick={() => navigate(`/semester-budget/${semester.id}`)}
          className="flex flex-1 items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-semibold text-nu-blue-600 hover:bg-surface-soft"
        >
          Details <ChevronRight size={13} />
        </button>
        <button
          onClick={() => onEdit(semester)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-soft hover:text-nu-blue-600"
        >
          <Pencil size={13} /> Edit
        </button>
        <button
          onClick={() => onDelete(semester.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-soft hover:text-rose-500"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </motion.div>
  );
}

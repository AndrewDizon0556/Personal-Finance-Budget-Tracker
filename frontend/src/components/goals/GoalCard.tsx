import { motion } from 'framer-motion';
import { Pencil, Trash2, Trophy, CalendarClock } from 'lucide-react';
import type { SavingsGoal } from '../../types/goal';
import ProgressRing from '../ui/ProgressRing';
import Confetti from '../ui/Confetti';
import { formatPeso, clamp } from '../../lib/utils';
import { fadeUpItem } from '../../lib/motion';

interface GoalCardProps {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (id: string) => void;
}

const QUOTES = [
  'Every peso counts. Keep going!',
  'Discipline today, freedom tomorrow.',
  'Small savings, big dreams.',
  "You're closer than you think.",
];

function estimateDate(targetDate: string | null): string | null {
  if (!targetDate) return null;
  return new Date(targetDate + 'T00:00:00').toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const pct = clamp(goal.progressPercentage, 0, 100);
  const quote = QUOTES[goal.goalName.length % QUOTES.length];
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <motion.div variants={fadeUpItem} whileHover={{ y: -4 }} className="card relative overflow-hidden p-5">
      {goal.completed && <Confetti />}

      <div className="flex items-center gap-4">
        <ProgressRing
          progress={pct}
          size={84}
          stroke={9}
          colorClass={goal.completed ? 'text-emerald-500' : 'text-accent'}
        >
          <div className="text-center">
            <p className="font-display text-base font-extrabold text-ink">{pct.toFixed(0)}%</p>
          </div>
        </ProgressRing>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-display text-base font-bold text-ink">{goal.goalName}</p>
            {goal.completed && (
              <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300">
                <Trophy size={12} /> Done
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            <span className="font-semibold text-ink">{formatPeso(goal.currentAmount)}</span> of{' '}
            {formatPeso(goal.targetAmount)}
          </p>
          {goal.targetDate && (
            <p className="mt-1 flex items-center gap-1 text-xs text-ink-faint">
              <CalendarClock size={12} /> Target {estimateDate(goal.targetDate)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-surface-soft/60 px-3 py-2">
        <p className="text-xs text-ink-soft">
          {goal.completed ? '🎉 Goal reached — amazing discipline!' : `${formatPeso(remaining)} to go · ${quote}`}
        </p>
      </div>

      <div className="mt-3 flex gap-2 border-t border-surface-border/60 pt-3">
        <button
          onClick={() => onEdit(goal)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-soft hover:text-nu-blue-600"
        >
          <Pencil size={13} /> Edit
        </button>
        <button
          onClick={() => onDelete(goal.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-soft hover:text-rose-500"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </motion.div>
  );
}

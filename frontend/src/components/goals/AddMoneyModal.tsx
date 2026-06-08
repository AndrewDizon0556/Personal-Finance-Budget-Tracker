import { useEffect, useMemo, useState } from 'react';
import { PiggyBank, Wallet, AlertCircle, Loader2 } from 'lucide-react';
import type { SavingsGoal } from '../../types/goal';
import Modal from '../ui/Modal';
import { formatPeso } from '../../lib/utils';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  /** The user's current spendable balance — the cap for a contribution. */
  remainingBalance: number;
  /** Resolves on success; rejects with a message to show inline on failure. */
  onConfirm: (amount: number) => Promise<void>;
}

const QUICK = [100, 500, 1000];

export default function AddMoneyModal({ isOpen, onClose, goal, remainingBalance, onConfirm }: AddMoneyModalProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValue('');
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen, goal?.id]);

  const amount = useMemo(() => {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  }, [value]);

  if (!goal) return null;

  const toGoal = Math.max(0, goal.targetAmount - goal.currentAmount);
  // The most you can add: capped by both what's left to spend and what's left to reach the goal.
  const maxAddable = Math.max(0, Math.min(remainingBalance, toGoal));
  const overBalance = amount > remainingBalance;
  const valid = amount > 0 && !overBalance;

  const submit = async () => {
    setError(null);
    if (amount <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    if (overBalance) {
      setError(`That's more than your remaining balance of ${formatPeso(remainingBalance)}.`);
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm(amount);
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message ?? e.message ?? 'Could not add money. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Money">
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl bg-surface-soft/60 px-4 py-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-nu-gold-100 text-nu-gold-700 dark:bg-nu-gold-500/20 dark:text-nu-gold-300">
            <PiggyBank size={20} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{goal.goalName}</p>
            <p className="text-xs text-ink-soft">
              {formatPeso(goal.currentAmount)} of {formatPeso(goal.targetAmount)} · {formatPeso(toGoal)} to go
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-surface-border/70 px-4 py-3">
          <span className="flex items-center gap-2 text-sm text-ink-soft">
            <Wallet size={16} className="text-ink-faint" /> Remaining balance
          </span>
          <span className="font-display text-sm font-bold text-ink">{formatPeso(remainingBalance)}</span>
        </div>

        <div>
          <label htmlFor="add-money" className="mb-1.5 block text-sm font-medium text-ink">
            Amount to add
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">₱</span>
            <input
              id="add-money"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              autoFocus
              placeholder="0.00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && valid && submit()}
              className={`input-field pl-8 ${overBalance ? 'border-rose-400 focus:border-rose-400' : ''}`}
            />
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                disabled={q > remainingBalance}
                onClick={() => setValue(String(q))}
                className="chip bg-surface-soft text-ink-soft hover:bg-nu-gold-100 hover:text-nu-gold-700 disabled:opacity-40 disabled:hover:bg-surface-soft disabled:hover:text-ink-soft dark:hover:bg-nu-gold-500/20 dark:hover:text-nu-gold-300"
              >
                +{formatPeso(q)}
              </button>
            ))}
            {maxAddable > 0 && (
              <button
                type="button"
                onClick={() => setValue(String(maxAddable))}
                className="chip bg-surface-soft text-ink-soft hover:bg-nu-gold-100 hover:text-nu-gold-700 dark:hover:bg-nu-gold-500/20 dark:hover:text-nu-gold-300"
              >
                Max {formatPeso(maxAddable)}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle size={16} className="shrink-0" /> {error}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={!valid || submitting} className="btn-gold flex-1">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <PiggyBank size={18} />}
            {submitting ? 'Adding…' : 'Add Money'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

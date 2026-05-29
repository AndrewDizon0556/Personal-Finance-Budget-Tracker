import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import type { Expense, ExpenseCategory } from '../../types/expense';
import Modal from '../ui/Modal';

const expenseSchema = z.object({
  categoryId: z.string().optional(),
  amount: z.coerce
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than zero'),
  notes: z.string().optional(),
  expenseDate: z.string().min(1, 'Date is required'),
  transactionType: z.enum(['EXPENSE', 'INCOME']).default('EXPENSE'),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  categories: ExpenseCategory[];
  editingExpense?: Expense | null;
}

export default function ExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  editingExpense,
}: ExpenseModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { transactionType: 'EXPENSE' },
  });

  const type = watch('transactionType');

  useEffect(() => {
    if (editingExpense) {
      reset({
        categoryId: editingExpense.categoryId ?? '',
        amount: editingExpense.amount,
        notes: editingExpense.notes ?? '',
        expenseDate: editingExpense.expenseDate,
        transactionType: editingExpense.transactionType,
      });
    } else {
      reset({
        categoryId: '',
        amount: undefined,
        notes: '',
        expenseDate: new Date().toISOString().split('T')[0],
        transactionType: 'EXPENSE',
      });
    }
  }, [editingExpense, reset, isOpen]);

  const handleFormSubmit = async (data: ExpenseFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingExpense ? 'Edit Transaction' : 'Add Transaction'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setValue('transactionType', 'EXPENSE')}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
              type === 'EXPENSE'
                ? 'border-nu-gold-400 bg-nu-gold-50 text-nu-gold-700 dark:bg-nu-gold-500/10'
                : 'border-surface-border text-ink-soft hover:border-surface-border'
            }`}
          >
            <ArrowDownCircle size={18} /> Expense
          </button>
          <button
            type="button"
            onClick={() => setValue('transactionType', 'INCOME')}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
              type === 'INCOME'
                ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10'
                : 'border-surface-border text-ink-soft hover:border-surface-border'
            }`}
          >
            <ArrowUpCircle size={18} /> Income
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Amount (₱)</label>
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            {...register('amount')}
            placeholder="0.00"
            className="input-field font-display text-lg font-bold"
          />
          {errors.amount && <p className="mt-1 text-xs text-rose-500">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Category</label>
          <select {...register('categoryId')} className="input-field">
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Date</label>
          <input type="date" {...register('expenseDate')} className="input-field" />
          {errors.expenseDate && <p className="mt-1 text-xs text-rose-500">{errors.expenseDate.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Notes <span className="font-normal text-ink-faint">(optional)</span>
          </label>
          <input type="text" {...register('notes')} placeholder="What was this for?" className="input-field" />
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Saving...' : editingExpense ? 'Save Changes' : 'Add'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

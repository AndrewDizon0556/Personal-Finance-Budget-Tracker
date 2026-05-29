import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Expense } from '../../types/expense';
import type { ExpenseCategory } from '../../types/expense';

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
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { transactionType: 'EXPENSE' },
  });

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

  if (!isOpen) return null;

  const handleFormSubmit = async (data: ExpenseFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm z-10">
        <h3 className="text-base font-semibold text-gray-800 mb-5">
          {editingExpense ? 'Edit Expense' : 'Add Expense'}
        </h3>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="flex gap-2">
            <label className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 text-sm cursor-pointer has-[:checked]:border-blue-400 has-[:checked]:bg-blue-50">
              <input type="radio" value="EXPENSE" {...register('transactionType')} className="accent-blue-600" />
              Expense
            </label>
            <label className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 text-sm cursor-pointer has-[:checked]:border-green-400 has-[:checked]:bg-green-50">
              <input type="radio" value="INCOME" {...register('transactionType')} className="accent-green-600" />
              Income
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₱)</label>
            <input
              type="number"
              step="0.01"
              {...register('amount')}
              placeholder="0.00"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select
              {...register('categoryId')}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
            <input
              type="date"
              {...register('expenseDate')}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
            {errors.expenseDate && (
              <p className="text-red-500 text-xs mt-1">{errors.expenseDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              {...register('notes')}
              placeholder="What was this for?"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : editingExpense ? 'Save Changes' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

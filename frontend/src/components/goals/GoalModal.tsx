import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { SavingsGoal } from '../../types/goal';

const goalSchema = z.object({
  goalName: z.string().min(1, 'Goal name is required'),
  targetAmount: z.coerce.number().positive('Target amount must be greater than zero'),
  currentAmount: z.coerce.number().min(0, 'Cannot be negative').optional(),
  targetDate: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GoalFormData) => Promise<void>;
  editingGoal?: SavingsGoal | null;
}

export default function GoalModal({ isOpen, onClose, onSubmit, editingGoal }: GoalModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({ resolver: zodResolver(goalSchema) });

  useEffect(() => {
    if (editingGoal) {
      reset({
        goalName: editingGoal.goalName,
        targetAmount: editingGoal.targetAmount,
        currentAmount: editingGoal.currentAmount,
        targetDate: editingGoal.targetDate ?? '',
      });
    } else {
      reset({ goalName: '', targetAmount: undefined, currentAmount: 0, targetDate: '' });
    }
  }, [editingGoal, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: GoalFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm z-10">
        <h3 className="text-base font-semibold text-gray-800 mb-5">
          {editingGoal ? 'Edit Goal' : 'New Savings Goal'}
        </h3>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Goal Name</label>
            <input
              type="text"
              {...register('goalName')}
              placeholder="e.g. Gaming Laptop"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
            {errors.goalName && (
              <p className="text-red-500 text-xs mt-1">{errors.goalName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Amount (₱)</label>
            <input
              type="number"
              step="0.01"
              {...register('targetAmount')}
              placeholder="0.00"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
            {errors.targetAmount && (
              <p className="text-red-500 text-xs mt-1">{errors.targetAmount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Amount Saved So Far (₱)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('currentAmount')}
              placeholder="0.00"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
            {errors.currentAmount && (
              <p className="text-red-500 text-xs mt-1">{errors.currentAmount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Target Date <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              {...register('targetDate')}
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
              {isSubmitting ? 'Saving...' : editingGoal ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

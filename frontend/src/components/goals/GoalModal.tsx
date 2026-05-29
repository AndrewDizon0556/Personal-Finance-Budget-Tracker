import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { SavingsGoal } from '../../types/goal';
import Modal from '../ui/Modal';
import TextField from '../ui/TextField';

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

  const handleFormSubmit = async (data: GoalFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingGoal ? 'Edit Goal' : 'New Savings Goal'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <TextField
          label="Goal Name"
          placeholder="e.g. Gaming Laptop"
          error={errors.goalName?.message}
          {...register('goalName')}
        />
        <TextField
          label="Target Amount (₱)"
          type="number"
          step="0.01"
          inputMode="decimal"
          placeholder="0.00"
          error={errors.targetAmount?.message}
          {...register('targetAmount')}
        />
        <TextField
          label="Amount Saved So Far (₱)"
          type="number"
          step="0.01"
          inputMode="decimal"
          placeholder="0.00"
          error={errors.currentAmount?.message}
          {...register('currentAmount')}
        />
        <TextField
          label="Target Date"
          hint="(optional)"
          type="date"
          error={errors.targetDate?.message}
          {...register('targetDate')}
        />

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Saving...' : editingGoal ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

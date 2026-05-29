import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Subscription } from '../../types/subscription';
import Modal from '../ui/Modal';
import TextField from '../ui/TextField';

const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  renewalDate: z.string().min(1, 'Renewal date is required'),
  active: z.boolean().default(true),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubscriptionFormData) => Promise<void>;
  editingSub?: Subscription | null;
}

export default function SubscriptionModal({ isOpen, onClose, onSubmit, editingSub }: SubscriptionModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionFormData>({ resolver: zodResolver(subscriptionSchema) });

  useEffect(() => {
    if (editingSub) {
      reset({
        name: editingSub.name,
        amount: editingSub.amount,
        renewalDate: editingSub.renewalDate,
        active: editingSub.active,
      });
    } else {
      reset({ name: '', amount: undefined, renewalDate: '', active: true });
    }
  }, [editingSub, reset, isOpen]);

  const handleFormSubmit = async (data: SubscriptionFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingSub ? 'Edit Subscription' : 'Add Subscription'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <TextField label="Name" placeholder="e.g. Spotify, Canva" error={errors.name?.message} {...register('name')} />
        <TextField
          label="Amount (₱)"
          type="number"
          step="0.01"
          inputMode="decimal"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register('amount')}
        />
        <TextField
          label="Renewal Date"
          type="date"
          error={errors.renewalDate?.message}
          {...register('renewalDate')}
        />

        <label className="flex cursor-pointer items-center gap-2.5 rounded-2xl bg-surface-soft/60 px-4 py-3 text-sm font-medium text-ink">
          <input type="checkbox" {...register('active')} className="h-4 w-4 accent-nu-blue-700" />
          Active subscription
        </label>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Saving...' : editingSub ? 'Save Changes' : 'Add'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

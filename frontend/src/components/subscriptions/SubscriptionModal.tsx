import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Subscription } from '../../types/subscription';
import Modal from '../ui/Modal';
import TextField from '../ui/TextField';
import Toggle from '../ui/Toggle';

const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  renewalDate: z.string().min(1, 'Renewal date is required'),
  active: z.boolean().default(true),
  category: z.string().optional(),
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
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionFormData>({ resolver: zodResolver(subscriptionSchema) });

  const active = watch('active');

  useEffect(() => {
    if (editingSub) {
      reset({
        name: editingSub.name,
        amount: editingSub.amount,
        renewalDate: editingSub.renewalDate,
        active: editingSub.active,
        category: editingSub.category ?? '',
      });
    } else {
      reset({ name: '', amount: undefined, renewalDate: '', active: true, category: '' });
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
        <TextField
          label="Category (optional)"
          placeholder="e.g. Entertainment, Leisure"
          error={errors.category?.message}
          {...register('category')}
        />

        <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface-soft/60 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">Active subscription</p>
            <p className="text-xs text-ink-soft">Inactive subscriptions are kept but skipped in your monthly total.</p>
          </div>
          <Toggle
            checked={active ?? true}
            onChange={(v) => setValue('active', v, { shouldDirty: true })}
            aria-label="Active subscription"
          />
        </div>

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

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Subscription } from '../../types/subscription';

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

export default function SubscriptionModal({
  isOpen,
  onClose,
  onSubmit,
  editingSub,
}: SubscriptionModalProps) {
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

  if (!isOpen) return null;

  const handleFormSubmit = async (data: SubscriptionFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm z-10">
        <h3 className="text-base font-semibold text-gray-800 mb-5">
          {editingSub ? 'Edit Subscription' : 'Add Subscription'}
        </h3>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Spotify, Canva"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
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
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Renewal Date</label>
            <input
              type="date"
              {...register('renewalDate')}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
            {errors.renewalDate && (
              <p className="text-red-500 text-xs mt-1">{errors.renewalDate.message}</p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" {...register('active')} className="accent-blue-600 w-4 h-4" />
            Active
          </label>

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
              {isSubmitting ? 'Saving...' : editingSub ? 'Save Changes' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

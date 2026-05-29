import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, Check, Trash2, Calculator } from 'lucide-react';
import splitBillService from '../services/splitBillService';
import type { SplitBill } from '../types/splitBill';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import TextField from '../components/ui/TextField';
import { formatPeso, formatShortDate } from '../lib/utils';

const splitSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  totalAmount: z.coerce.number().positive('Amount must be greater than zero'),
  memberCount: z.coerce.number().int().min(2, 'Need at least 2 members'),
});

type SplitFormData = z.infer<typeof splitSchema>;

export default function SplitBillsPage() {
  const [bills, setBills] = useState<SplitBill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SplitFormData>({ resolver: zodResolver(splitSchema) });

  const totalAmount = watch('totalAmount');
  const memberCount = watch('memberCount');
  const liveShare = totalAmount > 0 && memberCount >= 2 ? totalAmount / memberCount : null;

  useEffect(() => {
    splitBillService
      .getSplitBills()
      .then(setBills)
      .catch(() => setActionError('Failed to load split bills.'))
      .finally(() => setIsLoading(false));
  }, []);

  const onSubmit = async (data: SplitFormData) => {
    setActionError(null);
    try {
      const result = await splitBillService.createSplitBill(data);
      setBills((prev) => [result, ...prev]);
      reset();
    } catch {
      setActionError('Failed to create split bill.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this split bill?')) return;
    try {
      await splitBillService.deleteSplitBill(id);
      setBills((prev) => prev.filter((b) => b.id !== id));
    } catch {
      setActionError('Failed to delete.');
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader title="Split Bills" subtitle="Divide the bill, keep the barkada happy." />

      {/* Calculator */}
      <div className="card mb-6 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Calculator size={18} className="text-accent" />
          <p className="text-sm font-semibold text-ink">Calculate Split</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextField
            label="What's this for?"
            placeholder="e.g. Group dinner, Grab ride"
            error={errors.title?.message}
            {...register('title')}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Total Amount (₱)"
              type="number"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              error={errors.totalAmount?.message}
              {...register('totalAmount')}
            />
            <TextField
              label="Members"
              type="number"
              min="2"
              placeholder="2"
              error={errors.memberCount?.message}
              {...register('memberCount')}
            />
          </div>

          <AnimatePresence>
            {liveShare !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl bg-nu-gradient p-4 text-center text-white">
                  <p className="text-xs text-white/70">Each person pays</p>
                  <p className="font-display text-3xl font-extrabold">{formatPeso(liveShare)}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Calculating...' : 'Calculate & Save'}
          </button>
        </form>
      </div>

      {actionError && (
        <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10">
          {actionError}
        </div>
      )}

      <p className="mb-3 text-sm font-semibold text-ink">History</p>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton h-20 w-full" />
          ))}
        </div>
      ) : bills.length === 0 ? (
        <EmptyState icon={Users} title="No split bills yet" message="Calculate your first split above and it'll show up here." />
      ) : (
        <div className="space-y-2.5">
          {bills.map((bill) => (
            <div key={bill.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{bill.title}</p>
                  <p className="text-xs text-ink-faint">
                    {bill.memberCount} members · {formatShortDate(bill.createdAt)}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">{bill.shareMessage}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-base font-bold text-ink">
                    {formatPeso(bill.amountPerMember)}
                    <span className="text-xs font-normal text-ink-faint">/person</span>
                  </p>
                  <div className="mt-1 flex items-center justify-end gap-1">
                    <button
                      onClick={() => copyToClipboard(bill.id, bill.shareMessage)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-ink-faint hover:bg-surface-soft hover:text-nu-blue-600"
                    >
                      {copiedId === bill.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(bill.id)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-ink-faint hover:bg-surface-soft hover:text-rose-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import splitBillService from '../services/splitBillService';
import type { SplitBill } from '../types/splitBill';

const splitSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  totalAmount: z.coerce.number().positive('Amount must be greater than zero'),
  memberCount: z.coerce.number().int().min(2, 'Need at least 2 members'),
});

type SplitFormData = z.infer<typeof splitSchema>;

const formatPeso = (amount: number) =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function SplitBillsPage() {
  const [bills, setBills] = useState<SplitBill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [latestResult, setLatestResult] = useState<SplitBill | null>(null);
  const [copied, setCopied] = useState(false);
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
  const liveShare =
    totalAmount > 0 && memberCount >= 2
      ? totalAmount / memberCount
      : null;

  useEffect(() => {
    splitBillService.getSplitBills()
      .then(setBills)
      .catch(() => setActionError('Failed to load split bills.'))
      .finally(() => setIsLoading(false));
  }, []);

  const onSubmit = async (data: SplitFormData) => {
    setActionError(null);
    try {
      const result = await splitBillService.createSplitBill(data);
      setBills((prev) => [result, ...prev]);
      setLatestResult(result);
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
      if (latestResult?.id === id) setLatestResult(null);
    } catch {
      setActionError('Failed to delete.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Split Bills</h1>

      {/* Calculator */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-4">Calculate Split</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">What's this for?</label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Group dinner, Grab ride"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Amount (₱)</label>
              <input
                type="number"
                step="0.01"
                {...register('totalAmount')}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
              {errors.totalAmount && (
                <p className="text-red-500 text-xs mt-1">{errors.totalAmount.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Members</label>
              <input
                type="number"
                {...register('memberCount')}
                placeholder="2"
                min="2"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
              {errors.memberCount && (
                <p className="text-red-500 text-xs mt-1">{errors.memberCount.message}</p>
              )}
            </div>
          </div>

          {/* Live preview */}
          {liveShare !== null && (
            <div className="bg-blue-50 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-blue-400 mb-0.5">Each person pays</p>
              <p className="text-2xl font-bold text-blue-600">{formatPeso(liveShare)}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Calculating...' : 'Calculate & Save'}
          </button>
        </form>

        {/* Latest result with copy button */}
        {latestResult && (
          <div className="mt-4 bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-sm text-gray-600 flex-1">{latestResult.shareMessage}</p>
            <button
              onClick={() => copyToClipboard(latestResult.shareMessage)}
              className="text-xs text-blue-500 font-medium shrink-0 hover:underline"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      {actionError && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{actionError}</div>
      )}

      {/* History */}
      <p className="text-sm font-semibold text-gray-700 mb-3">History</p>

      {isLoading ? (
        <p className="text-center text-gray-400 text-sm py-8">Loading...</p>
      ) : bills.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">No split bills saved yet.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {bills.map((bill, i) => (
            <div
              key={bill.id}
              className={`px-5 py-4 ${i !== bills.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{bill.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {bill.memberCount} members · {formatDateTime(bill.createdAt)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{bill.shareMessage}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-sm font-semibold text-gray-700">
                    {formatPeso(bill.amountPerMember)}<span className="text-xs text-gray-400 font-normal">/person</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(bill.shareMessage)}
                    className="text-xs text-blue-400 hover:text-blue-600"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => handleDelete(bill.id)}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

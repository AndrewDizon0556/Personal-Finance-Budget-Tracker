import { useEffect, useState } from 'react';
import { useSubscriptionStore } from '../store/subscriptionStore';
import type { Subscription, SubscriptionPayload } from '../types/subscription';
import SubscriptionModal from '../components/subscriptions/SubscriptionModal';

const formatPeso = (amount: number) =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
};

function renewalBadge(days: number, active: boolean) {
  if (!active) return { label: 'Inactive', cls: 'bg-gray-100 text-gray-400' };
  if (days < 0) return { label: 'Overdue', cls: 'bg-red-100 text-red-600' };
  if (days === 0) return { label: 'Due today', cls: 'bg-red-100 text-red-600' };
  if (days <= 3) return { label: `${days}d`, cls: 'bg-orange-100 text-orange-600' };
  if (days <= 7) return { label: `${days}d`, cls: 'bg-yellow-100 text-yellow-600' };
  return { label: `${days}d`, cls: 'bg-green-100 text-green-600' };
}

export default function SubscriptionsPage() {
  const { subscriptions, isLoading, error, fetchSubscriptions, addSubscription, editSubscription, removeSubscription } =
    useSubscriptionStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const totalMonthly = subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => sum + s.amount, 0);

  const handleSubmit = async (data: SubscriptionPayload) => {
    setActionError(null);
    try {
      if (editingSub) {
        await editSubscription(editingSub.id, data);
      } else {
        await addSubscription(data);
      }
    } catch {
      setActionError('Failed to save subscription.');
      throw new Error('submit failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this subscription?')) return;
    try {
      await removeSubscription(id);
    } catch {
      setActionError('Failed to delete subscription.');
    }
  };

  const openEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingSub(null);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Subscriptions</h1>
          {subscriptions.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              Monthly total: <span className="font-medium text-gray-600">{formatPeso(totalMonthly)}</span>
            </p>
          )}
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700"
        >
          + Add
        </button>
      </div>

      {actionError && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{actionError}</div>
      )}

      {isLoading ? (
        <p className="text-center text-gray-400 text-sm py-12">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-400 text-sm py-12">{error}</p>
      ) : subscriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm">No subscriptions yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {subscriptions.map((sub, i) => {
            const badge = renewalBadge(sub.daysUntilRenewal, sub.active);
            return (
              <div
                key={sub.id}
                className={`flex items-center justify-between px-5 py-4 ${
                  i !== subscriptions.length - 1 ? 'border-b border-gray-50' : ''
                } ${!sub.active ? 'opacity-50' : ''}`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{sub.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Renews {formatDate(sub.renewalDate)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                    {badge.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">{formatPeso(sub.amount)}</span>
                  <button
                    onClick={() => openEdit(sub)}
                    className="text-xs text-gray-400 hover:text-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        editingSub={editingSub}
      />
    </div>
  );
}

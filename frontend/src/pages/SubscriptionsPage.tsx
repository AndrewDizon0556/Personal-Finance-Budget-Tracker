import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, RefreshCw, CalendarClock } from 'lucide-react';
import { useSubscriptionStore } from '../store/subscriptionStore';
import type { Subscription, SubscriptionPayload } from '../types/subscription';
import SubscriptionModal from '../components/subscriptions/SubscriptionModal';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import { formatPeso, formatShortDate } from '../lib/utils';
import { staggerContainer, fadeUpItem } from '../lib/motion';

function renewalBadge(days: number, active: boolean) {
  if (!active) return { label: 'Inactive', cls: 'bg-surface-soft text-ink-faint' };
  if (days < 0) return { label: 'Overdue', cls: 'bg-rose-100 text-rose-600 dark:bg-rose-500/25 dark:text-rose-300' };
  if (days === 0) return { label: 'Due today', cls: 'bg-rose-100 text-rose-600 dark:bg-rose-500/25 dark:text-rose-300' };
  if (days <= 3) return { label: `${days}d left`, cls: 'bg-orange-100 text-orange-600 dark:bg-orange-500/25 dark:text-orange-300' };
  if (days <= 7) return { label: `${days}d left`, cls: 'bg-nu-gold-100 text-nu-gold-700 dark:bg-nu-gold-500/25 dark:text-nu-gold-300' };
  return { label: `${days}d left`, cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-300' };
}

export default function SubscriptionsPage() {
  const { subscriptions, isLoading, error, fetchSubscriptions, addSubscription, editSubscription, removeSubscription } =
    useSubscriptionStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const totalMonthly = subscriptions.filter((s) => s.active).reduce((sum, s) => sum + s.amount, 0);

  const handleSubmit = async (data: SubscriptionPayload) => {
    if (editingSub) await editSubscription(editingSub.id, data);
    else await addSubscription(data);
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this subscription?')) return;
    await removeSubscription(id);
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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Subscriptions"
        subtitle="Keep track of recurring charges."
        action={
          <button onClick={openCreate} className="btn-gold hidden sm:inline-flex">
            <Plus size={18} /> Add
          </button>
        }
      />

      {subscriptions.length > 0 && (
        <div className="card mb-5 flex items-center gap-4 p-5">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-nu-gradient text-nu-gold-300">
            <RefreshCw size={22} />
          </span>
          <div>
            <p className="text-xs text-ink-faint">Active monthly total</p>
            <p className="font-display text-2xl font-extrabold text-ink">
              <AnimatedNumber value={totalMonthly} format={(n) => formatPeso(n)} />
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={RefreshCw} title="Couldn't load subscriptions" message={error} />
      ) : subscriptions.length === 0 ? (
        <EmptyState
          icon={RefreshCw}
          title="No subscriptions yet"
          message="Add Spotify, Canva, or any recurring charge so you never get surprised by a renewal again."
          action={
            <button onClick={openCreate} className="btn-gold">
              <Plus size={18} /> Add Subscription
            </button>
          }
        />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-2.5">
          {subscriptions.map((sub) => {
            const badge = renewalBadge(sub.daysUntilRenewal, sub.active);
            return (
              <motion.div
                key={sub.id}
                variants={fadeUpItem}
                className={`card group flex items-center gap-3 p-4 ${!sub.active ? 'opacity-60' : ''}`}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-nu-blue-100 text-nu-blue-700 dark:bg-nu-blue-500/25 dark:text-nu-blue-300">
                  <CalendarClock size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{sub.name}</p>
                  <p className="text-xs text-ink-faint">Renews {formatShortDate(sub.renewalDate)}</p>
                </div>
                <span className={`chip ${badge.cls}`}>{badge.label}</span>
                <span className="font-display text-sm font-bold text-ink">{formatPeso(sub.amount)}</span>
                <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => openEdit(sub)} className="grid h-7 w-7 place-items-center rounded-lg text-ink-faint hover:bg-surface-soft hover:text-nu-blue-600">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(sub.id)} className="grid h-7 w-7 place-items-center rounded-lg text-ink-faint hover:bg-surface-soft hover:text-rose-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
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

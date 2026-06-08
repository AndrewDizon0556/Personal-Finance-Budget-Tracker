import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, PiggyBank, Flag, Wallet, CheckCircle2, X } from 'lucide-react';
import { useGoalStore } from '../store/goalStore';
import { useUiStore } from '../store/uiStore';
import type { SavingsGoal, SavingsGoalPayload } from '../types/goal';
import GoalCard from '../components/goals/GoalCard';
import GoalModal from '../components/goals/GoalModal';
import AddMoneyModal from '../components/goals/AddMoneyModal';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import EmptyStateGuide from '../components/help/EmptyStateGuide';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import dashboardService from '../services/dashboardService';
import { formatPeso } from '../lib/utils';
import { staggerContainer } from '../lib/motion';
import { TOOLTIPS } from '../lib/helpContent';

export default function GoalsPage() {
  const { goals, isLoading, error, fetchGoals, addGoal, editGoal, contributeToGoal, removeGoal } = useGoalStore();
  const mutationTick = useUiStore((s) => s.mutationTick);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [addMoneyGoal, setAddMoneyGoal] = useState<SavingsGoal | null>(null);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchGoals();
  }, []);

  // Keep the spendable balance fresh — it's the cap for contributions and it
  // changes whenever the user spends, earns, or saves elsewhere in the app.
  useEffect(() => {
    let active = true;
    dashboardService
      .getDashboard()
      .then((d) => active && setRemainingBalance(d.remainingBalance))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [mutationTick]);

  // Auto-dismiss the success toast.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Deep-link from the quick-action FAB ("Create Goal") opens the form straight away.
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingGoal(null);
      setIsModalOpen(true);
      searchParams.delete('new');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const completedCount = goals.filter((g) => g.completed).length;

  const handleSubmit = async (data: SavingsGoalPayload) => {
    if (editingGoal) await editGoal(editingGoal.id, data);
    else await addGoal(data);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this goal?')) return;
    await removeGoal(id);
  };

  const openEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };
  const openCreate = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };
  const openAddMoney = (goal: SavingsGoal) => setAddMoneyGoal(goal);

  // Rejections bubble up so the modal can show the error and stay open.
  const handleContribute = async (amount: number) => {
    if (!addMoneyGoal) return;
    const name = addMoneyGoal.goalName;
    await contributeToGoal(addMoneyGoal.id, amount);
    setToast(`Added ${formatPeso(amount)} to ${name}.`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Savings Goals"
        help={TOOLTIPS.goals}
        subtitle="Turn your dreams into milestones."
        action={
          <button onClick={openCreate} className="btn-gold hidden sm:inline-flex">
            <Plus size={18} /> New Goal
          </button>
        }
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          >
            <CheckCircle2 size={16} className="shrink-0" />
            <span className="flex-1">{toast}</span>
            <button onClick={() => setToast(null)} aria-label="Dismiss" className="text-emerald-600/70 hover:text-emerald-700 dark:text-emerald-300/70">
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {goals.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <SummaryStat icon={Wallet} label="Available to save" value={remainingBalance} />
          <SummaryStat icon={PiggyBank} label="Total saved" value={totalSaved} />
          <SummaryStat icon={Target} label="Total target" value={totalTarget} />
          <div className="card flex items-center gap-3 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-300">
              <Flag size={18} />
            </span>
            <div>
              <p className="text-xs text-ink-faint">Completed</p>
              <p className="font-display text-lg font-bold text-ink">
                {completedCount}/{goals.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton h-44 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={Target} title="Couldn't load goals" message={error} />
      ) : goals.length === 0 ? (
        <EmptyStateGuide
          emoji="🎯"
          title="No savings goals yet"
          message="Create a goal and track your progress until you reach your target — a laptop, tuition, or a barkada trip."
          actionLabel="Create a Goal"
          onAction={openCreate}
          helpHref="/help#savings"
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onAddMoney={openAddMoney}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </motion.div>
      )}

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        editingGoal={editingGoal}
      />

      <AddMoneyModal
        isOpen={addMoneyGoal !== null}
        onClose={() => setAddMoneyGoal(null)}
        goal={addMoneyGoal}
        remainingBalance={remainingBalance}
        onConfirm={handleContribute}
      />
    </div>
  );
}

function SummaryStat({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: number }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-nu-blue-100 text-nu-blue-700 dark:bg-nu-blue-500/25 dark:text-nu-blue-300">
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-ink-faint">{label}</p>
        <p className="font-display text-lg font-bold text-ink">
          <AnimatedNumber value={value} format={(n) => formatPeso(n)} />
        </p>
      </div>
    </div>
  );
}

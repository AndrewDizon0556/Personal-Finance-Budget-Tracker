import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, PiggyBank, Flag } from 'lucide-react';
import { useGoalStore } from '../store/goalStore';
import type { SavingsGoal, SavingsGoalPayload } from '../types/goal';
import GoalCard from '../components/goals/GoalCard';
import GoalModal from '../components/goals/GoalModal';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import EmptyStateGuide from '../components/help/EmptyStateGuide';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import { formatPeso } from '../lib/utils';
import { staggerContainer } from '../lib/motion';
import { TOOLTIPS } from '../lib/helpContent';

export default function GoalsPage() {
  const { goals, isLoading, error, fetchGoals, addGoal, editGoal, removeGoal } = useGoalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

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

      {goals.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <SummaryStat icon={PiggyBank} label="Total saved" value={totalSaved} />
          <SummaryStat icon={Target} label="Total target" value={totalTarget} />
          <div className="card flex items-center gap-3 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
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
            <GoalCard key={goal.id} goal={goal} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </motion.div>
      )}

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        editingGoal={editingGoal}
      />
    </div>
  );
}

function SummaryStat({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: number }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-nu-blue-100 text-nu-blue-700 dark:bg-nu-blue-500/15">
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

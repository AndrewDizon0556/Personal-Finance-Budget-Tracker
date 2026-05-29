import { useEffect, useState } from 'react';
import { useGoalStore } from '../store/goalStore';
import type { SavingsGoal, SavingsGoalPayload } from '../types/goal';
import GoalCard from '../components/goals/GoalCard';
import GoalModal from '../components/goals/GoalModal';

const formatPeso = (amount: number) =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export default function GoalsPage() {
  const { goals, isLoading, error, fetchGoals, addGoal, editGoal, removeGoal } = useGoalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const completedCount = goals.filter((g) => g.completed).length;

  const handleSubmit = async (data: SavingsGoalPayload) => {
    setActionError(null);
    try {
      if (editingGoal) {
        await editGoal(editingGoal.id, data);
      } else {
        await addGoal(data);
      }
    } catch {
      setActionError('Failed to save goal. Please try again.');
      throw new Error('submit failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await removeGoal(id);
    } catch {
      setActionError('Failed to delete goal.');
    }
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
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Savings Goals</h1>
          {goals.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {completedCount} of {goals.length} completed
            </p>
          )}
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700"
        >
          + New Goal
        </button>
      </div>

      {/* Summary strip */}
      {goals.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-5 flex gap-6">
          <div>
            <p className="text-xs text-gray-400">Total Saved</p>
            <p className="text-base font-bold text-gray-800">{formatPeso(totalSaved)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Target</p>
            <p className="text-base font-bold text-gray-800">{formatPeso(totalTarget)}</p>
          </div>
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{actionError}</div>
      )}

      {isLoading ? (
        <p className="text-center text-gray-400 text-sm py-12">Loading goals...</p>
      ) : error ? (
        <p className="text-center text-red-400 text-sm py-12">{error}</p>
      ) : goals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm">No savings goals yet.</p>
          <p className="text-gray-300 text-xs mt-1">Create one to start tracking your progress.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
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

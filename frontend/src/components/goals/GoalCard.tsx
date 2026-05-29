import type { SavingsGoal } from '../../types/goal';

interface GoalCardProps {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (id: string) => void;
}

const formatPeso = (amount: number) =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const pct = Math.min(goal.progressPercentage, 100);
  const barColor = goal.completed ? 'bg-green-400' : pct >= 60 ? 'bg-blue-400' : 'bg-blue-300';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">{goal.goalName}</p>
          {goal.targetDate && (
            <p className="text-xs text-gray-400 mt-0.5">Target: {formatDate(goal.targetDate)}</p>
          )}
        </div>
        {goal.completed && (
          <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            Completed
          </span>
        )}
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>{formatPeso(goal.currentAmount)} saved</span>
          <span>{formatPeso(goal.targetAmount)} goal</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1 text-right">{pct.toFixed(1)}%</p>
      </div>

      <div className="flex gap-2 pt-1 border-t border-gray-50">
        <button
          onClick={() => onEdit(goal)}
          className="flex-1 text-xs text-gray-500 hover:text-blue-600 py-1.5"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(goal.id)}
          className="flex-1 text-xs text-gray-500 hover:text-red-500 py-1.5"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

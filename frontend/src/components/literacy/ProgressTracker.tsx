import { BookOpen, Flame, Star, TrendingUp } from 'lucide-react';
import type { UserProgress } from '../../types/lesson';

interface Props {
  progress: UserProgress;
}

const LEVEL_COLORS = {
  BEGINNER: 'text-sky-600 bg-sky-100 dark:bg-sky-500/15',
  INTERMEDIATE: 'text-amber-600 bg-amber-100 dark:bg-amber-500/15',
  ADVANCED: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15',
};

export default function ProgressTracker({ progress }: Props) {
  const pct = Math.min(progress.completionPercentage, 100);

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-base font-bold text-ink">Your Progress</p>
        <span className={`chip ${LEVEL_COLORS[progress.level]}`}>
          {progress.level.charAt(0) + progress.level.slice(1).toLowerCase()}
        </span>
      </div>

      <p className="mb-4 text-sm text-ink-soft">{progress.levelMessage}</p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-xs text-ink-faint">
          <span>{progress.completedLessons}/{progress.totalLessons} lessons</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-soft">
          <div
            className="h-full rounded-full bg-nu-blue-600 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <Stat icon={BookOpen} label="Completed" value={String(progress.completedLessons)} color="text-nu-blue-600" />
        <Stat icon={Flame} label="Day Streak" value={progress.currentStreak > 0 ? `🔥 ${progress.currentStreak}` : '—'} color="text-amber-500" />
        <Stat icon={Star} label="Avg Score" value={progress.averageScore > 0 ? `${progress.averageScore}%` : '—'} color="text-emerald-500" />
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: typeof BookOpen; label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-surface-soft/60 px-2 py-3">
      <Icon size={15} className={`mb-1 ${color}`} />
      <p className="text-sm font-bold text-ink">{value}</p>
      <p className="text-[10px] text-ink-faint">{label}</p>
    </div>
  );
}

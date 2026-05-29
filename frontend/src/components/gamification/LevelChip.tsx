import { Flame, Star } from 'lucide-react';
import { useGamificationStore } from '../../store/gamificationStore';

/** Compact level + streak indicator for the navbar. */
export default function LevelChip() {
  const data = useGamificationStore((s) => s.data);
  const level = data?.level ?? 1;
  const streak = data?.currentStreak ?? 0;
  const pct = data ? Math.min(100, (data.xpIntoLevel / Math.max(1, data.xpForNextLevel)) * 100) : 0;

  return (
    <div className="hidden items-center gap-2 rounded-2xl border border-surface-border bg-surface-soft/60 px-3 py-1.5 sm:flex">
      <div className="grid h-6 w-6 place-items-center rounded-lg bg-nu-gradient-gold text-nu-blue-900">
        <Star size={13} fill="currentColor" />
      </div>
      <div className="leading-none">
        <p className="text-xs font-bold text-ink">Lv {level}</p>
        <div className="mt-1 h-1 w-12 overflow-hidden rounded-full bg-surface-border">
          <div className="h-full rounded-full bg-nu-gradient-gold" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {streak > 0 && (
        <span className="flex items-center gap-0.5 text-xs font-bold text-nu-gold-600">
          <Flame size={13} /> {streak}
        </span>
      )}
    </div>
  );
}

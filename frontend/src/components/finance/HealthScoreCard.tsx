import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Download } from 'lucide-react';
import financialHealthService from '../../services/financialHealthService';
import type { FinancialHealthScore } from '../../types/financialHealth';
import { fadeUpItem } from '../../lib/motion';

const LEVEL_COLORS = {
  POOR:      { ring: '#ef4444', bg: 'bg-rose-50 dark:bg-rose-500/10',   text: 'text-rose-700 dark:text-rose-400'      },
  FAIR:      { ring: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400'    },
  GOOD:      { ring: '#3b82f6', bg: 'bg-sky-50 dark:bg-sky-500/10',     text: 'text-sky-700 dark:text-sky-400'        },
  EXCELLENT: { ring: '#22c55e', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400' },
};

const STATUS_COLORS: Record<string, string> = {
  POOR: 'bg-rose-400', FAIR: 'bg-amber-400', GOOD: 'bg-sky-400', EXCELLENT: 'bg-emerald-400',
};

export default function HealthScoreCard() {
  const [data, setData] = useState<FinancialHealthScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    financialHealthService.getScore()
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="skeleton h-36 w-full rounded-3xl" />;
  if (!data) return null;

  const colors = LEVEL_COLORS[data.level];
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (data.score / 100) * circumference;

  return (
    <motion.div variants={fadeUpItem} className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-rose-500" />
          <p className="font-display text-sm font-bold text-ink">Financial Health</p>
        </div>
        <button
          onClick={() => financialHealthService.exportCsv()}
          className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold text-ink-soft hover:bg-surface-soft"
          title="Export this month as CSV"
        >
          <Download size={12} /> CSV
        </button>
      </div>

      <div className="flex items-center gap-5">
        {/* Score ring */}
        <div className="relative shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="38" fill="none" stroke="var(--color-surface-soft)" strokeWidth="8" />
            <circle
              cx="48" cy="48" r="38" fill="none"
              stroke={colors.ring} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 48 48)"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-display text-xl font-extrabold text-ink">{data.score}</p>
            <p className="text-[9px] font-semibold text-ink-faint">/ 100</p>
          </div>
        </div>

        {/* Factors mini-bars */}
        <div className="flex-1 min-w-0">
          <p className={`mb-2 text-xs font-semibold ${colors.text}`}>{data.level}</p>
          <div className="space-y-1.5">
            {data.factors.map(f => (
              <div key={f.name}>
                <div className="mb-0.5 flex justify-between text-[10px] text-ink-faint">
                  <span>{f.name}</span>
                  <span>{f.points}/{f.maxPoints}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className={`h-full rounded-full transition-all ${STATUS_COLORS[f.status] ?? 'bg-surface-border'}`}
                    style={{ width: `${(f.points / f.maxPoints) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`mt-4 rounded-2xl px-3 py-2 text-xs ${colors.bg} ${colors.text}`}>
        💡 {data.tip}
      </div>
    </motion.div>
  );
}

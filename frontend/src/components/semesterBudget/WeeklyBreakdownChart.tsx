import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { WeeklyBreakdown } from '../../types/semesterBudget';
import { formatPeso } from '../../lib/utils';

interface Props {
  weeks: WeeklyBreakdown[];
}

const STATUS_COLORS: Record<string, string> = {
  SAFE: '#22c55e',
  WARNING: '#f59e0b',
  OVERSPENT: '#ef4444',
  UPCOMING: '#94a3b8',
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: WeeklyBreakdown }[] }) {
  if (!active || !payload?.length) return null;
  const w = payload[0].payload;
  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-3 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-ink">Week {w.weekNumber}</p>
      <p className="text-ink-faint">
        {w.weekStart} → {w.weekEnd}
      </p>
      <p className="mt-1 text-ink-soft">
        Allocated: <span className="font-semibold text-ink">{formatPeso(w.allocatedAmount)}</span>
      </p>
      {w.status !== 'UPCOMING' && (
        <p className="text-ink-soft">
          Spent: <span className="font-semibold text-ink">{formatPeso(w.spentAmount)}</span>
        </p>
      )}
    </div>
  );
}

export default function WeeklyBreakdownChart({ weeks }: Props) {
  if (!weeks.length) return null;

  return (
    <div className="w-full">
      <p className="mb-3 text-sm font-semibold text-ink">Weekly Spending</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={weeks} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barSize={14}>
          <XAxis
            dataKey="weekNumber"
            tickFormatter={(v) => `W${v}`}
            tick={{ fontSize: 10, fill: 'var(--color-ink-faint)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <ReferenceLine
            y={weeks[0]?.allocatedAmount ?? 0}
            stroke="var(--color-ink-faint)"
            strokeDasharray="3 3"
          />
          <Bar dataKey="spentAmount" radius={[4, 4, 0, 0]}>
            {weeks.map((w) => (
              <Cell
                key={w.weekNumber}
                fill={STATUS_COLORS[w.status]}
                opacity={w.isCurrent ? 1 : 0.7}
                stroke={w.isCurrent ? STATUS_COLORS[w.status] : 'transparent'}
                strokeWidth={2}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-ink-faint">
        {(['SAFE', 'WARNING', 'OVERSPENT', 'UPCOMING'] as const).map((s) => (
          <span key={s} className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[s] }} />
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
}

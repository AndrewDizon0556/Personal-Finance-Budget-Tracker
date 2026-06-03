import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, ShieldCheck, AlertTriangle, Siren } from 'lucide-react';
import financialHealthService from '../../services/financialHealthService';
import type { AllowancePrediction } from '../../types/financialHealth';
import { formatPeso } from '../../lib/utils';
import { fadeUpItem } from '../../lib/motion';

const RISK = {
  GREEN:  { label: 'On track',  chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15', bar: '#22c55e', icon: ShieldCheck },
  YELLOW: { label: 'Slow down', chip: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15',       bar: '#f59e0b', icon: AlertTriangle },
  RED:    { label: 'Critical',  chip: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15',           bar: '#ef4444', icon: Siren },
};

const STATUS_BAR: Record<string, string> = {
  SAFE: '#22c55e', WARNING: '#f59e0b', CRITICAL: '#ef4444',
};

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'INCREASING')
    return <TrendingUp size={13} className="text-rose-500" />;
  if (trend === 'DECREASING')
    return <TrendingDown size={13} className="text-emerald-500" />;
  return <Minus size={13} className="text-ink-faint" />;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { weekStart: string; projectedSpend: number; projectedBalance: number; status: string } }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-2.5 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-ink">{new Date(d.weekStart + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</p>
      <p className="text-ink-soft">Spend: <span className="font-semibold text-ink">{formatPeso(d.projectedSpend)}</span></p>
      <p className="text-ink-soft">Balance: <span className="font-semibold text-ink">{formatPeso(d.projectedBalance)}</span></p>
    </div>
  );
}

export default function AllowanceRunwayCard() {
  const [data, setData] = useState<AllowancePrediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    financialHealthService.getPrediction()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="skeleton h-52 w-full rounded-3xl" />;
  if (!data) return null;

  const risk = RISK[data.riskLevel as keyof typeof RISK] ?? RISK.GREEN;
  const Icon = risk.icon;
  const days = data.estimatedDaysRemaining >= 999 ? '∞' : String(data.estimatedDaysRemaining);

  return (
    <motion.div variants={fadeUpItem} initial="hidden" animate="show" className="card p-5">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Allowance Runway</p>
        <span className={`chip ${risk.chip}`}>
          <Icon size={12} /> {risk.label}
        </span>
      </div>

      {/* Key numbers */}
      <div className="mb-3 grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] text-ink-faint">Estimated days</p>
          <p className={`font-display text-2xl font-extrabold ${
            data.riskLevel === 'RED' ? 'text-rose-500' :
            data.riskLevel === 'YELLOW' ? 'text-amber-500' : 'text-emerald-500'
          }`}>{days}</p>
        </div>
        <div>
          <p className="text-[10px] text-ink-faint">Recommended/day</p>
          <p className="font-display text-sm font-bold text-ink">{formatPeso(data.dailyRecommendedSpending)}</p>
        </div>
        <div>
          <p className="text-[10px] text-ink-faint">Spending trend</p>
          <span className="flex items-center gap-1 text-xs font-semibold text-ink">
            <TrendIcon trend={data.spendingTrend} />
            {data.spendingTrend.charAt(0) + data.spendingTrend.slice(1).toLowerCase()}
          </span>
        </div>
      </div>

      {/* 4-week projection chart */}
      {data.weeklyProjections.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-[10px] font-semibold text-ink-faint">4-Week Projection</p>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={data.weeklyProjections} margin={{ top: 2, right: 2, bottom: 0, left: 0 }} barSize={14}>
              <XAxis
                dataKey="weekNumber"
                tickFormatter={v => `W${v}`}
                tick={{ fontSize: 9, fill: 'var(--color-ink-faint)' }}
                axisLine={false} tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <ReferenceLine
                y={data.avgDailySpending * 7}
                stroke="var(--color-ink-faint)"
                strokeDasharray="3 3"
              />
              <Bar dataKey="projectedSpend" radius={[4, 4, 0, 0]}>
                {data.weeklyProjections.map(w => (
                  <Cell key={w.weekNumber} fill={STATUS_BAR[w.status] ?? STATUS_BAR.SAFE} opacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Smart tip */}
      <p className="rounded-2xl bg-surface-soft/60 px-3 py-2 text-xs text-ink-soft">
        💡 {data.smartTip}
      </p>

      {data.estimatedExhaustionDate && (
        <p className="mt-1.5 text-center text-[10px] text-ink-faint">
          Est. exhaustion: {new Date(data.estimatedExhaustionDate + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
        </p>
      )}
    </motion.div>
  );
}

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart3 } from 'lucide-react';
import ChartTooltip from './ChartTooltip';

interface WeeklySpendingChartProps {
  weeklyTotals: number[];
}

export default function WeeklySpendingChart({ weeklyTotals }: WeeklySpendingChartProps) {
  const data = weeklyTotals.slice(0, 4).map((total, i) => ({ week: `Week ${i + 1}`, amount: total }));
  const hasData = data.some((d) => d.amount > 0);

  if (!hasData) {
    return (
      <div className="flex h-44 flex-col items-center justify-center gap-2 text-ink-faint">
        <BarChart3 size={32} />
        <p className="text-sm">No weekly data yet.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="weeklyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#35408e" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#35408e" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--surface-border))" vertical={false} />
        <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'rgb(var(--ink-faint))' }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={(v) => `₱${v}`}
          tick={{ fontSize: 10, fill: 'rgb(var(--ink-faint))' }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#35408e', strokeWidth: 1, strokeDasharray: '4 4' }} />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#35408e"
          strokeWidth={2.5}
          fill="url(#weeklyFill)"
          animationDuration={900}
          dot={{ r: 4, fill: '#f5b300', strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#f5b300' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

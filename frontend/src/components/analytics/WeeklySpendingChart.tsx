import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface WeeklySpendingChartProps {
  weeklyTotals: number[];
}

const formatPeso = (value: number) =>
  `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`;

export default function WeeklySpendingChart({ weeklyTotals }: WeeklySpendingChartProps) {
  const data = weeklyTotals
    .slice(0, 4)
    .map((total, i) => ({ week: `Week ${i + 1}`, amount: total }));

  const hasData = data.some((d) => d.amount > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sm text-gray-400">No data available.</p>
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `₱${v}`}
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip formatter={(value: number) => formatPeso(value)} />
        <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.amount === maxAmount ? '#3b82f6' : '#bfdbfe'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

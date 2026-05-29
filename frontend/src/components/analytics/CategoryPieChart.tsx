import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import type { CategoryTotal } from '../../types/analytics';
import { categoryStyle } from '../../lib/categories';
import ChartTooltip from './ChartTooltip';

interface CategoryPieChartProps {
  data: CategoryTotal[];
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-2 text-ink-faint">
        <PieIcon size={32} />
        <p className="text-sm">No spending data this month.</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.categoryName,
    value: d.amount,
    fill: categoryStyle(d.categoryName).hex,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={62}
          outerRadius={98}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
          animationDuration={900}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

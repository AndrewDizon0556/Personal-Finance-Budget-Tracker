import type { TooltipProps } from 'recharts';
import { formatPeso } from '../../lib/utils';

/** Themed tooltip for recharts. */
export default function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="glass-strong rounded-2xl px-3 py-2 shadow-float">
      <p className="text-xs font-semibold text-ink">{item.name ?? label}</p>
      <p className="font-display text-sm font-bold text-nu-blue-700 dark:text-nu-gold-400">
        {formatPeso(Number(item.value))}
      </p>
    </div>
  );
}

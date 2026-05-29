import type { RunwayStatus } from '../../types/runway';

interface RunwayWidgetProps {
  runwayStatus: RunwayStatus;
  estimatedDaysRemaining: number;
  daysUntilNextAllowance: number;
  message: string;
}

const statusConfig: Record<RunwayStatus, { bg: string; text: string; badge: string; label: string }> = {
  SAFE: {
    bg: 'bg-green-50 border-green-100',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700',
    label: 'Safe',
  },
  WARNING: {
    bg: 'bg-yellow-50 border-yellow-100',
    text: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-700',
    label: 'Warning',
  },
  CRITICAL: {
    bg: 'bg-red-50 border-red-100',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    label: 'Critical',
  },
};

export default function RunwayWidget({
  runwayStatus,
  estimatedDaysRemaining,
  daysUntilNextAllowance,
  message,
}: RunwayWidgetProps) {
  const cfg = statusConfig[runwayStatus];

  return (
    <div className={`rounded-2xl border p-5 ${cfg.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-700">Allowance Runway</p>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      <div className="flex gap-6 mb-3">
        <div>
          <p className="text-xs text-gray-400">Estimated runway</p>
          <p className={`text-2xl font-bold ${cfg.text}`}>
            {estimatedDaysRemaining >= 999 ? '∞' : estimatedDaysRemaining}
            <span className="text-sm font-normal ml-1">days</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Until next allowance</p>
          <p className="text-2xl font-bold text-gray-700">
            {daysUntilNextAllowance}
            <span className="text-sm font-normal ml-1">days</span>
          </p>
        </div>
      </div>

      <p className={`text-xs ${cfg.text}`}>{message}</p>
    </div>
  );
}

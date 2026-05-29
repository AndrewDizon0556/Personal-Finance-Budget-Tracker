import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Siren } from 'lucide-react';
import type { RunwayStatus } from '../../types/runway';

interface RunwayWidgetProps {
  runwayStatus: RunwayStatus;
  estimatedDaysRemaining: number;
  daysUntilNextAllowance: number;
  message: string;
}

const statusConfig: Record<
  RunwayStatus,
  { ring: string; badge: string; icon: typeof ShieldCheck; label: string }
> = {
  SAFE: { ring: 'text-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15', icon: ShieldCheck, label: 'On track' },
  WARNING: { ring: 'text-nu-gold-500', badge: 'bg-nu-gold-100 text-nu-gold-700 dark:bg-nu-gold-500/15', icon: AlertTriangle, label: 'Slow down' },
  CRITICAL: { ring: 'text-rose-500', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15', icon: Siren, label: 'Critical' },
};

export default function RunwayWidget({
  runwayStatus,
  estimatedDaysRemaining,
  daysUntilNextAllowance,
  message,
}: RunwayWidgetProps) {
  const cfg = statusConfig[runwayStatus];
  const Icon = cfg.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Allowance Runway</p>
        <span className={`chip ${cfg.badge}`}>
          <Icon size={13} /> {cfg.label}
        </span>
      </div>

      <div className="flex gap-6">
        <div>
          <p className="text-xs text-ink-faint">Estimated runway</p>
          <p className={`font-display text-3xl font-extrabold ${cfg.ring}`}>
            {estimatedDaysRemaining >= 999 ? '∞' : estimatedDaysRemaining}
            <span className="ml-1 text-sm font-semibold text-ink-soft">days</span>
          </p>
        </div>
        <div className="border-l border-surface-border pl-6">
          <p className="text-xs text-ink-faint">Until next allowance</p>
          <p className="font-display text-3xl font-extrabold text-ink">
            {daysUntilNextAllowance}
            <span className="ml-1 text-sm font-semibold text-ink-soft">days</span>
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-ink-soft">{message}</p>
    </motion.div>
  );
}

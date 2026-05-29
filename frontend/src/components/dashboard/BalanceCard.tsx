import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import AnimatedNumber from '../ui/AnimatedNumber';
import { formatPeso, clamp } from '../../lib/utils';

interface BalanceCardProps {
  monthlyAllowance: number | null;
  totalSpent: number;
  remainingBalance: number;
  dailySafeSpend: number;
  daysLeft: number;
}

export default function BalanceCard({
  monthlyAllowance,
  totalSpent,
  remainingBalance,
  dailySafeSpend,
  daysLeft,
}: BalanceCardProps) {
  const allowance = monthlyAllowance ?? 0;
  const spentPct = allowance > 0 ? clamp((totalSpent / allowance) * 100, 0, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-4xl bg-nu-gradient p-6 text-white shadow-float sm:p-8"
    >
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-nu-gold-400/20 blur-3xl" />
      <div className="absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-nu-blue-400/30 blur-3xl" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/70">Remaining balance</p>
          <p className="mt-1 font-display text-4xl font-extrabold sm:text-5xl">
            <AnimatedNumber value={remainingBalance} format={(n) => formatPeso(n)} />
          </p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-nu-gold-300 backdrop-blur">
          <Wallet size={24} />
        </div>
      </div>

      <div className="relative mt-6">
        <div className="mb-1.5 flex items-center justify-between text-xs text-white/70">
          <span>Spent {formatPeso(totalSpent)}</span>
          <span>{allowance > 0 ? `of ${formatPeso(allowance)}` : 'No allowance set'}</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/15">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${spentPct}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className={`h-full rounded-full ${spentPct > 85 ? 'bg-rose-400' : 'bg-nu-gradient-gold'}`}
          />
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
          <p className="text-xs text-white/60">Safe to spend / day</p>
          <p className="mt-0.5 font-display text-lg font-bold">{formatPeso(dailySafeSpend)}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
          <p className="text-xs text-white/60">Days left</p>
          <p className="mt-0.5 font-display text-lg font-bold">{daysLeft} days</p>
        </div>
      </div>

      {monthlyAllowance === null && (
        <p className="relative mt-4 text-xs text-nu-gold-200">
          Set your monthly allowance in Settings to unlock your full balance view.
        </p>
      )}
    </motion.div>
  );
}

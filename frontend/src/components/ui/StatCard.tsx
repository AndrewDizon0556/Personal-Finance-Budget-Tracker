import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { fadeUpItem } from '../../lib/motion';
import AnimatedNumber from './AnimatedNumber';
import { formatPeso } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Optional percentage change vs previous period. */
  delta?: number;
  /** Use the bold gradient treatment (for the hero stat). */
  highlight?: boolean;
  /** Render value as currency (default) or raw number. */
  currency?: boolean;
  suffix?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  highlight = false,
  currency = true,
  suffix,
}: StatCardProps) {
  const format = (n: number) => (currency ? formatPeso(n) : Math.round(n).toLocaleString());

  return (
    <motion.div
      variants={fadeUpItem}
      whileHover={{ y: -4 }}
      className={
        highlight
          ? 'relative overflow-hidden rounded-3xl bg-nu-gradient p-5 text-white shadow-glow-blue'
          : 'card p-5'
      }
    >
      {highlight && <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-nu-gold-400/20 blur-2xl" />}
      <div className="relative flex items-start justify-between">
        <p className={`text-xs font-medium ${highlight ? 'text-white/70' : 'text-ink-faint'}`}>{label}</p>
        <div
          className={`grid h-9 w-9 place-items-center rounded-xl ${
            highlight
              ? 'bg-white/10 text-nu-gold-300'
              : 'bg-nu-blue-100 text-nu-blue-700 dark:bg-nu-blue-500/25 dark:text-nu-blue-200'
          }`}
        >
          <Icon size={18} />
        </div>
      </div>
      <p className={`relative mt-3 font-display text-2xl font-extrabold ${highlight ? 'text-white' : 'text-ink'}`}>
        <AnimatedNumber value={value} format={format} />
        {suffix && <span className="ml-1 text-sm font-semibold opacity-70">{suffix}</span>}
      </p>
      {typeof delta === 'number' && (
        <div
          className={`relative mt-1 inline-flex items-center gap-0.5 text-xs font-semibold ${
            delta >= 0 ? 'text-emerald-500' : 'text-rose-400'
          }`}
        >
          {delta >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(delta).toFixed(0)}% vs last week
        </div>
      )}
    </motion.div>
  );
}

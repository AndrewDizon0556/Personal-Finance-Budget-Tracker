import { motion } from 'framer-motion';
import { Sparkles, TrendingDown, TrendingUp, AlertTriangle, PartyPopper } from 'lucide-react';

export type InsightTone = 'positive' | 'warning' | 'info' | 'celebrate';

export interface Insight {
  tone: InsightTone;
  text: string;
}

const toneConfig: Record<InsightTone, { icon: typeof Sparkles; fg: string; bg: string }> = {
  positive: { icon: TrendingDown, fg: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
  warning: { icon: AlertTriangle, fg: 'text-nu-gold-700', bg: 'bg-nu-gold-100 dark:bg-nu-gold-500/15' },
  info: { icon: TrendingUp, fg: 'text-nu-blue-700', bg: 'bg-nu-blue-100 dark:bg-nu-blue-500/15' },
  celebrate: { icon: PartyPopper, fg: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-500/15' },
};

export default function InsightsWidget({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null;

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={16} className="text-accent" />
        <p className="text-sm font-semibold text-ink">Smart Insights</p>
      </div>
      <div className="space-y-2.5">
        {insights.map((ins, i) => {
          const cfg = toneConfig[ins.tone];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3 rounded-2xl bg-surface-soft/60 p-3"
            >
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${cfg.bg} ${cfg.fg}`}>
                <Icon size={16} />
              </span>
              <p className="text-sm text-ink-soft">{ins.text}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

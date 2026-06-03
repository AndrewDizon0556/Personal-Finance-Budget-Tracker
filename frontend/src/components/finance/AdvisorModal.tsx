import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, XCircle, X } from 'lucide-react';
import type { PurchaseAdvisor } from '../../types/financialHealth';
import { formatPeso } from '../../lib/utils';
import { popIn } from '../../lib/motion';

interface Props {
  isOpen: boolean;
  advice: PurchaseAdvisor | null;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const RISK_STYLES = {
  LOW:    { icon: CheckCircle2,   color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10',  border: 'border-emerald-200 dark:border-emerald-700/30' },
  MEDIUM: { icon: AlertTriangle,  color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-500/10',      border: 'border-amber-200 dark:border-amber-700/30'     },
  HIGH:   { icon: XCircle,        color: 'text-rose-600',    bg: 'bg-rose-50 dark:bg-rose-500/10',        border: 'border-rose-200 dark:border-rose-700/30'       },
};

export default function AdvisorModal({ isOpen, advice, isLoading, onConfirm, onCancel }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            variants={popIn} initial="hidden" animate="show" exit="exit"
            className="relative z-10 w-full max-w-sm rounded-3xl bg-surface p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display font-bold text-ink">Before You Buy</p>
              <button onClick={onCancel} className="rounded-xl p-1.5 hover:bg-surface-soft">
                <X size={16} className="text-ink-faint" />
              </button>
            </div>

            {isLoading && (
              <div className="space-y-3">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-4 w-2/3" />
              </div>
            )}

            {!isLoading && advice && (() => {
              const risk = advice.risk as keyof typeof RISK_STYLES;
              const { icon: Icon, color, bg, border } = RISK_STYLES[risk] ?? RISK_STYLES.LOW;
              return (
                <>
                  <div className={`mb-4 flex items-start gap-3 rounded-2xl border p-3 ${bg} ${border}`}>
                    <Icon size={18} className={`mt-0.5 shrink-0 ${color}`} />
                    <p className={`text-sm font-medium ${color}`}>{advice.advice}</p>
                  </div>

                  {advice.hasBudget && (
                    <div className="mb-4 space-y-2 text-sm">
                      <Row label="Daily budget" value={formatPeso(advice.dailyBudget)} />
                      <Row label="Spent today" value={formatPeso(advice.spentToday)} />
                      <Row label="Remaining before" value={formatPeso(advice.remainingTodayBefore)} />
                      <Row
                        label="Remaining after"
                        value={formatPeso(advice.remainingTodayAfter)}
                        highlight={advice.remainingTodayAfter < 0 ? 'rose' : undefined}
                      />
                      <div className="pt-1">
                        <p className="mb-1 text-xs text-ink-faint">Budget impact</p>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-soft">
                          <div
                            className={`h-full rounded-full ${risk === 'HIGH' ? 'bg-rose-500' : risk === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'}`}
                            style={{ width: `${Math.min(advice.budgetImpactPercent, 100)}%` }}
                          />
                        </div>
                        <p className="mt-0.5 text-right text-[10px] text-ink-faint">{advice.budgetImpactPercent.toFixed(0)}% of daily budget</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={onCancel} className="btn-ghost flex-1">Cancel</button>
                    <button onClick={onConfirm} className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold text-white transition-colors ${risk === 'HIGH' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-nu-blue-700 hover:bg-nu-blue-800'}`}>
                      {risk === 'HIGH' ? 'Save Anyway' : 'Save Expense'}
                    </button>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: 'rose' }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-faint">{label}</span>
      <span className={`font-semibold ${highlight === 'rose' ? 'text-rose-600' : 'text-ink'}`}>{value}</span>
    </div>
  );
}

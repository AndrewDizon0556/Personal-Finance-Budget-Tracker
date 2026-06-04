import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Lightbulb, X } from 'lucide-react';
import { useHelpStore } from '../../store/helpStore';
import type { GuideStep } from '../../lib/helpContent';

interface FeatureGuideProps {
  /** Stable id used to remember completion (see helpStore / user_help_preferences). */
  guideName: string;
  title: string;
  steps: GuideStep[];
}

/**
 * Inline, dismissible "how this works" card for more involved features.
 * Walks through numbered steps with a "Step X of N" progress indicator and
 * only auto-expands the first time — once completed it collapses to a slim
 * reopener so it never gets in the way again.
 */
export default function FeatureGuide({ guideName, title, steps }: FeatureGuideProps) {
  const completed = useHelpStore((s) => s.completed[guideName]);
  const tipsEnabled = useHelpStore((s) => s.tipsEnabled);
  const markCompleted = useHelpStore((s) => s.markCompleted);

  // Auto-open only for first-timers who haven't muted tips.
  const [open, setOpen] = useState(!completed && tipsEnabled);
  const [step, setStep] = useState(0);

  const last = step === steps.length - 1;

  const finish = () => {
    markCompleted(guideName);
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => {
          setStep(0);
          setOpen(true);
        }}
        className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-nu-blue-300 hover:text-nu-blue-700"
      >
        <Lightbulb size={13} className="text-nu-gold-500" /> How does {title.toLowerCase()} work?
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-5 overflow-hidden border-l-4 border-nu-blue-500 p-5"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-nu-blue-100 text-nu-blue-700 dark:bg-nu-blue-500/15">
            <Lightbulb size={16} />
          </span>
          <div>
            <p className="font-display text-sm font-bold text-ink">{title}</p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
              Step {step + 1} of {steps.length}
            </p>
          </div>
        </div>
        <button
          onClick={finish}
          aria-label="Dismiss guide"
          className="rounded-lg p-1 text-ink-faint transition-colors hover:bg-surface-soft hover:text-ink"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress dots */}
      <div className="mb-4 flex gap-1.5">
        {steps.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-nu-blue-600' : 'bg-surface-soft'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
          className="min-h-[3.25rem]"
        >
          <p className="text-sm font-semibold text-ink">{steps[step].title}</p>
          <p className="mt-0.5 text-sm text-ink-soft">{steps[step].description}</p>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1 text-sm font-semibold text-ink-soft transition-colors hover:text-ink disabled:opacity-0"
        >
          <ArrowLeft size={15} /> Back
        </button>
        {last ? (
          <button onClick={finish} className="btn-primary py-2">
            <Check size={16} /> Got it
          </button>
        ) : (
          <button onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} className="btn-primary py-2">
            Next <ArrowRight size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

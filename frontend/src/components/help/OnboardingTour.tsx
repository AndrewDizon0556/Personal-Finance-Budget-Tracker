import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useHelpStore } from '../../store/helpStore';
import { GUIDE, TOUR_STEPS } from '../../lib/helpContent';

/**
 * First-time guided walkthrough. A friendly, centered card sequence (not a
 * barrage of popups) that introduces the five core areas of the app. Opens
 * via helpStore.tourOpen — auto-triggered for new users and replayable from
 * Settings → Help. Skipping or finishing marks it complete so it never nags.
 */
export default function OnboardingTour() {
  const open = useHelpStore((s) => s.tourOpen);
  const closeTour = useHelpStore((s) => s.closeTour);
  const markCompleted = useHelpStore((s) => s.markCompleted);
  const [step, setStep] = useState(0);

  const finish = () => {
    markCompleted(GUIDE.WELCOME_TOUR);
    closeTour();
    setStep(0);
  };

  const current = TOUR_STEPS[step];
  const last = step === TOUR_STEPS.length - 1;
  const Icon = current?.icon;

  return (
    <AnimatePresence>
      {open && current && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={finish}
            className="absolute inset-0 bg-nu-blue-950/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="glass-strong relative z-10 w-full max-w-sm rounded-t-4xl p-6 sm:rounded-4xl"
          >
            {/* Skip */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                {step + 1} / {TOUR_STEPS.length}
              </span>
              <button onClick={finish} className="text-xs font-semibold text-ink-faint transition-colors hover:text-ink">
                Skip tour
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                className="text-center"
              >
                <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-nu-gradient text-white shadow-glow-blue">
                  {Icon && <Icon size={30} strokeWidth={2} />}
                </div>
                <h2 className="font-display text-xl font-extrabold text-ink">{current.title}</h2>
                <p className="mx-auto mt-2 max-w-xs text-sm text-ink-soft">{current.body}</p>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="my-5 flex justify-center gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? 'w-6 bg-nu-blue-600' : 'w-1.5 bg-surface-border'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              {step > 0 ? (
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <span />
              )}

              {last ? (
                <button onClick={finish} className="btn-gold">
                  <Check size={18} /> Start using Ipon
                </button>
              ) : (
                <button onClick={() => setStep((s) => Math.min(TOUR_STEPS.length - 1, s + 1))} className="btn-primary">
                  Next <ArrowRight size={18} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

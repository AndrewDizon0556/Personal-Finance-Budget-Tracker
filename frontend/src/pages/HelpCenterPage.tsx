import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, PlayCircle, Sparkles } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { HELP_SECTIONS, type HelpSection } from '../lib/helpContent';
import { useHelpStore } from '../store/helpStore';
import { staggerContainer, fadeUpItem } from '../lib/motion';

/**
 * /help — a calm, scannable reference. Each feature gets a short explanation,
 * a numbered how-to, and a few common questions. Deep-linkable via #section so
 * empty states and tooltips can point straight here.
 */
export default function HelpCenterPage() {
  const openTour = useHelpStore((s) => s.openTour);
  const { hash } = useLocation();
  const [active, setActive] = useState<string | null>(HELP_SECTIONS[0]?.id ?? null);

  // Honor deep links like /help#savings by expanding + scrolling to that section.
  useEffect(() => {
    const id = hash.replace('#', '');
    if (id && HELP_SECTIONS.some((s) => s.id === id)) {
      setActive(id);
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [hash]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <PageHeader title="Help Center" subtitle="Everything you need to make the most of Ipon Challenge." />

      {/* Replay the tour */}
      <button
        onClick={openTour}
        className="mb-6 flex w-full items-center gap-3 rounded-3xl bg-nu-gradient p-5 text-left text-white shadow-glow-blue transition-transform hover:-translate-y-0.5"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15">
          <PlayCircle size={22} />
        </span>
        <div className="flex-1">
          <p className="font-display text-sm font-bold">Take the guided tour</p>
          <p className="text-xs text-white/70">A 30-second walkthrough of the five core features.</p>
        </div>
        <Sparkles size={18} className="text-nu-gold-300" />
      </button>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-3">
        {HELP_SECTIONS.map((section) => (
          <AccordionSection
            key={section.id}
            section={section}
            open={active === section.id}
            onToggle={() => setActive((cur) => (cur === section.id ? null : section.id))}
          />
        ))}
      </motion.div>
    </div>
  );
}

function AccordionSection({
  section,
  open,
  onToggle,
}: {
  section: HelpSection;
  open: boolean;
  onToggle: () => void;
}) {
  const Icon = section.icon;
  return (
    <motion.div variants={fadeUpItem} id={section.id} className="card scroll-mt-24 overflow-hidden">
      <button onClick={onToggle} className="flex w-full items-center gap-3 p-5 text-left">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-nu-blue-100 text-nu-blue-700 dark:bg-nu-blue-500/25 dark:text-nu-blue-300">
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold text-ink">{section.title}</p>
          <p className="truncate text-xs text-ink-soft">{section.summary}</p>
        </div>
        <ChevronDown
          size={18}
          className={`shrink-0 text-ink-faint transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t border-surface-border/60 px-5 py-5">
              <p className="text-sm text-ink-soft">{section.summary}</p>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-faint">Step by step</p>
                <ol className="space-y-2">
                  {section.steps.map((stepText, i) => (
                    <li key={i} className="flex gap-3 text-sm text-ink">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-nu-blue-600 text-[11px] font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="text-ink-soft">{stepText}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-faint">Common questions</p>
                <div className="space-y-3">
                  {section.faqs.map((faq) => (
                    <div key={faq.q}>
                      <p className="text-sm font-semibold text-ink">{faq.q}</p>
                      <p className="mt-0.5 text-sm text-ink-soft">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

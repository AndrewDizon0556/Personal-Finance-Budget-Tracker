import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
  Target,
  Coins,
  BarChart3,
  FileText,
  GraduationCap,
  BookOpen,
  CreditCard,
  Users,
  Shield,
  Trophy,
  CalendarDays,
  HelpCircle,
} from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import BulldogMascot from './BulldogMascot';
import FabMenu, { type FabAction, type FabGroup } from './FabMenu';

/**
 * Coachy — the global budgeting-companion FAB. A friendly bulldog mascot fixed
 * bottom-right that springs into a quick-action menu (Add Expense / Income /
 * Savings / Goal / Allowance). The primary action adapts to the current page,
 * it breathes when idle, bounces on hover, and cheers after a successful save.
 *
 * Sits above the mobile bottom nav and respects safe-area insets; modals
 * (z-60+) intentionally render above it so it never overlaps a form.
 */
export default function FloatingActionButton() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const openExpenseModal = useUiStore((s) => s.openExpenseModal);
  const mutationTick = useUiStore((s) => s.mutationTick);
  const reduceMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Cheer the user on after any saved transaction (skips the initial mount).
  const lastTick = useRef(mutationTick);
  useEffect(() => {
    if (mutationTick === lastTick.current) return;
    lastTick.current = mutationTick;
    setOpen(false);
    setCelebrate(true);
    const t = setTimeout(() => setCelebrate(false), 2000);
    return () => clearTimeout(t);
  }, [mutationTick]);

  // Close the menu on route change.
  useEffect(() => setOpen(false), [pathname]);

  // Esc closes and returns focus to the trigger.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Move focus into the menu when it opens (keyboard accessibility).
  useEffect(() => {
    if (!open) return;
    const first = document.querySelector<HTMLButtonElement>(`#${CSS.escape(menuId)} [role="menuitem"]`);
    first?.focus();
  }, [open, menuId]);

  const createActions = useMemo<FabAction[]>(() => {
    const all: Record<string, FabAction> = {
      addExpense: {
        id: 'addExpense',
        label: 'Add Expense',
        icon: ArrowDownCircle,
        tone: 'bg-nu-gradient-gold text-nu-blue-900',
        onClick: () => openExpenseModal(),
      },
      addIncome: {
        id: 'addIncome',
        label: 'Add Income',
        icon: ArrowUpCircle,
        tone: 'bg-emerald-500 text-white',
        onClick: () => openExpenseModal(null, { transactionType: 'INCOME' }),
      },
      addSavings: {
        id: 'addSavings',
        label: 'Add Savings',
        icon: PiggyBank,
        tone: 'bg-nu-blue-600 text-white',
        onClick: () => navigate('/goals'),
      },
      createGoal: {
        id: 'createGoal',
        label: 'Create Goal',
        icon: Target,
        tone: 'bg-nu-blue-700 text-white',
        onClick: () => navigate('/goals?new=1'),
      },
      recordAllowance: {
        id: 'recordAllowance',
        label: 'Record Allowance',
        icon: Coins,
        tone: 'bg-amber-500 text-white',
        onClick: () => openExpenseModal(null, { transactionType: 'INCOME', notes: 'Allowance' }),
      },
    };

    // Context-aware ordering — the page's most likely action leads (sits nearest
    // the thumb) and is styled as the gold primary.
    let order: string[];
    if (pathname.startsWith('/goals')) {
      order = ['createGoal', 'addSavings', 'addExpense', 'addIncome', 'recordAllowance'];
    } else if (pathname.startsWith('/emergency-fund')) {
      order = ['addSavings', 'addExpense', 'addIncome', 'createGoal', 'recordAllowance'];
    } else {
      order = ['addExpense', 'addIncome', 'addSavings', 'createGoal', 'recordAllowance'];
    }

    const ordered = order.map((id) => all[id]);
    // Recolor whatever ends up primary so it reads as the gold lead action.
    ordered[0] = { ...ordered[0], tone: 'bg-nu-gradient-gold text-nu-blue-900' };
    return ordered;
  }, [pathname, navigate, openExpenseModal]);

  // Shortcuts to feature pages that aren't on the mobile bottom nav — so users
  // can reach Semester, Learn, Reports, etc. without opening the account menu.
  // (These pages also remain in the profile menu; this just adds a faster path.)
  const exploreItems = useMemo<FabAction[]>(() => {
    const go = (to: string) => () => navigate(to);
    return [
      { id: 'analytics', label: 'Analytics', icon: BarChart3, tone: 'bg-nu-blue-100 text-nu-blue-700 dark:bg-nu-blue-500/25 dark:text-nu-blue-300', onClick: go('/analytics') },
      { id: 'reports', label: 'Reports', icon: FileText, tone: 'bg-nu-blue-100 text-nu-blue-700 dark:bg-nu-blue-500/25 dark:text-nu-blue-300', onClick: go('/report') },
      { id: 'semester', label: 'Semester', icon: GraduationCap, tone: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/25 dark:text-indigo-300', onClick: go('/semester-budget') },
      { id: 'learn', label: 'Learn', icon: BookOpen, tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300', onClick: go('/financial-literacy') },
      { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, tone: 'bg-rose-100 text-rose-700 dark:bg-rose-500/25 dark:text-rose-300', onClick: go('/subscriptions') },
      { id: 'split', label: 'Split Bills', icon: Users, tone: 'bg-violet-100 text-violet-700 dark:bg-violet-500/25 dark:text-violet-300', onClick: go('/split-bills') },
      { id: 'emergency', label: 'Emergency', icon: Shield, tone: 'bg-rose-100 text-rose-700 dark:bg-rose-500/25 dark:text-rose-300', onClick: go('/emergency-fund') },
      { id: 'challenges', label: 'Challenges', icon: Trophy, tone: 'bg-amber-100 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300', onClick: go('/challenges') },
      { id: 'calendar', label: 'Calendar', icon: CalendarDays, tone: 'bg-sky-100 text-sky-700 dark:bg-sky-500/25 dark:text-sky-300', onClick: go('/school-calendar') },
      { id: 'help', label: 'Help', icon: HelpCircle, tone: 'bg-nu-blue-100 text-nu-blue-700 dark:bg-nu-blue-500/25 dark:text-nu-blue-300', onClick: go('/help') },
    ];
  }, [navigate]);

  const groups: FabGroup[] = [
    { title: 'Create', items: createActions },
    { title: 'Explore', items: exploreItems },
  ];

  const primaryLabel = createActions[0]?.label ?? 'Add Expense';

  return (
    <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 z-50 lg:bottom-6 lg:right-6 print:hidden">
      {/* Tap-away scrim */}
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 -z-10 cursor-default bg-nu-blue-950/25 backdrop-blur-[1px]"
          />
        )}
      </AnimatePresence>

      <div className="relative flex flex-col items-end">
        <AnimatePresence>{open && <FabMenu id={menuId} groups={groups} onSelect={() => setOpen(false)} />}</AnimatePresence>

        {/* Success cheer bubble */}
        <AnimatePresence>
          {celebrate && !open && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-2xl bg-surface px-3.5 py-2 text-sm font-bold text-nu-blue-700 shadow-card ring-1 ring-surface-border/60 dark:text-nu-blue-200"
            >
              Great job! 🎉
              <span className="absolute -bottom-1 right-6 h-2.5 w-2.5 rotate-45 bg-surface ring-1 ring-surface-border/60" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* The bulldog button */}
        <motion.button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close quick actions' : `Quick actions — ${primaryLabel}`}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          whileHover={reduceMotion ? undefined : { y: -3, scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          animate={open ? { rotate: 0 } : {}}
          className="relative grid h-16 w-16 place-items-center rounded-[1.45rem] bg-nu-gradient text-white shadow-float outline-none ring-nu-gold-300 focus-visible:ring-4 lg:h-[4.25rem] lg:w-[4.25rem]"
          style={{ boxShadow: '0 18px 50px -12px rgb(53 64 142 / 0.5), 0 0 24px -6px rgb(94 234 212 / 0.45)' }}
        >
          {/* Pulsing cyan halo */}
          {!reduceMotion && (
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 -z-10 rounded-[1.45rem] ring-2 ring-cyan-300/40"
              animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.18, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* Breathing mascot */}
          <motion.span
            className="block"
            animate={open || reduceMotion ? { scale: 1, y: 0 } : { scale: [1, 1.05, 1], y: [0, -1, 0] }}
            transition={open || reduceMotion ? undefined : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <BulldogMascot size={48} expression={celebrate ? 'happy' : 'idle'} />
          </motion.span>

          {/* Gold notch that flips to a close affordance when open */}
          <motion.span
            aria-hidden="true"
            animate={{ rotate: open ? 45 : 0, backgroundColor: open ? 'rgb(245 179 0)' : 'rgb(255 214 51)' }}
            className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full text-[15px] font-black leading-none text-nu-blue-900 shadow-glow ring-2 ring-surface"
          >
            +
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
}

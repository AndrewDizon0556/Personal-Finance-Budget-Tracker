import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  Target,
  Trophy,
  Sparkles,
  PiggyBank,
  Receipt,
  Flame,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';
import PublicNav from '../components/public/PublicNav';
import Logo from '../components/brand/Logo';
import { staggerContainer, fadeUpItem } from '../lib/motion';
import { formatPeso } from '../lib/utils';

const FEATURES = [
  { icon: Wallet, title: 'Allowance Tracking', desc: 'Know exactly how much you can spend each day so your baon lasts the whole week.' },
  { icon: Receipt, title: 'Smart Expenses', desc: 'Log food, transpo, load, and projects in seconds with student-built categories.' },
  { icon: Target, title: 'Savings Goals', desc: 'Save for a new laptop, tuition, or barkada trip with animated progress rings.' },
  { icon: BarChart3, title: 'Insights & Reports', desc: 'See where your money goes with beautiful charts and weekly spending trends.' },
  { icon: Trophy, title: 'Achievements & XP', desc: 'Earn badges, build streaks, and level up for staying within your budget.' },
  { icon: ShieldCheck, title: 'Stay In Control', desc: 'Get nudges before you overspend and finish every semester financially fit.' },
];

const STEPS = [
  { n: '01', title: 'Set your allowance', desc: 'Tell us your weekly or monthly baon and spending habits.' },
  { n: '02', title: 'Log as you go', desc: 'Add expenses in a tap. We categorize and track everything for you.' },
  { n: '03', title: 'Level up', desc: 'Hit savings goals, earn badges, and watch your discipline grow.' },
];

const BADGES = [
  { icon: PiggyBank, label: 'Tipid Master' },
  { icon: Flame, label: '7-Day Streak' },
  { icon: GraduationCap, label: "Dean's Lister Saver" },
  { icon: ShieldCheck, label: 'Budget Warrior' },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <PublicNav />

      {/* ---------- HERO ---------- */}
      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-32 sm:px-6 sm:pt-40">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div variants={staggerContainer} initial="hidden" animate="show">
            <motion.div variants={fadeUpItem}>
              <span className="chip bg-accent-soft text-nu-blue-800 dark:text-nu-gold-300">
                <Sparkles size={14} /> Built for National University Laguna students
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUpItem}
              className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl"
            >
              Budget smarter,{' '}
              <span className="text-gradient-blue">NU student.</span>
            </motion.h1>

            <motion.p variants={fadeUpItem} className="mt-5 max-w-md text-base text-ink-soft sm:text-lg">
              A student budgeting companion designed to help you manage allowance, track expenses, and
              hit savings goals with confidence. Track your allowance. Control your spending.
              <span className="font-semibold text-ink"> Survive the semester.</span>
            </motion.p>

            <motion.div variants={fadeUpItem} className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register" className="btn-gold text-base">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-ghost text-base">
                Log In
              </Link>
            </motion.div>

            <motion.div variants={fadeUpItem} className="mt-8 flex items-center gap-6 text-sm text-ink-soft">
              <div>
                <p className="font-display text-2xl font-bold text-ink">8</p>
                <p>Expense categories</p>
              </div>
              <div className="h-8 w-px bg-surface-border" />
              <div>
                <p className="font-display text-2xl font-bold text-ink">100%</p>
                <p>Free for students</p>
              </div>
              <div className="h-8 w-px bg-surface-border" />
              <div>
                <p className="font-display text-2xl font-bold text-ink">₱0</p>
                <p>To start saving</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating dashboard preview */}
          <HeroPreview />
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Everything you need"
          title="Your money, finally under control"
          subtitle="Powerful tools wrapped in a design that actually feels good to use every day."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUpItem}
              whileHover={{ y: -6 }}
              className="card group p-6"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-nu-gradient text-nu-gold-400 shadow-glow-blue transition-transform group-hover:scale-110">
                <f.icon size={24} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="How it works"
          title="Start in three quick steps"
          subtitle="No finance degree required. Just your baon and two minutes."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card relative overflow-hidden p-7"
            >
              <span className="font-display text-5xl font-extrabold text-accent/30">{s.n}</span>
              <h3 className="mt-3 font-display text-xl font-bold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- GAMIFICATION ---------- */}
      <section id="gamify" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-4xl bg-nu-gradient p-8 shadow-float sm:p-14">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-nu-gold-400/20 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="chip bg-white/10 text-nu-gold-300">
                <Trophy size={14} /> Gamified saving
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                Make budgeting feel like a game you actually win.
              </h2>
              <p className="mt-4 max-w-md text-white/70">
                Earn XP for logging expenses, build no-overspending streaks, and unlock badges that
                prove your financial discipline all semester long.
              </p>
              <Link to="/register" className="btn-gold mt-7">
                Start your streak <Flame size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {BADGES.map((b, i) => (
                <motion.div
                  key={b.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-strong flex flex-col items-center gap-2 rounded-3xl p-5 text-center"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-nu-gradient-gold text-nu-blue-900">
                    <b.icon size={24} />
                  </div>
                  <span className="text-sm font-semibold text-ink">{b.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Track every peso like a champion.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-ink-soft">
            Join the students taking control of their allowance this semester.
          </p>
          <Link to="/register" className="btn-gold mx-auto mt-8 text-base">
            Get Started Free <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="border-t border-surface-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <Logo />
          <p className="text-xs text-ink-faint">
            © {new Date().getFullYear()} Ipon Challenge · A student project for NU Laguna
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- Sub-components ---------------- */

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto max-w-2xl text-center"
    >
      <span className="text-sm font-semibold uppercase tracking-wider text-accent">{eyebrow}</span>
      <h2 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">{title}</h2>
      <p className="mt-3 text-ink-soft">{subtitle}</p>
    </motion.div>
  );
}

function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 120, damping: 18 }}
      className="relative mx-auto w-full max-w-md"
    >
      {/* Main balance card */}
      <div className="card overflow-hidden p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-ink-faint">Remaining this week</p>
            <p className="mt-1 font-display text-3xl font-extrabold text-ink">{formatPeso(1240)}</p>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-nu-gradient text-nu-gold-400">
            <Wallet size={22} />
          </div>
        </div>
        <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-surface-soft">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '62%' }}
            transition={{ delay: 0.6, duration: 1 }}
            className="h-full rounded-full bg-nu-gradient-gold"
          />
        </div>
        <p className="mt-2 text-xs text-ink-soft">₱177/day safe-to-spend · 5 days left</p>
      </div>

      {/* Floating savings goal card */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="glass-strong absolute -right-4 -top-8 w-44 rounded-3xl p-4 shadow-float"
      >
        <div className="flex items-center gap-2">
          <Target size={16} className="text-accent" />
          <span className="text-xs font-semibold text-ink">New Laptop</span>
        </div>
        <p className="mt-2 font-display text-lg font-bold text-ink">68%</p>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-soft">
          <div className="h-full w-[68%] rounded-full bg-nu-blue-600" />
        </div>
      </motion.div>

      {/* Floating XP / streak card */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="glass-strong absolute -bottom-8 -left-4 flex items-center gap-3 rounded-3xl p-4 shadow-float"
      >
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-nu-gradient-gold text-nu-blue-900">
          <Flame size={20} />
        </div>
        <div>
          <p className="text-xs text-ink-faint">Savings streak</p>
          <p className="font-display text-base font-bold text-ink">7 days 🔥</p>
        </div>
      </motion.div>

      {/* Floating insight chip */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="glass-strong absolute -bottom-4 right-6 flex items-center gap-2 rounded-2xl px-3 py-2 shadow-float"
      >
        <TrendingUp size={14} className="text-emerald-500" />
        <span className="text-xs font-medium text-ink">Under budget this week</span>
      </motion.div>
    </motion.div>
  );
}

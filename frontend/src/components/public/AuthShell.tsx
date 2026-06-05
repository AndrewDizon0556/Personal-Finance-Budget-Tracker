import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Target, Trophy, ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import Logo from '../brand/Logo';

const HIGHLIGHTS = [
  { icon: Wallet, text: 'Track allowance & daily safe-to-spend' },
  { icon: Target, text: 'Hit savings goals with progress rings' },
  { icon: Trophy, text: 'Earn XP, badges & no-overspend streaks' },
];

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

/** Split-screen auth layout: branded NU panel + form card. */
export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-nu-gradient p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-nu-gold-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-nu-blue-400/30 blur-3xl" />

        <Link to="/" className="relative">
          <Logo light />
        </Link>

        <div className="relative">
          <h1 className="font-display text-4xl font-extrabold leading-tight text-white">
            Take control of your money.
          </h1>
          <p className="mt-4 max-w-sm text-white/70">
            A friendly budgeting companion for students and anyone who wants their money to last.
          </p>

          <div className="mt-10 space-y-4">
            {HIGHLIGHTS.map((h, i) => (
              <motion.div
                key={h.text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-nu-gold-300 backdrop-blur">
                  <h.icon size={20} />
                </div>
                <span className="text-sm font-medium text-white/90">{h.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/50">
          © {new Date().getFullYear()} Ipon Challenge · Track your allowance. Control your spending.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-[rgb(var(--page-bg))] px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-nu-blue-700 lg:hidden"
          >
            <ArrowLeft size={16} /> Back
          </Link>

          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <h2 className="font-display text-2xl font-extrabold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>

          <div className="mt-7">{children}</div>

          <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div>
        </motion.div>
      </div>
    </div>
  );
}

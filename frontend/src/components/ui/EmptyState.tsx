import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
}

/** Friendly, motivating empty state with a floating illustration icon. */
export default function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-surface-border/80 bg-surface-soft/40 px-6 py-14 text-center"
    >
      <div className="relative mb-5">
        <span className="absolute inset-0 -z-10 rounded-full bg-accent/20 blur-2xl" />
        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-nu-gradient text-white shadow-glow-blue animate-float-slow">
          <Icon size={34} strokeWidth={2} />
        </div>
      </div>
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-ink-soft">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}

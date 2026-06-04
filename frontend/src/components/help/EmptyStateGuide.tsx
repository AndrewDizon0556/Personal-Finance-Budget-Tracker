import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateGuideProps {
  /** Big friendly emoji shown in the badge (preferred for empty states). */
  emoji?: string;
  /** Fallback lucide icon when no emoji is given. */
  icon?: LucideIcon;
  title: string;
  message: string;
  /** Primary call-to-action button. */
  actionLabel?: string;
  onAction?: () => void;
  /** Optional "Learn more" deep link into the Help Center. */
  helpHref?: string;
  helpLabel?: string;
  children?: ReactNode;
}

/**
 * Guidance-first empty state: instead of a dead-end "No data" message, it tells
 * students exactly what to do next and why, with a clear action and an optional
 * link to the relevant Help Center section.
 */
export default function EmptyStateGuide({
  emoji,
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
  helpHref,
  helpLabel = 'Learn how it works',
  children,
}: EmptyStateGuideProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-surface-border/80 bg-surface-soft/40 px-6 py-14 text-center"
    >
      <div className="relative mb-5">
        <span className="absolute inset-0 -z-10 rounded-full bg-accent/20 blur-2xl" />
        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-nu-gradient text-white shadow-glow-blue animate-float-slow">
          {emoji ? <span className="text-4xl">{emoji}</span> : Icon ? <Icon size={34} strokeWidth={2} /> : null}
        </div>
      </div>

      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-ink-soft">{message}</p>

      {(actionLabel || children) && (
        <div className="mt-5 flex flex-col items-center gap-3">
          {actionLabel && onAction && (
            <button onClick={onAction} className="btn-gold">
              {actionLabel}
            </button>
          )}
          {children}
        </div>
      )}

      {helpHref && (
        <Link
          to={helpHref}
          className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-nu-blue-600 transition-colors hover:text-nu-blue-700"
        >
          {helpLabel} <ArrowRight size={13} />
        </Link>
      )}
    </motion.div>
  );
}

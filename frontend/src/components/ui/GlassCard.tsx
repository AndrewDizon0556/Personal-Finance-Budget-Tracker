import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { fadeUpItem } from '../../lib/motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** Add hover lift interaction. */
  interactive?: boolean;
  /** Participate in a parent stagger container. */
  stagger?: boolean;
  onClick?: () => void;
}

/** Rounded glassmorphism card with optional entrance + hover animation. */
export default function GlassCard({
  children,
  className,
  interactive = false,
  stagger = false,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      variants={stagger ? fadeUpItem : undefined}
      whileHover={interactive ? { y: -4 } : undefined}
      whileTap={interactive ? { scale: 0.99 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      onClick={onClick}
      className={cn(
        'glass rounded-3xl p-5',
        interactive && 'cursor-pointer hover:shadow-float',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

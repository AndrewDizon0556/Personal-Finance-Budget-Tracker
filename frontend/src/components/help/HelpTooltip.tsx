import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { useHelpStore } from '../../store/helpStore';
import { cn } from '../../lib/utils';

type Side = 'top' | 'bottom' | 'left' | 'right';

interface HelpTooltipProps {
  /** The explanation shown when the icon is hovered, focused, or tapped. */
  content: string;
  /** Accessible label for the trigger. Defaults to "More information". */
  label?: string;
  /** Which side the bubble opens toward. */
  side?: Side;
  className?: string;
}

const SIDE_CLASSES: Record<Side, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

/**
 * Subtle (?) trigger that reveals a one-line explanation. Works for mouse
 * (hover), keyboard (focus), and touch (tap). Honors the global "Show tips"
 * preference so users can mute all of them at once.
 */
export default function HelpTooltip({ content, label = 'More information', side = 'bottom', className }: HelpTooltipProps) {
  const tipsEnabled = useHelpStore((s) => s.tipsEnabled);
  const [open, setOpen] = useState(false);
  const id = useId();

  if (!tipsEnabled) return null;

  return (
    <span className={cn('relative inline-flex', className)}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="grid h-5 w-5 place-items-center rounded-full text-ink-faint transition-colors hover:bg-surface-soft hover:text-nu-blue-600"
      >
        <HelpCircle size={15} strokeWidth={2} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            id={id}
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'glass-strong absolute z-50 w-56 rounded-2xl px-3.5 py-2.5 text-left text-xs font-medium leading-relaxed text-ink shadow-float',
              SIDE_CLASSES[side],
            )}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

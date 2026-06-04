import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { useHelpStore } from '../../store/helpStore';
import { cn } from '../../lib/utils';

interface HelpTooltipProps {
  /** The explanation shown when the icon is hovered, focused, or tapped. */
  content: string;
  /** Accessible label for the trigger. Defaults to "More information". */
  label?: string;
  className?: string;
}

const MARGIN = 8;
const MAX_WIDTH = 240; // 15rem

/**
 * Subtle (?) trigger that reveals a one-line explanation. Works for mouse
 * (hover), keyboard (focus), and touch (tap). Honors the global "Show tips"
 * preference.
 *
 * The bubble is rendered in a portal with fixed positioning that is measured
 * and clamped to the viewport on open, so it can never overflow the screen edge
 * — no matter where the trigger sits (e.g. a (?) at the far right of a long page
 * title on a narrow phone).
 */
export default function HelpTooltip({ content, label = 'More information', className }: HelpTooltipProps) {
  const tipsEnabled = useHelpStore((s) => s.tipsEnabled);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: MAX_WIDTH });
  const btnRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  const show = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.min(MAX_WIDTH, window.innerWidth - MARGIN * 2);
    // Center on the trigger, then clamp both edges inside the viewport.
    const left = Math.max(MARGIN, Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - MARGIN));
    setPos({ top: r.bottom + MARGIN, left, width });
    setOpen(true);
  };
  const hide = () => setOpen(false);

  // Close on scroll/resize so the fixed bubble can't drift away from its trigger.
  useEffect(() => {
    if (!open) return;
    const onMove = () => setOpen(false);
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [open]);

  if (!tipsEnabled) return null;

  return (
    <span className={cn('relative inline-flex', className)}>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={(e) => {
          e.stopPropagation();
          open ? hide() : show();
        }}
        className="grid h-5 w-5 place-items-center rounded-full text-ink-faint transition-colors hover:bg-surface-soft hover:text-nu-blue-600"
      >
        <HelpCircle size={15} strokeWidth={2} />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.span
              role="tooltip"
              id={id}
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width }}
              className="glass-strong z-[80] block rounded-2xl px-3.5 py-2.5 text-left text-xs font-medium leading-relaxed text-ink shadow-float"
            >
              {content}
            </motion.span>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </span>
  );
}

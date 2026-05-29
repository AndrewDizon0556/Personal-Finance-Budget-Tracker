import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { popIn } from '../../lib/motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** max-width class, defaults to max-w-md */
  widthClass?: string;
}

/** Animated, glassmorphism modal with backdrop blur. */
export default function Modal({ isOpen, onClose, title, children, widthClass = 'max-w-md' }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-nu-blue-950/40 backdrop-blur-sm"
          />
          <motion.div
            variants={popIn}
            initial="hidden"
            animate="show"
            exit="exit"
            className={`glass-strong relative z-10 w-full ${widthClass} rounded-t-4xl p-6 sm:rounded-4xl`}
          >
            {title && (
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
                <button
                  onClick={onClose}
                  className="grid h-8 w-8 place-items-center rounded-xl text-ink-faint transition-colors hover:bg-surface-soft hover:text-ink"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

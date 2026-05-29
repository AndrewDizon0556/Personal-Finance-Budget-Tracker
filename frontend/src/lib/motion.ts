import type { Variants } from 'framer-motion';

/** Stagger container — children animate in sequence. */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

/** Item that fades + rises into place. Pairs with staggerContainer. */
export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

/** Soft pop-in for modals / cards. */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 26 },
  },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.15 } },
};

/** Standard hover lift for interactive cards. */
export const hoverLift = {
  whileHover: { y: -4, transition: { type: 'spring', stiffness: 400, damping: 20 } },
  whileTap: { scale: 0.985 },
} as const;

import { motion, type Variants } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export interface FabAction {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  /** Tailwind classes for the round/rounded icon chip (bg + text). */
  tone: string;
}

export interface FabGroup {
  title: string;
  items: FabAction[];
}

interface FabMenuProps {
  id: string;
  groups: FabGroup[];
  /** Called after an action runs so the FAB can close. */
  onSelect: () => void;
}

const panel: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 360, damping: 26, staggerChildren: 0.025, delayChildren: 0.04 },
  },
  exit: { opacity: 0, scale: 0.92, y: 10, transition: { duration: 0.14 } },
};

const tile: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.85 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 460, damping: 26 } },
  exit: { opacity: 0 },
};

/**
 * The FAB's expanded launcher: a compact glass panel with grouped, tappable
 * tiles. "Create" holds the quick-add actions; "Explore" surfaces the feature
 * pages that otherwise live only in the account menu — so mobile users can jump
 * straight to Semester, Learn, Reports, etc.
 */
export default function FabMenu({ id, groups, onSelect }: FabMenuProps) {
  return (
    <motion.div
      id={id}
      role="menu"
      aria-label="Quick actions and shortcuts"
      variants={panel}
      initial="hidden"
      animate="show"
      exit="exit"
      className="glass-strong absolute bottom-full right-0 mb-4 w-72 max-w-[calc(100vw-2rem)] origin-bottom-right rounded-3xl p-3 shadow-float"
    >
      <div className="max-h-[62vh] space-y-3 overflow-y-auto overscroll-contain">
        {groups.map((group) => (
          <section key={group.title}>
            <p className="px-1 pb-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-faint">{group.title}</p>
            <div className="grid grid-cols-3 gap-1.5">
              {group.items.map((action) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    variants={tile}
                    role="menuitem"
                    onClick={() => {
                      action.onClick();
                      onSelect();
                    }}
                    className="flex flex-col items-center gap-1.5 rounded-2xl p-2.5 text-center outline-none transition-colors hover:bg-surface-soft focus-visible:bg-surface-soft focus-visible:ring-2 focus-visible:ring-nu-blue-400"
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-xl shadow-sm ${action.tone}`}>
                      <Icon size={18} strokeWidth={2.2} />
                    </span>
                    <span className="text-[11px] font-semibold leading-tight text-ink">{action.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </motion.div>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Receipt, Target, BarChart3, Plus } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';

const ITEMS = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/transactions', label: 'Activity', icon: Receipt },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/analytics', label: 'Stats', icon: BarChart3 },
];

/** Mobile-only bottom navigation with a center floating add button. */
export default function MobileNav() {
  const location = useLocation();
  const openExpenseModal = useUiStore((s) => s.openExpenseModal);

  return (
    <>
      {/* Center floating add button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => openExpenseModal()}
        className="fixed bottom-6 left-1/2 z-50 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-nu-gradient-gold text-nu-blue-900 shadow-glow lg:hidden"
        aria-label="Add transaction"
      >
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-nu-gold-400" />
        <Plus size={26} strokeWidth={2.5} className="relative" />
      </motion.button>

      <nav className="fixed inset-x-0 bottom-0 z-40 glass-nav border-t lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 items-center px-2 pb-[env(safe-area-inset-bottom)] pt-2">
          {ITEMS.slice(0, 2).map((item) => (
            <NavSlot key={item.to} {...item} active={location.pathname === item.to} />
          ))}
          <div aria-hidden /> {/* space for FAB */}
          {ITEMS.slice(2).map((item) => (
            <NavSlot key={item.to} {...item} active={location.pathname === item.to} />
          ))}
        </div>
      </nav>
    </>
  );
}

function NavSlot({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link to={to} className="flex flex-col items-center gap-0.5 py-1.5">
      <Icon size={21} className={active ? 'text-nu-blue-700' : 'text-ink-faint'} />
      <span className={`text-[10px] font-semibold ${active ? 'text-nu-blue-700' : 'text-ink-faint'}`}>
        {label}
      </span>
    </Link>
  );
}

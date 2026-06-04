import { Link, useLocation } from 'react-router-dom';
import { Home, Receipt, Target, Users } from 'lucide-react';

// 4 primary destinations. Adding transactions / income / goals and jumping to
// other features now lives in the global bulldog FAB (bottom-right), so the
// quick-action surface is identical on mobile and desktop.
const ITEMS = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/transactions', label: 'Activity', icon: Receipt },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/split-bills', label: 'Split', icon: Users },
];

/** Mobile-only bottom navigation bar. */
export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 glass-nav border-t lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 items-center px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {ITEMS.map((item) => (
          <NavSlot key={item.to} {...item} active={location.pathname === item.to} />
        ))}
      </div>
    </nav>
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

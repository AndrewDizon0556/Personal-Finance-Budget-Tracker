import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LogOut,
  User,
  Settings,
  ChevronDown,
  LayoutDashboard,
  Receipt,
  Target,
  CreditCard,
  Users,
  BarChart3,
  GraduationCap,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Logo from '../brand/Logo';
import NotificationBell from '../notifications/NotificationBell';
import ThemeToggle from '../ui/ThemeToggle';
import LevelChip from '../gamification/LevelChip';

// Single source of truth for the primary destinations. The desktop top-nav
// renders the labels; the mobile account menu renders the same list with icons,
// so every feature is reachable on a phone (the bottom bar only holds a few).
const NAV_LINKS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/split-bills', label: 'Split Bills', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/semester-budget', label: 'Semester', icon: GraduationCap },
  { to: '/financial-literacy', label: 'Learn', icon: BookOpen },
];

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const initials = (user?.fullName ?? 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 glass-nav">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link to="/dashboard">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative rounded-xl px-3 py-2 text-sm font-medium transition-colors"
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-nu-blue-700"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`relative ${active ? 'text-white' : 'text-ink-soft hover:text-ink'}`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <LevelChip />
          <ThemeToggle />
          <NotificationBell />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-2xl py-1 pl-1 pr-2 transition-colors hover:bg-surface-soft"
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-nu-gradient text-xs font-bold text-white">
                {initials}
              </span>
              <ChevronDown size={14} className="text-ink-faint" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  className="glass-strong absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-3xl p-1.5"
                >
                  <div className="border-b border-surface-border/60 px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-ink">{user?.fullName ?? 'Student'}</p>
                    <p className="truncate text-xs text-ink-faint">{user?.email}</p>
                  </div>

                  {/* Mobile-only full navigation. The bottom bar only holds a few
                      destinations, so every feature is listed here on phones.
                      Hidden on desktop (lg), where the top nav already covers them. */}
                  <div className="max-h-[55vh] overflow-y-auto lg:hidden">
                    {NAV_LINKS.map(({ to, label, icon: Icon }) => {
                      const active = location.pathname === to;
                      return (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setMenuOpen(false)}
                          className={`menu-item ${active ? 'font-semibold text-nu-blue-700' : ''}`}
                        >
                          <Icon size={16} /> {label}
                        </Link>
                      );
                    })}
                    <div className="my-1 border-t border-surface-border/60" />
                  </div>

                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="menu-item">
                    <User size={16} /> Profile
                  </Link>
                  <Link to="/settings" onClick={() => setMenuOpen(false)} className="menu-item">
                    <Settings size={16} /> Settings
                  </Link>
                  <button onClick={handleLogout} className="menu-item w-full text-rose-500">
                    <LogOut size={16} /> Log out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

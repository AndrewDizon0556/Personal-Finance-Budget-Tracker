import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import NotificationBell from '../notifications/NotificationBell';

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-blue-600 font-semibold'
      : 'text-gray-500 hover:text-gray-800';

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link to="/dashboard" className="font-bold text-gray-800 text-sm shrink-0">
            Ipon Challenge
          </Link>
          <nav className="flex gap-3 text-sm overflow-x-auto">
            <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
            <Link to="/transactions" className={isActive('/transactions')}>Transactions</Link>
            <Link to="/goals" className={isActive('/goals')}>Goals</Link>
            <Link to="/subscriptions" className={isActive('/subscriptions')}>Subscriptions</Link>
            <Link to="/split-bills" className={isActive('/split-bills')}>Split</Link>
            <Link to="/analytics" className={isActive('/analytics')}>Analytics</Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <NotificationBell />
          <Link
            to="/profile"
            className="text-sm text-gray-500 hover:text-gray-800 hidden sm:block"
          >
            {user?.fullName ?? 'Profile'}
          </Link>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 transition-colors text-xs ml-1"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useGamificationStore } from '../store/gamificationStore';
import { useUiStore } from '../store/uiStore';
import authService from '../services/authService';
import Navbar from '../components/layout/Navbar';
import MobileNav from '../components/layout/MobileNav';
import GlobalExpenseModal from '../components/expense/GlobalExpenseModal';

export default function PrivateLayout() {
  const { isAuthenticated, user, setAuth, token } = useAuthStore();
  const fetchGamification = useGamificationStore((s) => s.fetch);
  const mutationTick = useUiStore((s) => s.mutationTick);

  // Rehydrate user from token on refresh
  useEffect(() => {
    if (isAuthenticated && !user && token) {
      authService
        .getMe()
        .then((fetchedUser) => setAuth(fetchedUser, token))
        .catch(() => {
          /* invalid token — redirect handles it */
        });
    }
  }, []);

  // Keep gamification fresh on load and after each expense mutation
  useEffect(() => {
    if (isAuthenticated) fetchGamification();
  }, [isAuthenticated, mutationTick]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--page-bg))] bg-nu-mesh">
      <Navbar />
      <main className="pb-28 lg:pb-12">
        <Outlet />
      </main>
      <MobileNav />
      <GlobalExpenseModal />
    </div>
  );
}

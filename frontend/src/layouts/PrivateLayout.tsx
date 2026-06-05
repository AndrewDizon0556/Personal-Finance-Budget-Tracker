import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useGamificationStore } from '../store/gamificationStore';
import { useUiStore } from '../store/uiStore';
import { useHelpStore } from '../store/helpStore';
import { usePrefsStore } from '../store/prefsStore';
import { GUIDE } from '../lib/helpContent';
import authService from '../services/authService';
import Navbar from '../components/layout/Navbar';
import MobileNav from '../components/layout/MobileNav';
import GlobalExpenseModal from '../components/expense/GlobalExpenseModal';
import FloatingActionButton from '../components/fab/FloatingActionButton';
import AiCoachFab from '../components/fab/AiCoachFab';
import OnboardingTour from '../components/help/OnboardingTour';
import OfflineBanner from '../components/ui/OfflineBanner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { syncManager } from '../sync/SyncManager';

export default function PrivateLayout() {
  const { isAuthenticated, user, setAuth, token } = useAuthStore();
  const fetchGamification = useGamificationStore((s) => s.fetch);
  const mutationTick = useUiStore((s) => s.mutationTick);
  const location = useLocation();

  // Help / guidance state — hydrate durable completion, then auto-play the
  // first-time tour once setup is done and the student hasn't seen it yet.
  const hydrateHelp = useHelpStore((s) => s.hydrateFromServer);
  const helpHydrated = useHelpStore((s) => s.hydrated);
  const tipsEnabled = useHelpStore((s) => s.tipsEnabled);
  const tourCompleted = useHelpStore((s) => s.completed[GUIDE.WELCOME_TOUR]);
  const openTour = useHelpStore((s) => s.openTour);
  const onboarded = usePrefsStore((s) => s.onboarded);

  // Initialize offline detection and auto-sync on first mount
  useEffect(() => {
    syncManager.init();
  }, []);

  useEffect(() => {
    if (isAuthenticated) hydrateHelp();
  }, [isAuthenticated]);

  useEffect(() => {
    if (helpHydrated && isAuthenticated && onboarded && tipsEnabled && !tourCompleted) {
      openTour();
    }
  }, [helpHydrated, isAuthenticated, onboarded, tipsEnabled, tourCompleted]);

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
    <div className="min-h-screen overflow-x-clip bg-[rgb(var(--page-bg))] bg-nu-mesh">
      <Navbar />
      <OfflineBanner />
      {/* Bottom padding clears BOTH the mobile bottom-nav and the floating
          bulldog FAB (which sits at ~9.25rem + safe-area), so the last card on a
          page is never hidden underneath the FAB on phones. */}
      <main className="pb-[calc(9.5rem+env(safe-area-inset-bottom))] lg:pb-12">
        {/* Keyed by route so a crash on one page shows a friendly message instead
            of blanking the whole app, and clears automatically on navigation. */}
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <MobileNav />
      <FloatingActionButton />
      <AiCoachFab />
      <GlobalExpenseModal />
      <OnboardingTour />
    </div>
  );
}

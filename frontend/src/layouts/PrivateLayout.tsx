import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import authService from '../services/authService';
import Navbar from '../components/layout/Navbar';

export default function PrivateLayout() {
  const { isAuthenticated, user, setAuth, token } = useAuthStore();

  // Rehydrate user from token on page refresh
  useEffect(() => {
    if (isAuthenticated && !user && token) {
      authService.getMe().then((fetchedUser) => {
        setAuth(fetchedUser, token);
      }).catch(() => {
        // Token is invalid or expired — store will stay as-is; redirect handles it
      });
    }
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

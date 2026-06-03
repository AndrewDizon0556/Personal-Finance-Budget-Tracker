import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import PrivateLayout from '../layouts/PrivateLayout';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import OnboardingPage from '../pages/OnboardingPage';
import DashboardPage from '../pages/DashboardPage';
import TransactionsPage from '../pages/TransactionsPage';
import GoalsPage from '../pages/GoalsPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import SubscriptionsPage from '../pages/SubscriptionsPage';
import SplitBillsPage from '../pages/SplitBillsPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import SemesterBudgetPage from '../pages/SemesterBudgetPage';
import FinancialLiteracyPage from '../pages/FinancialLiteracyPage';
import LessonPage from '../pages/LessonPage';
import TermsPage from '../pages/TermsPage';
import PrivacyPage from '../pages/PrivacyPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Route>

        {/* Standalone full-screen onboarding (auth-gated inside) */}
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Protected routes */}
        <Route element={<PrivateLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/split-bills" element={<SplitBillsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/semester-budget" element={<SemesterBudgetPage />} />
          <Route path="/semester-budget/:id" element={<SemesterBudgetPage />} />
          <Route path="/financial-literacy" element={<FinancialLiteracyPage />} />
          <Route path="/financial-literacy/:id" element={<LessonPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

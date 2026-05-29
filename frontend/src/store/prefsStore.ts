import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ToggleKey = 'budgetAlerts' | 'renewalReminders' | 'streakNudges' | 'weeklyDigest';

interface PrefsState {
  budgetAlerts: boolean;
  renewalReminders: boolean;
  streakNudges: boolean;
  weeklyDigest: boolean;
  onboarded: boolean;
  /** Manual override for the budgeting horizon (days). null = use schedule-derived default. */
  daysLeftOverride: number | null;
  setOnboarded: (v: boolean) => void;
  setDaysLeftOverride: (n: number | null) => void;
  toggle: (key: ToggleKey) => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      budgetAlerts: true,
      renewalReminders: true,
      streakNudges: true,
      weeklyDigest: false,
      onboarded: false,
      daysLeftOverride: null,
      setOnboarded: (v) => set({ onboarded: v }),
      setDaysLeftOverride: (n) => set({ daysLeftOverride: n && n > 0 ? Math.floor(n) : null }),
      toggle: (key) => set((s) => ({ [key]: !s[key] }) as Pick<PrefsState, ToggleKey>),
    }),
    { name: 'ipon-prefs' },
  ),
);

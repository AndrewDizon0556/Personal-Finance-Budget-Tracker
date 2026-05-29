import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ToggleKey = 'budgetAlerts' | 'renewalReminders' | 'streakNudges' | 'weeklyDigest';

interface PrefsState {
  budgetAlerts: boolean;
  renewalReminders: boolean;
  streakNudges: boolean;
  weeklyDigest: boolean;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
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
      setOnboarded: (v) => set({ onboarded: v }),
      toggle: (key) => set((s) => ({ [key]: !s[key] }) as Pick<PrefsState, ToggleKey>),
    }),
    { name: 'ipon-prefs' },
  ),
);

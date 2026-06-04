import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import helpService from '../services/helpService';

interface HelpState {
  /** Master switch for the (?) tooltips and proactive coach-marks. */
  tipsEnabled: boolean;
  /** guideName -> completed. Drives the "don't show the same guide twice" logic. */
  completed: Record<string, boolean>;
  /** guideName -> ISO timestamp it was last surfaced. */
  lastShown: Record<string, string>;
  /** Whether the guided tour overlay is currently open. */
  tourOpen: boolean;
  /** True once we've merged server-side state in (prevents re-running tours on reload). */
  hydrated: boolean;

  setTipsEnabled: (v: boolean) => void;
  markCompleted: (guideName: string, completed?: boolean) => void;
  markSeen: (guideName: string) => void;
  resetAllGuides: () => void;
  openTour: () => void;
  closeTour: () => void;
  hydrateFromServer: () => Promise<void>;
}

export const useHelpStore = create<HelpState>()(
  persist(
    (set, get) => ({
      tipsEnabled: true,
      completed: {},
      lastShown: {},
      tourOpen: false,
      hydrated: false,

      setTipsEnabled: (v) => set({ tipsEnabled: v }),

      markCompleted: (guideName, completed = true) => {
        set((s) => ({
          completed: { ...s.completed, [guideName]: completed },
          lastShown: { ...s.lastShown, [guideName]: new Date().toISOString() },
        }));
        // Best-effort durable sync; offline failures are non-blocking.
        helpService.upsertPreference(guideName, completed).catch(() => {});
      },

      markSeen: (guideName) =>
        set((s) => ({ lastShown: { ...s.lastShown, [guideName]: new Date().toISOString() } })),

      resetAllGuides: () => {
        set({ completed: {}, lastShown: {} });
        helpService.resetAll().catch(() => {});
      },

      openTour: () => set({ tourOpen: true }),
      closeTour: () => set({ tourOpen: false }),

      hydrateFromServer: async () => {
        if (get().hydrated) return;
        try {
          const prefs = await helpService.getPreferences();
          set((s) => {
            const completed = { ...s.completed };
            const lastShown = { ...s.lastShown };
            for (const p of prefs) {
              // Server "completed" wins so a tour finished on another device stays done.
              if (p.completed) completed[p.guideName] = true;
              if (p.lastShown) lastShown[p.guideName] = p.lastShown;
            }
            return { completed, lastShown, hydrated: true };
          });
        } catch {
          // Offline or first run — local state is authoritative.
          set({ hydrated: true });
        }
      },
    }),
    {
      name: 'ipon-help',
      partialize: (s) => ({
        tipsEnabled: s.tipsEnabled,
        completed: s.completed,
        lastShown: s.lastShown,
      }),
    },
  ),
);

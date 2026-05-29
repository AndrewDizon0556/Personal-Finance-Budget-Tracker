import { create } from 'zustand';
import type { GamificationData } from '../types/gamification';
import gamificationService from '../services/gamificationService';

interface GamificationState {
  data: GamificationData | null;
  isLoading: boolean;
  fetch: () => Promise<void>;
}

export const useGamificationStore = create<GamificationState>((set) => ({
  data: null,
  isLoading: false,
  fetch: async () => {
    set({ isLoading: true });
    try {
      const data = await gamificationService.getMe();
      set({ data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));

import { create } from 'zustand';
import type { SavingsGoal, SavingsGoalPayload } from '../types/goal';
import goalService from '../services/goalService';

interface GoalState {
  goals: SavingsGoal[];
  isLoading: boolean;
  error: string | null;

  fetchGoals: () => Promise<void>;
  addGoal: (payload: SavingsGoalPayload) => Promise<void>;
  editGoal: (id: string, payload: SavingsGoalPayload) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: [],
  isLoading: false,
  error: null,

  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const goals = await goalService.getGoals();
      set({ goals, isLoading: false });
    } catch {
      set({ error: 'Failed to load goals', isLoading: false });
    }
  },

  addGoal: async (payload) => {
    const goal = await goalService.createGoal(payload);
    set((state) => ({ goals: [goal, ...state.goals] }));
  },

  editGoal: async (id, payload) => {
    const updated = await goalService.updateGoal(id, payload);
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? updated : g)),
    }));
  },

  removeGoal: async (id) => {
    await goalService.deleteGoal(id);
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
  },
}));

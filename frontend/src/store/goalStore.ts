import { create } from 'zustand';
import type { SavingsGoal, SavingsGoalPayload } from '../types/goal';
import { SavingsGoalRepository } from '../repositories/SavingsGoalRepository';

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
      const goals = await SavingsGoalRepository.getAll();
      set({ goals, isLoading: false });
    } catch {
      set({ error: 'Failed to load goals', isLoading: false });
    }
  },

  addGoal: async (payload) => {
    const goal = await SavingsGoalRepository.create(payload);
    set((state) => ({ goals: [goal, ...state.goals] }));
  },

  editGoal: async (id, payload) => {
    const updated = await SavingsGoalRepository.update(id, payload);
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? updated : g)),
    }));
  },

  removeGoal: async (id) => {
    await SavingsGoalRepository.remove(id);
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
  },
}));

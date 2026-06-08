import { create } from 'zustand';
import type { SavingsGoal, SavingsGoalPayload } from '../types/goal';
import { SavingsGoalRepository } from '../repositories/SavingsGoalRepository';
import { useUiStore } from './uiStore';

interface GoalState {
  goals: SavingsGoal[];
  isLoading: boolean;
  error: string | null;

  fetchGoals: () => Promise<void>;
  addGoal: (payload: SavingsGoalPayload) => Promise<void>;
  editGoal: (id: string, payload: SavingsGoalPayload) => Promise<void>;
  contributeToGoal: (id: string, amount: number) => Promise<SavingsGoal>;
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

  contributeToGoal: async (id, amount) => {
    const updated = await SavingsGoalRepository.contribute(id, amount);
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? updated : g)),
    }));
    // The contribution lowers the spendable balance and adds a transaction — refresh the app.
    useUiStore.getState().bumpMutation();
    return updated;
  },

  removeGoal: async (id) => {
    await SavingsGoalRepository.remove(id);
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
    // Deleting a goal returns its contributions to the wallet — refresh balances.
    useUiStore.getState().bumpMutation();
  },
}));

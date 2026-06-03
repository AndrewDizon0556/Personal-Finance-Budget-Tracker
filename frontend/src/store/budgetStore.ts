import { create } from 'zustand';
import type { Budget, BudgetPayload } from '../types/budget';
import { BudgetRepository } from '../repositories/BudgetRepository';

interface BudgetState {
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;

  fetchBudgets: (month?: number, year?: number) => Promise<void>;
  addBudget: (payload: BudgetPayload) => Promise<void>;
  editBudget: (id: string, payload: BudgetPayload) => Promise<void>;
  removeBudget: (id: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  budgets: [],
  isLoading: false,
  error: null,

  fetchBudgets: async (month, year) => {
    set({ isLoading: true, error: null });
    try {
      const budgets = await BudgetRepository.getAll(month, year);
      set({ budgets, isLoading: false });
    } catch {
      set({ error: 'Failed to load budgets', isLoading: false });
    }
  },

  addBudget: async (payload) => {
    const budget = await BudgetRepository.create(payload);
    set((state) => ({ budgets: [...state.budgets, budget] }));
  },

  editBudget: async (id, payload) => {
    const updated = await BudgetRepository.update(id, payload);
    set((state) => ({
      budgets: state.budgets.map((b) => (b.id === id ? updated : b)),
    }));
  },

  removeBudget: async (id) => {
    await BudgetRepository.remove(id);
    set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) }));
  },
}));

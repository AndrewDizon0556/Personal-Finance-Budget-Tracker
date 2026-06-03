import { create } from 'zustand';
import type { Expense, ExpenseCategory, ExpensePayload } from '../types/expense';
import { ExpenseRepository } from '../repositories/ExpenseRepository';

interface ExpenseState {
  expenses: Expense[];
  categories: ExpenseCategory[];
  isLoading: boolean;
  error: string | null;

  fetchExpenses: (month?: number, year?: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  addExpense: (payload: ExpensePayload) => Promise<void>;
  editExpense: (id: string, payload: ExpensePayload) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  categories: [],
  isLoading: false,
  error: null,

  fetchExpenses: async (month, year) => {
    set({ isLoading: true, error: null });
    try {
      const expenses = await ExpenseRepository.getAll(month, year);
      set({ expenses, isLoading: false });
    } catch {
      set({ error: 'Failed to load expenses', isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await ExpenseRepository.getCategories();
      set({ categories });
    } catch {
      set({ error: 'Failed to load categories' });
    }
  },

  addExpense: async (payload) => {
    const expense = await ExpenseRepository.create(payload);
    set((state) => ({ expenses: [expense, ...state.expenses] }));
  },

  editExpense: async (id, payload) => {
    const updated = await ExpenseRepository.update(id, payload);
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? updated : e)),
    }));
  },

  removeExpense: async (id) => {
    await ExpenseRepository.remove(id);
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));
  },
}));

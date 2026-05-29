import { create } from 'zustand';
import type { Expense } from '../types/expense';

interface UiState {
  expenseModalOpen: boolean;
  editingExpense: Expense | null;
  /** Increments after any expense mutation so pages can refetch. */
  mutationTick: number;
  openExpenseModal: (expense?: Expense | null) => void;
  closeExpenseModal: () => void;
  bumpMutation: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  expenseModalOpen: false,
  editingExpense: null,
  mutationTick: 0,
  openExpenseModal: (expense = null) => set({ expenseModalOpen: true, editingExpense: expense }),
  closeExpenseModal: () => set({ expenseModalOpen: false, editingExpense: null }),
  bumpMutation: () => set((s) => ({ mutationTick: s.mutationTick + 1 })),
}));

import { create } from 'zustand';
import type { Expense, TransactionType } from '../types/expense';

/** Optional defaults applied when opening the modal for a *new* transaction. */
export interface ExpensePreset {
  transactionType?: TransactionType;
  notes?: string;
}

interface UiState {
  expenseModalOpen: boolean;
  editingExpense: Expense | null;
  expensePreset: ExpensePreset | null;
  /** Increments after any expense mutation so pages can refetch. */
  mutationTick: number;
  openExpenseModal: (expense?: Expense | null, preset?: ExpensePreset | null) => void;
  closeExpenseModal: () => void;
  bumpMutation: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  expenseModalOpen: false,
  editingExpense: null,
  expensePreset: null,
  mutationTick: 0,
  openExpenseModal: (expense = null, preset = null) =>
    set({ expenseModalOpen: true, editingExpense: expense, expensePreset: preset }),
  closeExpenseModal: () => set({ expenseModalOpen: false, editingExpense: null, expensePreset: null }),
  bumpMutation: () => set((s) => ({ mutationTick: s.mutationTick + 1 })),
}));

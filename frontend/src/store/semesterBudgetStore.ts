import { create } from 'zustand';
import type { SemesterBudget, SemesterBudgetPayload } from '../types/semesterBudget';
import semesterBudgetService from '../services/semesterBudgetService';

interface SemesterBudgetState {
  semesters: SemesterBudget[];
  isLoading: boolean;
  error: string | null;

  fetchSemesters: () => Promise<void>;
  addSemester: (payload: SemesterBudgetPayload) => Promise<void>;
  editSemester: (id: string, payload: SemesterBudgetPayload) => Promise<void>;
  removeSemester: (id: string) => Promise<void>;
}

export const useSemesterBudgetStore = create<SemesterBudgetState>((set) => ({
  semesters: [],
  isLoading: false,
  error: null,

  fetchSemesters: async () => {
    set({ isLoading: true, error: null });
    try {
      const semesters = await semesterBudgetService.getAll();
      set({ semesters, isLoading: false });
    } catch {
      set({ error: 'Failed to load semester budgets', isLoading: false });
    }
  },

  addSemester: async (payload) => {
    const semester = await semesterBudgetService.create(payload);
    set((state) => ({ semesters: [semester, ...state.semesters] }));
  },

  editSemester: async (id, payload) => {
    const updated = await semesterBudgetService.update(id, payload);
    set((state) => ({
      semesters: state.semesters.map((s) => (s.id === id ? updated : s)),
    }));
  },

  removeSemester: async (id) => {
    await semesterBudgetService.remove(id);
    set((state) => ({ semesters: state.semesters.filter((s) => s.id !== id) }));
  },
}));

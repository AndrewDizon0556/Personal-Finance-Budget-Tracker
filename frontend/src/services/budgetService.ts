import axiosClient from '../api/axiosClient';
import type { Budget, BudgetPayload } from '../types/budget';

const budgetService = {
  getBudgets: async (month?: number, year?: number): Promise<Budget[]> => {
    const params = month && year ? { month, year } : {};
    const response = await axiosClient.get<Budget[]>('/api/budgets', { params });
    return response.data;
  },

  createBudget: async (payload: BudgetPayload): Promise<Budget> => {
    const response = await axiosClient.post<Budget>('/api/budgets', payload);
    return response.data;
  },

  updateBudget: async (id: string, payload: BudgetPayload): Promise<Budget> => {
    const response = await axiosClient.put<Budget>(`/api/budgets/${id}`, payload);
    return response.data;
  },

  deleteBudget: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/budgets/${id}`);
  },
};

export default budgetService;

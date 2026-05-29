import axiosClient from '../api/axiosClient';
import type { Expense, ExpenseCategory, ExpensePayload } from '../types/expense';

const expenseService = {
  getExpenses: async (month?: number, year?: number): Promise<Expense[]> => {
    const params = month && year ? { month, year } : {};
    const response = await axiosClient.get<Expense[]>('/api/expenses', { params });
    return response.data;
  },

  createExpense: async (payload: ExpensePayload): Promise<Expense> => {
    const response = await axiosClient.post<Expense>('/api/expenses', payload);
    return response.data;
  },

  updateExpense: async (id: string, payload: ExpensePayload): Promise<Expense> => {
    const response = await axiosClient.put<Expense>(`/api/expenses/${id}`, payload);
    return response.data;
  },

  deleteExpense: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/expenses/${id}`);
  },

  getCategories: async (): Promise<ExpenseCategory[]> => {
    const response = await axiosClient.get<ExpenseCategory[]>('/api/categories');
    return response.data;
  },

  createCategory: async (name: string): Promise<ExpenseCategory> => {
    const response = await axiosClient.post<ExpenseCategory>('/api/categories', { name });
    return response.data;
  },
};

export default expenseService;

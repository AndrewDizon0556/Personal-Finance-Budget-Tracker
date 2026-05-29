import axiosClient from '../api/axiosClient';
import type { SavingsGoal, SavingsGoalPayload } from '../types/goal';

const goalService = {
  getGoals: async (): Promise<SavingsGoal[]> => {
    const response = await axiosClient.get<SavingsGoal[]>('/api/goals');
    return response.data;
  },

  createGoal: async (payload: SavingsGoalPayload): Promise<SavingsGoal> => {
    const response = await axiosClient.post<SavingsGoal>('/api/goals', payload);
    return response.data;
  },

  updateGoal: async (id: string, payload: SavingsGoalPayload): Promise<SavingsGoal> => {
    const response = await axiosClient.put<SavingsGoal>(`/api/goals/${id}`, payload);
    return response.data;
  },

  deleteGoal: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/goals/${id}`);
  },
};

export default goalService;

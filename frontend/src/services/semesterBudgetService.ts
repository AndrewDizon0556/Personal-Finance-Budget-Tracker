import axiosClient from '../api/axiosClient';
import type { SemesterBudget, SemesterBudgetPayload, WeeklyBreakdown } from '../types/semesterBudget';

const semesterBudgetService = {
  getAll: async (): Promise<SemesterBudget[]> => {
    const res = await axiosClient.get<SemesterBudget[]>('/api/semester-budget');
    return res.data;
  },

  getOne: async (id: string): Promise<SemesterBudget> => {
    const res = await axiosClient.get<SemesterBudget>(`/api/semester-budget/${id}`);
    return res.data;
  },

  getWeeklyBreakdown: async (id: string): Promise<WeeklyBreakdown[]> => {
    const res = await axiosClient.get<WeeklyBreakdown[]>(`/api/semester-budget/${id}/weekly-breakdown`);
    return res.data;
  },

  create: async (payload: SemesterBudgetPayload): Promise<SemesterBudget> => {
    const res = await axiosClient.post<SemesterBudget>('/api/semester-budget', payload);
    return res.data;
  },

  update: async (id: string, payload: SemesterBudgetPayload): Promise<SemesterBudget> => {
    const res = await axiosClient.put<SemesterBudget>(`/api/semester-budget/${id}`, payload);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/semester-budget/${id}`);
  },
};

export default semesterBudgetService;

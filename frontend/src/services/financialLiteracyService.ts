import axiosClient from '../api/axiosClient';
import type { Lesson, UserProgress } from '../types/lesson';

const financialLiteracyService = {
  getLessons: async (): Promise<Lesson[]> => {
    const res = await axiosClient.get<Lesson[]>('/api/financial-lessons');
    return res.data;
  },

  getLesson: async (id: string): Promise<Lesson> => {
    const res = await axiosClient.get<Lesson>(`/api/financial-lessons/${id}`);
    return res.data;
  },

  completeLesson: async (id: string, score?: number): Promise<Lesson> => {
    const res = await axiosClient.post<Lesson>(
      `/api/financial-lessons/${id}/complete`,
      score !== undefined ? { score } : {},
    );
    return res.data;
  },

  getProgress: async (): Promise<UserProgress> => {
    const res = await axiosClient.get<UserProgress>('/api/financial-lessons/progress');
    return res.data;
  },
};

export default financialLiteracyService;

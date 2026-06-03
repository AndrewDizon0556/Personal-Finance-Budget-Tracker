import axiosClient from '../api/axiosClient';
import type { Challenge } from '../types/challenge';

const challengeService = {
  getAll: async (): Promise<Challenge[]> => {
    const res = await axiosClient.get<Challenge[]>('/api/challenges');
    return res.data;
  },
  join: async (id: string): Promise<Challenge> => {
    const res = await axiosClient.post<Challenge>(`/api/challenges/${id}/join`);
    return res.data;
  },
  updateProgress: async (id: string): Promise<Challenge> => {
    const res = await axiosClient.post<Challenge>(`/api/challenges/${id}/progress`);
    return res.data;
  },
  leave: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/challenges/${id}/leave`);
  },
};

export default challengeService;

import axiosClient from '../api/axiosClient';
import type { GamificationData } from '../types/gamification';

const gamificationService = {
  async getMe(): Promise<GamificationData> {
    const { data } = await axiosClient.get<GamificationData>('/api/gamification/me');
    return data;
  },
};

export default gamificationService;

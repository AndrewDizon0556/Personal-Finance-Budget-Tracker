import axiosClient from '../api/axiosClient';
import type { AnalyticsData } from '../types/analytics';

const analyticsService = {
  getAnalytics: async (): Promise<AnalyticsData> => {
    const response = await axiosClient.get<AnalyticsData>('/api/analytics');
    return response.data;
  },
};

export default analyticsService;

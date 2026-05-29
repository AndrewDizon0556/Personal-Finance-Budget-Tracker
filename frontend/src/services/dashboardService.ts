import axiosClient from '../api/axiosClient';
import type { DashboardData } from '../types/dashboard';

const dashboardService = {
  getDashboard: async (): Promise<DashboardData> => {
    const response = await axiosClient.get<DashboardData>('/api/dashboard');
    return response.data;
  },
};

export default dashboardService;

import axiosClient from '../api/axiosClient';
import type { Insight } from '../components/dashboard/InsightsWidget';

const insightsService = {
  async getInsights(): Promise<Insight[]> {
    const { data } = await axiosClient.get<Insight[]>('/api/insights');
    return data;
  },
};

export default insightsService;

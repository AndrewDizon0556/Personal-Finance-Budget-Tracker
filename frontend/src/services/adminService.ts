import axiosClient from '../api/axiosClient';

export interface GrowthPoint {
  date: string; // ISO yyyy-MM-dd
  count: number;
}

export interface AdminAnalytics {
  // Registered users
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  // Active users (based on last login)
  activeUsers7Days: number;
  activeUsers30Days: number;
  // Total app usage (sum of all logins)
  totalAppUsage: number;
  // Engagement summary
  totalTransactions: number;
  activatedUsers: number;
  avgTransactionsPerUser: number;
  activationRate: number; // 0..1
  // Growth over time
  growth: GrowthPoint[];
  asOf: string;
}

const adminService = {
  getAnalytics: async (): Promise<AdminAnalytics> => {
    const response = await axiosClient.get<AdminAnalytics>('/api/admin/analytics');
    return response.data;
  },
};

export default adminService;

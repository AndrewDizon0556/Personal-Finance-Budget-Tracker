import axiosClient from '../api/axiosClient';
import type { AppNotification } from '../types/notification';

const notificationService = {
  getNotifications: async (): Promise<AppNotification[]> => {
    const response = await axiosClient.get<AppNotification[]>('/api/notifications');
    return response.data;
  },
};

export default notificationService;

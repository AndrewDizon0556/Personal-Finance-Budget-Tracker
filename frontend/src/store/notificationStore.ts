import { create } from 'zustand';
import type { AppNotification } from '../types/notification';
import notificationService from '../services/notificationService';

interface NotificationState {
  notifications: AppNotification[];
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const notifications = await notificationService.getNotifications();
      set({ notifications, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));

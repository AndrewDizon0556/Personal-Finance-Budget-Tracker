import axiosClient from '../api/axiosClient';

export interface HelpPreference {
  id: string;
  guideName: string;
  completed: boolean;
  lastShown: string | null;
  updatedAt: string | null;
}

/**
 * Durable, cross-device persistence for guidance state. The client `helpStore`
 * is the instant/offline source of truth; these calls best-effort mirror it to
 * the backend so completed tours follow the student to another device.
 */
const helpService = {
  getPreferences: async (): Promise<HelpPreference[]> => {
    const res = await axiosClient.get<HelpPreference[]>('/api/help/preferences');
    return res.data;
  },

  upsertPreference: async (guideName: string, completed: boolean): Promise<HelpPreference> => {
    const res = await axiosClient.put<HelpPreference>('/api/help/preferences', { guideName, completed });
    return res.data;
  },

  resetAll: async (): Promise<void> => {
    await axiosClient.post('/api/help/reset');
  },
};

export default helpService;

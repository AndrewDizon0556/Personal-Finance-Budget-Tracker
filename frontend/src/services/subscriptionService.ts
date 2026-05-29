import axiosClient from '../api/axiosClient';
import type { Subscription, SubscriptionPayload } from '../types/subscription';

const subscriptionService = {
  getSubscriptions: async (): Promise<Subscription[]> => {
    const response = await axiosClient.get<Subscription[]>('/api/subscriptions');
    return response.data;
  },

  createSubscription: async (payload: SubscriptionPayload): Promise<Subscription> => {
    const response = await axiosClient.post<Subscription>('/api/subscriptions', payload);
    return response.data;
  },

  updateSubscription: async (id: string, payload: SubscriptionPayload): Promise<Subscription> => {
    const response = await axiosClient.put<Subscription>(`/api/subscriptions/${id}`, payload);
    return response.data;
  },

  deleteSubscription: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/subscriptions/${id}`);
  },
};

export default subscriptionService;

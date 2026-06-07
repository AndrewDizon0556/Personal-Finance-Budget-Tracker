import axiosClient from '../api/axiosClient';
import type { Subscription, SubscriptionPayload, PaymentStatus } from '../types/subscription';

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

  updateStatus: async (id: string, paymentStatus: PaymentStatus): Promise<Subscription> => {
    const response = await axiosClient.patch<Subscription>(`/api/subscriptions/${id}/status`, { paymentStatus });
    return response.data;
  },

  deleteSubscription: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/subscriptions/${id}`);
  },
};

export default subscriptionService;

import { create } from 'zustand';
import type { Subscription, SubscriptionPayload } from '../types/subscription';
import subscriptionService from '../services/subscriptionService';

interface SubscriptionState {
  subscriptions: Subscription[];
  isLoading: boolean;
  error: string | null;

  fetchSubscriptions: () => Promise<void>;
  addSubscription: (payload: SubscriptionPayload) => Promise<void>;
  editSubscription: (id: string, payload: SubscriptionPayload) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscriptions: [],
  isLoading: false,
  error: null,

  fetchSubscriptions: async () => {
    set({ isLoading: true, error: null });
    try {
      const subscriptions = await subscriptionService.getSubscriptions();
      set({ subscriptions, isLoading: false });
    } catch {
      set({ error: 'Failed to load subscriptions', isLoading: false });
    }
  },

  addSubscription: async (payload) => {
    const sub = await subscriptionService.createSubscription(payload);
    set((state) => ({ subscriptions: [...state.subscriptions, sub] }));
  },

  editSubscription: async (id, payload) => {
    const updated = await subscriptionService.updateSubscription(id, payload);
    set((state) => ({
      subscriptions: state.subscriptions.map((s) => (s.id === id ? updated : s)),
    }));
  },

  removeSubscription: async (id) => {
    await subscriptionService.deleteSubscription(id);
    set((state) => ({ subscriptions: state.subscriptions.filter((s) => s.id !== id) }));
  },
}));

import { create } from 'zustand';
import type { Subscription, SubscriptionPayload, PaymentStatus } from '../types/subscription';
import subscriptionService from '../services/subscriptionService';
import { useUiStore } from './uiStore';

interface SubscriptionState {
  subscriptions: Subscription[];
  isLoading: boolean;
  error: string | null;

  fetchSubscriptions: () => Promise<void>;
  addSubscription: (payload: SubscriptionPayload) => Promise<void>;
  editSubscription: (id: string, payload: SubscriptionPayload) => Promise<void>;
  setStatus: (id: string, status: PaymentStatus) => Promise<void>;
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

  setStatus: async (id, status) => {
    const updated = await subscriptionService.updateStatus(id, status);
    set((state) => ({
      subscriptions: state.subscriptions.map((s) => (s.id === id ? updated : s)),
    }));
    // Paid/Pending changes the balance and adds/removes a transaction — refresh the app.
    useUiStore.getState().bumpMutation();
  },

  removeSubscription: async (id) => {
    await subscriptionService.deleteSubscription(id);
    set((state) => ({ subscriptions: state.subscriptions.filter((s) => s.id !== id) }));
  },
}));

export type PaymentStatus = 'PAID' | 'PENDING';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  renewalDate: string;
  active: boolean;
  daysUntilRenewal: number;
  dueSoon: boolean;
  paymentStatus: PaymentStatus;
  category?: string | null;
}

export interface SubscriptionPayload {
  name: string;
  amount: number;
  renewalDate: string;
  active?: boolean;
  category?: string;
}

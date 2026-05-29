export interface Subscription {
  id: string;
  name: string;
  amount: number;
  renewalDate: string;
  active: boolean;
  daysUntilRenewal: number;
  dueSoon: boolean;
}

export interface SubscriptionPayload {
  name: string;
  amount: number;
  renewalDate: string;
  active?: boolean;
}

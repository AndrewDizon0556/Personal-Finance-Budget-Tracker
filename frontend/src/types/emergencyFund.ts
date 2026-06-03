export interface EmergencyFund {
  id: string;
  name: string;
  category: 'MEDICAL' | 'TRANSPORTATION' | 'SCHOOL' | 'GENERAL';
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  remaining: number;
  funded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyFundPayload {
  name: string;
  category: string;
  targetAmount: number;
  currentAmount?: number;
}

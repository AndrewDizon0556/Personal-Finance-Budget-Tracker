import axiosClient from '../api/axiosClient';

export type AiCoachType = 'budget_advice' | 'tutor_question' | 'categorize_expense';

/** A change the AI proposes; the user must confirm before it executes. */
export interface ProposedAction {
  type: string; // ADD_TRANSACTION | CREATE_GOAL
  transactionType?: string;
  amount?: number;
  category?: string;
  notes?: string;
  date?: string;
  goalName?: string;
  targetAmount?: number;
  targetDate?: string;
  summary?: string;
}

export interface AiCoachReply {
  reply: string;
  type: string;
  model: string;
  action?: ProposedAction | null;
}

const aiService = {
  /** Whether the AI Coach is configured on the backend (a key is set). */
  status: async (): Promise<{ enabled: boolean }> => {
    const res = await axiosClient.get<{ enabled: boolean }>('/api/ai/status');
    return res.data;
  },

  /** Ask the AI Coach. May return a proposed action awaiting confirmation. */
  coach: async (type: AiCoachType, input: string): Promise<AiCoachReply> => {
    const res = await axiosClient.post<AiCoachReply>('/api/ai/coach', { type, input });
    return res.data;
  },

  /** Execute a proposed action after the user confirms it. */
  executeAction: async (action: ProposedAction): Promise<{ message: string }> => {
    const res = await axiosClient.post<{ message: string }>('/api/ai/action', action);
    return res.data;
  },
};

export default aiService;

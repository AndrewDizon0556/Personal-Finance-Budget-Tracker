import axiosClient from '../api/axiosClient';

export type AiCoachType = 'budget_advice' | 'tutor_question' | 'categorize_expense';

export interface AiCoachReply {
  reply: string;
  type: string;
  model: string;
}

const aiService = {
  /** Whether the AI Coach is configured on the backend (a key is set). */
  status: async (): Promise<{ enabled: boolean }> => {
    const res = await axiosClient.get<{ enabled: boolean }>('/api/ai/status');
    return res.data;
  },

  /** Ask the AI Coach. `input` is required and capped at 1000 chars server-side. */
  coach: async (type: AiCoachType, input: string): Promise<AiCoachReply> => {
    const res = await axiosClient.post<AiCoachReply>('/api/ai/coach', { type, input });
    return res.data;
  },
};

export default aiService;

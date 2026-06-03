import axiosClient from '../api/axiosClient';
import type { EmergencyFund, EmergencyFundPayload } from '../types/emergencyFund';

const emergencyFundService = {
  getAll: async (): Promise<EmergencyFund[]> => {
    const res = await axiosClient.get<EmergencyFund[]>('/api/emergency-fund');
    return res.data;
  },
  create: async (payload: EmergencyFundPayload): Promise<EmergencyFund> => {
    const res = await axiosClient.post<EmergencyFund>('/api/emergency-fund', payload);
    return res.data;
  },
  update: async (id: string, payload: EmergencyFundPayload): Promise<EmergencyFund> => {
    const res = await axiosClient.put<EmergencyFund>(`/api/emergency-fund/${id}`, payload);
    return res.data;
  },
  contribute: async (id: string, amount: number): Promise<EmergencyFund> => {
    const res = await axiosClient.post<EmergencyFund>(`/api/emergency-fund/${id}/contribute`, { amount });
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/emergency-fund/${id}`);
  },
};

export default emergencyFundService;

import axiosClient from '../api/axiosClient';
import type { SplitBill, SplitBillPayload } from '../types/splitBill';

const splitBillService = {
  getSplitBills: async (): Promise<SplitBill[]> => {
    const response = await axiosClient.get<SplitBill[]>('/api/split-bills');
    return response.data;
  },

  createSplitBill: async (payload: SplitBillPayload): Promise<SplitBill> => {
    const response = await axiosClient.post<SplitBill>('/api/split-bills', payload);
    return response.data;
  },

  deleteSplitBill: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/split-bills/${id}`);
  },
};

export default splitBillService;

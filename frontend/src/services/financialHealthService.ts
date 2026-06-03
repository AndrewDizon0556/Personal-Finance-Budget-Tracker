import axiosClient from '../api/axiosClient';
import type { FinancialHealthScore, AllowancePrediction, PurchaseAdvisor } from '../types/financialHealth';

const financialHealthService = {
  getScore: async (): Promise<FinancialHealthScore> => {
    const res = await axiosClient.get<FinancialHealthScore>('/api/financial-health');
    return res.data;
  },
  getPrediction: async (): Promise<AllowancePrediction> => {
    const res = await axiosClient.get<AllowancePrediction>('/api/allowance/prediction');
    return res.data;
  },
  checkPurchase: async (amount: number, categoryId?: string): Promise<PurchaseAdvisor> => {
    const params: Record<string, string> = { amount: String(amount) };
    if (categoryId) params.categoryId = categoryId;
    const res = await axiosClient.get<PurchaseAdvisor>('/api/advisor/check', { params });
    return res.data;
  },
  exportCsv: (month?: number, year?: number): void => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (month) params.set('month', String(month));
    if (year)  params.set('year',  String(year));
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const url  = `${base}/api/export/csv?${params.toString()}`;
    // Use a temporary anchor so the browser handles the download with the JWT
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    // Append auth header via fetch + blob for authenticated download
    fetch(url, { headers: { Authorization: `Bearer ${token ?? ''}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        a.click();
        URL.revokeObjectURL(blobUrl);
      });
  },
};

export default financialHealthService;

import axiosClient from '../api/axiosClient';
import type { SchoolEvent, SchoolEventPayload } from '../types/schoolEvent';

const schoolEventService = {
  getAll: async (): Promise<SchoolEvent[]> => {
    const res = await axiosClient.get<SchoolEvent[]>('/api/school-events');
    return res.data;
  },
  getUpcoming: async (): Promise<SchoolEvent[]> => {
    const res = await axiosClient.get<SchoolEvent[]>('/api/school-events/upcoming');
    return res.data;
  },
  create: async (payload: SchoolEventPayload): Promise<SchoolEvent> => {
    const res = await axiosClient.post<SchoolEvent>('/api/school-events', payload);
    return res.data;
  },
  update: async (id: string, payload: SchoolEventPayload): Promise<SchoolEvent> => {
    const res = await axiosClient.put<SchoolEvent>(`/api/school-events/${id}`, payload);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/school-events/${id}`);
  },
};

export default schoolEventService;

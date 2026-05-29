import axiosClient from '../api/axiosClient';
import type { User } from '../types/auth';
import type { AllowanceSchedule } from '../types/auth';

export interface UpdateProfilePayload {
  fullName?: string;
  schoolName?: string;
  monthlyAllowance?: number;
  allowanceSchedule?: AllowanceSchedule;
}

const profileService = {
  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const response = await axiosClient.put<User>('/api/auth/profile', payload);
    return response.data;
  },
};

export default profileService;

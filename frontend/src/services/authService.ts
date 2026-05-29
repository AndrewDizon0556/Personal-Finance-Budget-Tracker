import axiosClient from '../api/axiosClient';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth';

const authService = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/api/auth/register', payload);
    return response.data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/api/auth/login', payload);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await axiosClient.get<User>('/api/auth/me');
    return response.data;
  },
};

export default authService;

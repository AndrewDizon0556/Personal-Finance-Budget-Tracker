export type AllowanceSchedule = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface User {
  id: string;
  fullName: string;
  schoolName: string | null;
  email: string;
  monthlyAllowance: number | null;
  allowanceSchedule: AllowanceSchedule | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  fullName: string;
  schoolName?: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

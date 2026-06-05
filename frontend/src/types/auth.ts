export type AllowanceSchedule = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
export type Role = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  schoolName: string | null;
  email: string;
  monthlyAllowance: number | null;
  allowanceSchedule: AllowanceSchedule | null;
  createdAt: string;
  role: Role;
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

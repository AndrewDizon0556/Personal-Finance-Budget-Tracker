import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle } from 'lucide-react';
import authService from '../services/authService';
import { useAuthStore } from '../store/authStore';
import AuthShell from '../components/public/AuthShell';
import TextField from '../components/ui/TextField';

const registerSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    schoolName: z.string().optional(),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setServerError(null);
      const { confirmPassword: _, ...payload } = data;
      void _;
      const response = await authService.register(payload);
      setAuth(response.user, response.token);
      navigate('/onboarding');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error.response?.data?.message ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start your Ipon Challenge journey today."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-nu-blue-700 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {serverError && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10">
          <AlertCircle size={16} className="shrink-0" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <TextField
          label="Full Name"
          placeholder="Juan Dela Cruz"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <TextField
          label="School"
          hint="(optional)"
          placeholder="NU Laguna"
          error={errors.schoolName?.message}
          {...register('schoolName')}
        />
        <TextField
          label="Email"
          type="email"
          placeholder="you@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Confirm Password"
          type="password"
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <button type="submit" disabled={isSubmitting} className="btn-primary mt-2 w-full">
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </AuthShell>
  );
}

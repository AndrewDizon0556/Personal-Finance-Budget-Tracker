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

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      const response = await authService.login(data);
      setAuth(response.user, response.token);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      if (!error.response) {
        // No response at all — the API is unreachable, not a credential problem.
        setServerError("Can't reach the server. Make sure the backend is running, then try again.");
        return;
      }
      setServerError(error.response.data?.message ?? 'Login failed. Please try again.');
    }
  };

  return (
    <AuthShell
      title="Welcome back 👋"
      subtitle="Log in to keep your streak alive."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-nu-blue-700 hover:underline">
            Sign up
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
          label="Email"
          type="email"
          placeholder="you@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Password"
          type="password"
          placeholder="Your password"
          error={errors.password?.message}
          {...register('password')}
        />
        <button type="submit" disabled={isSubmitting} className="btn-primary mt-2 w-full">
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </AuthShell>
  );
}

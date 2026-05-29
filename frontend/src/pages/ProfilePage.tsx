import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import profileService from '../services/profileService';
import type { AllowanceSchedule } from '../types/auth';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  schoolName: z.string().optional(),
  monthlyAllowance: z.coerce.number().min(0, 'Must be 0 or more').optional(),
  allowanceSchedule: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, token, setAuth } = useAuthStore();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      schoolName: user?.schoolName ?? '',
      monthlyAllowance: user?.monthlyAllowance ?? undefined,
      allowanceSchedule: (user?.allowanceSchedule as AllowanceSchedule) ?? undefined,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setServerError(null);
    setSuccess(false);
    try {
      const updated = await profileService.updateProfile({
        fullName: data.fullName,
        schoolName: data.schoolName,
        monthlyAllowance: data.monthlyAllowance,
        allowanceSchedule: data.allowanceSchedule as AllowanceSchedule,
      });
      setAuth(updated, token!);
      setSuccess(true);
    } catch {
      setServerError('Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Profile</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-sm">
        <p className="text-sm font-semibold text-gray-700 mb-5">Account Settings</p>

        {success && (
          <div className="bg-green-50 text-green-600 text-sm rounded-xl px-4 py-3 mb-4">
            Profile updated successfully.
          </div>
        )}
        {serverError && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              {...register('fullName')}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">School</label>
            <input
              type="text"
              {...register('schoolName')}
              placeholder="Optional"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
              <span className="text-gray-400 font-normal ml-1">(cannot change)</span>
            </label>
            <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-3.5 py-2.5">
              {user?.email}
            </p>
          </div>

          <hr className="border-gray-100" />

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Allowance Settings</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Monthly Allowance (₱)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('monthlyAllowance')}
              placeholder="e.g. 3000"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
            {errors.monthlyAllowance && (
              <p className="text-red-500 text-xs mt-1">{errors.monthlyAllowance.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Allowance Schedule
            </label>
            <select
              {...register('allowanceSchedule')}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            >
              <option value="">Select schedule</option>
              <option value="WEEKLY">Weekly</option>
              <option value="BIWEEKLY">Bi-weekly (every 2 weeks)</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60 mt-2"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

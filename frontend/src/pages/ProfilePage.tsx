import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Flame, Star, Trophy } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useGamificationStore } from '../store/gamificationStore';
import profileService from '../services/profileService';
import type { AllowanceSchedule } from '../types/auth';
import PageHeader from '../components/ui/PageHeader';
import TextField from '../components/ui/TextField';
import AchievementsGrid from '../components/gamification/AchievementsGrid';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  schoolName: z.string().optional(),
  monthlyAllowance: z.coerce.number().min(0, 'Must be 0 or more').optional(),
  allowanceSchedule: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, token, setAuth } = useAuthStore();
  const { data: gam, fetch: fetchGam } = useGamificationStore();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    fetchGam();
  }, []);

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

  const initials = (user?.fullName ?? 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const xpPct = gam ? Math.min(100, (gam.xpIntoLevel / Math.max(1, gam.xpForNextLevel)) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader title="Profile" subtitle="Your account and achievements." />

      {/* Hero profile card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-6 overflow-hidden rounded-4xl bg-nu-gradient p-6 text-white shadow-float"
      >
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-nu-gold-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-5">
          <span className="grid h-20 w-20 place-items-center rounded-3xl bg-white/10 font-display text-2xl font-extrabold text-nu-gold-300 backdrop-blur">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-extrabold">{user?.fullName ?? 'Student'}</h2>
            <p className="text-sm text-white/70">{user?.schoolName || 'NU Laguna'}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="chip bg-white/10 text-nu-gold-300">
                <Star size={13} fill="currentColor" /> Level {gam?.level ?? 1}
              </span>
              {(gam?.currentStreak ?? 0) > 0 && (
                <span className="chip bg-white/10 text-nu-gold-300">
                  <Flame size={13} /> {gam?.currentStreak} day streak
                </span>
              )}
              <span className="chip bg-white/10 text-white/80">{gam?.totalXp ?? 0} XP total</span>
            </div>
          </div>
        </div>

        {gam && (
          <div className="relative mt-5">
            <div className="mb-1 flex justify-between text-xs text-white/70">
              <span>Level {gam.level}</span>
              <span>
                {gam.xpIntoLevel}/{gam.xpForNextLevel} XP to Lv {gam.level + 1}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/15">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 1 }}
                className="h-full rounded-full bg-nu-gradient-gold"
              />
            </div>
          </div>
        )}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account form */}
        <div className="card p-6">
          <p className="mb-5 text-sm font-semibold text-ink">Account Settings</p>

          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:bg-emerald-500/10">
              <CheckCircle2 size={16} /> Profile updated successfully.
            </div>
          )}
          {serverError && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10">
              <AlertCircle size={16} /> {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextField label="Full Name" error={errors.fullName?.message} {...register('fullName')} />
            <TextField label="School" placeholder="Optional" {...register('schoolName')} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Email <span className="font-normal text-ink-faint">(cannot change)</span>
              </label>
              <p className="rounded-2xl bg-surface-soft px-4 py-2.5 text-sm text-ink-soft">{user?.email}</p>
            </div>

            <div className="border-t border-surface-border/60 pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">Allowance</p>
              <div className="space-y-4">
                <TextField
                  label="Monthly Allowance (₱)"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="e.g. 3000"
                  error={errors.monthlyAllowance?.message}
                  {...register('monthlyAllowance')}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Allowance Schedule</label>
                  <select {...register('allowanceSchedule')} className="input-field">
                    <option value="">Select schedule</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Bi-weekly (every 2 weeks)</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary mt-2 w-full">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Achievements */}
        <div className="card p-6">
          <div className="mb-5 flex items-center gap-2">
            <Trophy size={16} className="text-accent" />
            <p className="text-sm font-semibold text-ink">Achievements</p>
          </div>
          <AchievementsGrid achievements={gam?.achievements ?? []} />
        </div>
      </div>
    </div>
  );
}

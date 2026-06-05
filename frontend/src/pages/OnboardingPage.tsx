import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Wallet,
  ArrowRight,
  ArrowLeft,
  Target,
  PartyPopper,
  Utensils,
  Bus,
  BookOpen,
  Wifi,
  Gamepad2,
  Check,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usePrefsStore } from '../store/prefsStore';
import { useGoalStore } from '../store/goalStore';
import profileService from '../services/profileService';
import Logo from '../components/brand/Logo';
import type { AllowanceSchedule } from '../types/auth';

const HABITS = [
  { icon: Utensils, label: 'Food' },
  { icon: Bus, label: 'Transportation' },
  { icon: BookOpen, label: 'School Supplies' },
  { icon: Wifi, label: 'Load / Data' },
  { icon: Gamepad2, label: 'Leisure' },
];

const STEPS = ['Welcome', 'Allowance', 'Habits', 'First Goal', 'Done'];

export default function OnboardingPage() {
  const { user, token, setAuth, isAuthenticated } = useAuthStore();
  const setOnboarded = usePrefsStore((s) => s.setOnboarded);
  const addGoal = useGoalStore((s) => s.addGoal);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [allowance, setAllowance] = useState<string>('');
  const [schedule, setSchedule] = useState<AllowanceSchedule>('MONTHLY');
  const [habits, setHabits] = useState<string[]>([]);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const toggleHabit = (label: string) =>
    setHabits((h) => (h.includes(label) ? h.filter((x) => x !== label) : [...h, label]));

  const finish = async () => {
    setSaving(true);
    try {
      if (allowance) {
        const updated = await profileService.updateProfile({
          monthlyAllowance: Number(allowance),
          allowanceSchedule: schedule,
        });
        if (token) setAuth(updated, token);
      }
      if (goalName && goalTarget) {
        await addGoal({ goalName, targetAmount: Number(goalTarget), currentAmount: 0 });
      }
    } catch {
      /* non-blocking — let them into the app regardless */
    } finally {
      setOnboarded(true);
      navigate('/dashboard');
    }
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="relative min-h-screen overflow-hidden bg-nu-gradient">
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-nu-gold-400/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-nu-blue-400/30 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col px-5 py-8">
        <Logo light />

        {/* Progress */}
        <div className="mt-8 flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
              <motion.div
                animate={{ width: i <= step ? '100%' : '0%' }}
                className="h-full rounded-full bg-nu-gradient-gold"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-1 items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              {step === 0 && (
                <div className="text-center text-white">
                  <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-white/10 text-nu-gold-300 backdrop-blur animate-float-slow">
                    <GraduationCap size={38} />
                  </div>
                  <h1 className="font-display text-3xl font-extrabold">Welcome, {(user?.fullName ?? 'there').split(' ')[0]}! 🎉</h1>
                  <p className="mx-auto mt-3 max-w-sm text-white/70">
                    Let's set you up in under a minute so you can start tracking your money like a champion.
                  </p>
                </div>
              )}

              {step === 1 && (
                <div className="text-white">
                  <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-nu-gold-300">
                    <Wallet size={26} />
                  </div>
                  <h2 className="font-display text-2xl font-extrabold">How much is your allowance or income?</h2>
                  <p className="mt-2 text-white/70">We'll calculate your safe-to-spend amount for you.</p>

                  <div className="mt-6">
                    <label className="mb-1.5 block text-sm font-medium text-white/80">Amount (₱)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={allowance}
                      onChange={(e) => setAllowance(e.target.value)}
                      placeholder="e.g. 3000"
                      className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-display text-lg font-bold text-white placeholder:text-white/40 focus:border-nu-gold-300 focus:outline-none"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="mb-1.5 block text-sm font-medium text-white/80">How often?</label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'] as AllowanceSchedule[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setSchedule(s)}
                          className={`rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                            schedule === s
                              ? 'border-nu-gold-300 bg-white/15 text-white'
                              : 'border-white/20 text-white/60 hover:border-white/40'
                          }`}
                        >
                          {s === 'BIWEEKLY' ? 'Bi-weekly' : s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="text-white">
                  <h2 className="font-display text-2xl font-extrabold">What do you spend on most?</h2>
                  <p className="mt-2 text-white/70">Pick a few — we'll tailor your categories. (Optional)</p>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {HABITS.map((h) => {
                      const selected = habits.includes(h.label);
                      return (
                        <button
                          key={h.label}
                          onClick={() => toggleHabit(h.label)}
                          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                            selected ? 'border-nu-gold-300 bg-white/15' : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-nu-gold-300">
                            <h.icon size={20} />
                          </span>
                          <span className="flex-1 text-sm font-semibold text-white">{h.label}</span>
                          {selected && <Check size={16} className="text-nu-gold-300" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-white">
                  <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-nu-gold-300">
                    <Target size={26} />
                  </div>
                  <h2 className="font-display text-2xl font-extrabold">Set your first savings goal</h2>
                  <p className="mt-2 text-white/70">Dream big — a laptop, tuition, a trip. (Optional)</p>
                  <div className="mt-6 space-y-3">
                    <input
                      value={goalName}
                      onChange={(e) => setGoalName(e.target.value)}
                      placeholder="Goal name (e.g. New Laptop)"
                      className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-nu-gold-300 focus:outline-none"
                    />
                    <input
                      type="number"
                      inputMode="decimal"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      placeholder="Target amount (₱)"
                      className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-nu-gold-300 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center text-white">
                  <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-nu-gradient-gold text-nu-blue-900 animate-float-slow">
                    <PartyPopper size={38} />
                  </div>
                  <h1 className="font-display text-3xl font-extrabold">You're all set!</h1>
                  <p className="mx-auto mt-3 max-w-sm text-white/70">
                    Your dashboard is ready. Log your first expense and start your savings streak today.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          {step > 0 && step < STEPS.length - 1 ? (
            <button onClick={back} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white">
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <span />
          )}

          {step < STEPS.length - 1 ? (
            <div className="flex items-center gap-3">
              {(step === 2 || step === 3) && (
                <button onClick={next} className="text-sm font-semibold text-white/60 hover:text-white">
                  Skip
                </button>
              )}
              <button onClick={next} className="btn-gold">
                Continue <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <button onClick={finish} disabled={saving} className="btn-gold ml-auto">
              {saving ? 'Setting up...' : 'Go to Dashboard'} <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

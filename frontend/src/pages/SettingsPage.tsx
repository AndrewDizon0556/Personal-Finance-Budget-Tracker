import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Palette, Bell, Check, ShieldCheck, LogOut, AlertCircle, CheckCircle2, LifeBuoy, PlayCircle, RotateCcw } from 'lucide-react';
import { useThemeStore, ACCENT_PRESETS, type AccentKey } from '../store/themeStore';
import { usePrefsStore } from '../store/prefsStore';
import { useAuthStore } from '../store/authStore';
import { useHelpStore } from '../store/helpStore';
import authService from '../services/authService';
import PageHeader from '../components/ui/PageHeader';
import TextField from '../components/ui/TextField';

export default function SettingsPage() {
  const { mode, setMode, accent, setAccent } = useThemeStore();
  const prefs = usePrefsStore();

  const notifItems: { key: 'budgetAlerts' | 'renewalReminders' | 'streakNudges' | 'weeklyDigest'; label: string; desc: string }[] = [
    { key: 'budgetAlerts', label: 'Budget alerts', desc: 'Warn me before I overspend my allowance.' },
    { key: 'renewalReminders', label: 'Renewal reminders', desc: 'Remind me before subscriptions renew.' },
    { key: 'streakNudges', label: 'Streak nudges', desc: 'Nudge me to keep my savings streak alive.' },
    { key: 'weeklyDigest', label: 'Weekly digest', desc: 'A weekly summary of my spending.' },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <PageHeader title="Settings" subtitle="Make Ipon Challenge yours." />

      {/* Appearance */}
      <div className="card mb-5 p-6">
        <div className="mb-5 flex items-center gap-2">
          <Palette size={16} className="text-accent" />
          <p className="text-sm font-semibold text-ink">Appearance</p>
        </div>

        <p className="mb-2 text-sm font-medium text-ink">Theme</p>
        <div className="mb-6 grid grid-cols-2 gap-3">
          {(['light', 'dark'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                mode === m
                  ? 'border-nu-blue-400 bg-nu-blue-50 text-nu-blue-700 dark:bg-nu-blue-500/10'
                  : 'border-surface-border text-ink-soft hover:border-nu-blue-300'
              }`}
            >
              {m === 'light' ? <Sun size={18} /> : <Moon size={18} />}
              {m === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>

        <p className="mb-2 text-sm font-medium text-ink">Accent color</p>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(ACCENT_PRESETS) as AccentKey[]).map((key) => {
            const preset = ACCENT_PRESETS[key];
            const selected = accent === key;
            return (
              <button
                key={key}
                onClick={() => setAccent(key)}
                className="flex flex-col items-center gap-1.5"
                aria-label={preset.label}
              >
                <span
                  className="grid h-11 w-11 place-items-center rounded-2xl ring-2 ring-offset-2 ring-offset-surface transition-all"
                  style={{
                    backgroundColor: `rgb(${preset.rgb})`,
                    // @ts-expect-error custom prop
                    '--tw-ring-color': selected ? `rgb(${preset.rgb})` : 'transparent',
                  }}
                >
                  {selected && <Check size={18} className="text-white" />}
                </span>
                <span className="text-[11px] font-medium text-ink-soft">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      <div className="card mb-5 p-6">
        <div className="mb-5 flex items-center gap-2">
          <Bell size={16} className="text-accent" />
          <p className="text-sm font-semibold text-ink">Notifications</p>
        </div>

        <div className="space-y-2">
          {notifItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4 rounded-2xl bg-surface-soft/60 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{item.label}</p>
                <p className="text-xs text-ink-soft">{item.desc}</p>
              </div>
              <Toggle on={prefs[item.key]} onClick={() => prefs.toggle(item.key)} />
            </div>
          ))}
        </div>
      </div>

      {/* Help preferences */}
      <HelpPreferencesSection />

      {/* Security */}
      <SecuritySection />
    </div>
  );
}

function HelpPreferencesSection() {
  const navigate = useNavigate();
  const tipsEnabled = useHelpStore((s) => s.tipsEnabled);
  const setTipsEnabled = useHelpStore((s) => s.setTipsEnabled);
  const resetAllGuides = useHelpStore((s) => s.resetAllGuides);
  const openTour = useHelpStore((s) => s.openTour);

  const restartTour = () => {
    resetAllGuides();
    openTour();
    navigate('/dashboard');
  };

  const resetGuides = () => {
    if (!window.confirm('Reset all tips and guides? They will appear again as you use the app.')) return;
    resetAllGuides();
  };

  return (
    <div className="card mb-5 p-6">
      <div className="mb-5 flex items-center gap-2">
        <LifeBuoy size={16} className="text-accent" />
        <p className="text-sm font-semibold text-ink">Help &amp; Tips</p>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl bg-surface-soft/60 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">Show tips</p>
          <p className="text-xs text-ink-soft">Display the small (?) help icons and coach-marks around the app.</p>
        </div>
        <Toggle on={tipsEnabled} onClick={() => setTipsEnabled(!tipsEnabled)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={restartTour} className="btn-ghost justify-start">
          <PlayCircle size={16} /> Restart tutorial
        </button>
        <button onClick={resetGuides} className="btn-ghost justify-start">
          <RotateCcw size={16} /> Reset all guides
        </button>
      </div>
    </div>
  );
}

function SecuritySection() {
  const { token, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const strongEnough =
    next.length >= 12 && /[a-z]/.test(next) && /[A-Z]/.test(next) && /\d/.test(next) && /[^A-Za-z0-9]/.test(next);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!strongEnough) {
      setError('New password must be 12+ chars with upper, lower, number, and a special character.');
      return;
    }
    if (next !== confirm) {
      setError('New passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const res = await authService.changePassword(current, next);
      setAuth(res.user, res.token); // adopt the freshly-issued token
      setSuccess(true);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: { message?: string } } };
      setError(e2.response?.data?.message ?? 'Could not change password.');
    } finally {
      setBusy(false);
    }
  };

  const logoutAll = async () => {
    if (!window.confirm('Log out of all devices? You will need to sign in again.')) return;
    try {
      await authService.logoutAll();
    } catch {
      /* even if it fails, clear locally */
    }
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="card p-6">
      <div className="mb-5 flex items-center gap-2">
        <ShieldCheck size={16} className="text-accent" />
        <p className="text-sm font-semibold text-ink">Security</p>
      </div>

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:bg-emerald-500/10">
          <CheckCircle2 size={16} /> Password changed. Other devices have been signed out.
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <TextField
          label="Current Password"
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
        />
        <TextField
          label="New Password"
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          autoComplete="new-password"
          hint="(12+ chars, mixed case, number, symbol)"
        />
        <TextField
          label="Confirm New Password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
        <button type="submit" disabled={busy || !token} className="btn-primary w-full">
          {busy ? 'Updating...' : 'Change Password'}
        </button>
      </form>

      <div className="mt-5 border-t border-surface-border/60 pt-5">
        <button onClick={logoutAll} className="btn-ghost w-full text-rose-500">
          <LogOut size={16} /> Log out of all devices
        </button>
      </div>
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-nu-blue-700' : 'bg-surface-border'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          on ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

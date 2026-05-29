import { Moon, Sun, Palette, Bell, Check } from 'lucide-react';
import { useThemeStore, ACCENT_PRESETS, type AccentKey } from '../store/themeStore';
import { usePrefsStore } from '../store/prefsStore';
import PageHeader from '../components/ui/PageHeader';

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
      <div className="card p-6">
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

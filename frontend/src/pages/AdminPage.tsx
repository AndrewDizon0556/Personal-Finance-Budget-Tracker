import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, UserPlus, Activity, MousePointerClick,
  Receipt, Sparkles, RefreshCw, ShieldAlert, TrendingUp,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import adminService, { type AdminAnalytics } from '../services/adminService';

type Metric = {
  label: string;
  value: string;
  sub?: string;
  icon: typeof Users;
  fg: string;
  bg: string;
};

const fmt = (n: number) => n.toLocaleString('en-PH');

export default function AdminPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    setForbidden(false);
    try {
      setData(await adminService.getAnalytics());
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) setForbidden(true);
      else setError('Could not load analytics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const metrics: Metric[] = data ? [
    { label: 'Total registered users', value: fmt(data.totalUsers), icon: Users, fg: 'text-nu-blue-600', bg: 'bg-nu-blue-100 dark:bg-nu-blue-500/25 dark:text-nu-blue-300' },
    { label: 'Active users', sub: 'last 7 days', value: fmt(data.activeUsers7Days), icon: Activity, fg: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/25 dark:text-emerald-300' },
    { label: 'Total app usage', sub: 'logins all-time', value: fmt(data.totalAppUsage), icon: MousePointerClick, fg: 'text-violet-600', bg: 'bg-violet-100 dark:bg-violet-500/25 dark:text-violet-300' },
    { label: 'New users', sub: 'last 30 days', value: fmt(data.newUsersThisMonth), icon: UserPlus, fg: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-500/25 dark:text-orange-300' },
  ] : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={load}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-lg bg-nu-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-nu-blue-700 disabled:opacity-60"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-nu-gradient text-white">
          <TrendingUp size={20} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">App Growth Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Admin-only usage and engagement insights · aggregated data</p>
        </div>
      </div>

      {forbidden && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <div className="mb-1 flex items-center gap-2 font-semibold">
            <ShieldAlert size={18} /> Admin access required
          </div>
          <p className="text-sm">Your account is signed in but is not an admin, so this data is hidden from you.</p>
        </div>
      )}

      {error && !forbidden && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      )}

      {!forbidden && !error && (
        <>
          {/* Key metric cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {(data ? metrics : Array.from({ length: 4 })).map((m, i) => {
              if (!data) return <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />;
              const c = m as Metric;
              const Icon = c.icon;
              return (
                <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
                  <div className={`mb-3 inline-flex rounded-xl p-2 ${c.bg}`}>
                    <Icon size={20} className={c.fg} />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 sm:text-3xl">{c.value}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{c.label}</div>
                  {c.sub && <div className="text-[11px] text-slate-400">{c.sub}</div>}
                </div>
              );
            })}
          </div>

          {/* Growth over time */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
            <div className="mb-1 flex items-center gap-2">
              <TrendingUp size={16} className="text-nu-blue-600" />
              <h2 className="font-semibold text-slate-800 dark:text-slate-100">New users over time</h2>
            </div>
            <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Daily signups · last 30 days</p>
            {data ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.growth} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4d5db4" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#4d5db4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d: string) => d.slice(5)}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    interval="preserveStartEnd"
                    minTickGap={24}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} width={28} />
                  <Tooltip
                    labelFormatter={(d) => `Date: ${d}`}
                    formatter={(v: number) => [`${v} new user${v === 1 ? '' : 's'}`, 'Signups']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#4d5db4" strokeWidth={2} fill="url(#growthFill)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            )}
          </div>

          {/* New-user breakdown + Activity summary */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                <UserPlus size={16} className="text-emerald-600" /> Signups breakdown
              </h2>
              <dl className="space-y-3">
                <Row label="Today" value={data ? fmt(data.newUsersToday) : '—'} />
                <Row label="Last 7 days" value={data ? fmt(data.newUsersThisWeek) : '—'} />
                <Row label="Last 30 days" value={data ? fmt(data.newUsersThisMonth) : '—'} />
                <Row label="Active (last 30 days)" value={data ? fmt(data.activeUsers30Days) : '—'} />
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                <Sparkles size={16} className="text-violet-600" /> User activity summary
              </h2>
              <dl className="space-y-3">
                <Row label={<span className="flex items-center gap-1.5"><Receipt size={14} /> Total transactions logged</span>} value={data ? fmt(data.totalTransactions) : '—'} />
                <Row label="Activated users (≥1 transaction)" value={data ? fmt(data.activatedUsers) : '—'} />
                <Row label="Avg. transactions / user" value={data ? data.avgTransactionsPerUser.toFixed(1) : '—'} />
              </dl>
              {data && (
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Activation rate</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{Math.round(data.activationRate * 100)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.min(100, data.activationRate * 100)}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {data && (
            <p className="mt-4 text-right text-xs text-slate-400">
              As of {new Date(data.asOf).toLocaleString('en-PH')}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: ReactNode; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0 dark:border-slate-800">
      <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</dd>
    </div>
  );
}

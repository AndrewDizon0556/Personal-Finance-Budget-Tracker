import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import axiosClient from '../api/axiosClient';
import type { Expense } from '../types/expense';
import { useAuthStore } from '../store/authStore';
import { formatPeso } from '../lib/utils';
import financialHealthService from '../services/financialHealthService';

const COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316'];

type GroupedCategory = { name: string; amount: number; count: number };

function groupByCategory(expenses: Expense[]): GroupedCategory[] {
  const map = new Map<string, { amount: number; count: number }>();
  for (const e of expenses) {
    if (e.transactionType !== 'EXPENSE') continue;
    const key = e.categoryName || 'Uncategorized';
    const cur = map.get(key) ?? { amount: 0, count: 0 };
    map.set(key, { amount: cur.amount + e.amount, count: cur.count + 1 });
  }
  return Array.from(map.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.amount - a.amount);
}

export default function ReportPage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { load(); }, [month, year]);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get<Expense[]>('/api/expenses', { params: { month, year } });
      setExpenses(res.data);
    } finally { setIsLoading(false); }
  };

  const totalIncome  = expenses.filter(e => e.transactionType === 'INCOME').reduce((s, e) => s + e.amount, 0);
  const totalExpense = expenses.filter(e => e.transactionType === 'EXPENSE').reduce((s, e) => s + e.amount, 0);
  const net          = totalIncome - totalExpense;
  const categories   = groupByCategory(expenses);

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });

  const handlePrint = () => window.print();
  const handleCsv   = () => financialHealthService.exportCsv(month, year);

  return (
    <>
      {/* ── Screen-only controls ───────────────────────────────── */}
      <div className="print:hidden mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
            <ArrowLeft size={15} /> Back
          </button>
          <div className="flex items-center gap-2">
            <select value={month} onChange={e => setMonth(+e.target.value)} className="input-field text-sm">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i+1} value={i+1}>
                  {new Date(2000, i, 1).toLocaleDateString('en-PH', { month: 'long' })}
                </option>
              ))}
            </select>
            <select value={year} onChange={e => setYear(+e.target.value)} className="input-field text-sm">
              {[year - 1, year, year + 1].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCsv} className="btn-ghost flex items-center gap-1.5 text-sm">
              <Download size={15} /> CSV
            </button>
            <button onClick={handlePrint} className="btn-primary flex items-center gap-1.5 text-sm">
              <Printer size={15} /> Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── Printable report body ──────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-6 py-4 print:max-w-full print:px-8 print:py-6">

        {/* Report header */}
        <div className="mb-6 border-b-2 border-nu-blue-700 pb-4 print:border-black">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-nu-blue-800 dark:text-nu-blue-300 print:text-black">
                Ipon Challenge
              </h1>
              <p className="text-sm text-ink-faint print:text-gray-600">Monthly Financial Report</p>
            </div>
            <div className="text-right text-sm text-ink-faint print:text-gray-600">
              <p className="font-semibold text-ink print:text-black">{user?.fullName}</p>
              {user?.schoolName && <p>{user.schoolName}</p>}
              <p>{monthLabel}</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-ink-faint">Loading…</p>
        ) : (
          <>
            {/* Summary cards */}
            <div className="mb-6 grid grid-cols-3 gap-4 print:gap-3">
              {[
                { label: 'Total Income',  value: totalIncome,  color: 'text-emerald-600' },
                { label: 'Total Expenses',value: totalExpense, color: 'text-rose-600'    },
                { label: 'Net Balance',   value: net,          color: net >= 0 ? 'text-emerald-600' : 'text-rose-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-2xl border border-surface-border p-4 print:rounded-none print:border-gray-300">
                  <p className="text-xs text-ink-faint print:text-gray-500">{label}</p>
                  <p className={`font-display text-lg font-bold ${color} print:text-black`}>{formatPeso(value)}</p>
                </div>
              ))}
            </div>

            {/* Charts — hide in print if too complex */}
            {categories.length > 0 && (
              <div className="mb-6 grid grid-cols-2 gap-4 print:hidden">
                {/* Pie chart */}
                <div>
                  <p className="mb-2 text-xs font-semibold text-ink-faint uppercase tracking-wide">By Category</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={categories} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                        {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatPeso(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Bar chart */}
                <div>
                  <p className="mb-2 text-xs font-semibold text-ink-faint uppercase tracking-wide">Top Spending</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={categories.slice(0, 5)} layout="vertical" margin={{ left: 8 }}>
                      <CartesianGrid horizontal={false} stroke="var(--color-surface-border)" />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                      <Tooltip formatter={(v: number) => formatPeso(v)} />
                      <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                        {categories.slice(0, 5).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Category breakdown table */}
            {categories.length > 0 && (
              <div className="mb-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint print:text-gray-500">Expenses by Category</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border print:border-gray-300">
                      <th className="pb-1 text-left font-semibold text-ink-soft print:text-gray-600">Category</th>
                      <th className="pb-1 text-right font-semibold text-ink-soft print:text-gray-600">Transactions</th>
                      <th className="pb-1 text-right font-semibold text-ink-soft print:text-gray-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c, i) => (
                      <tr key={c.name} className="border-b border-surface-border/40 print:border-gray-200">
                        <td className="py-1.5 flex items-center gap-2 text-ink">
                          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          {c.name}
                        </td>
                        <td className="py-1.5 text-right text-ink-faint print:text-gray-500">{c.count}</td>
                        <td className="py-1.5 text-right font-semibold text-ink">{formatPeso(c.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Full transaction list */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint print:text-gray-500">All Transactions</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-surface-border print:border-gray-300">
                    {['Date','Category','Type','Amount','Notes'].map(h => (
                      <th key={h} className="pb-1 text-left font-semibold text-ink-soft print:text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(e => (
                    <tr key={e.id} className="border-b border-surface-border/30 print:border-gray-100">
                      <td className="py-1 text-ink-faint">{e.expenseDate}</td>
                      <td className="py-1 text-ink">{e.categoryName}</td>
                      <td className={`py-1 font-medium ${e.transactionType === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {e.transactionType === 'INCOME' ? 'Income' : 'Expense'}
                      </td>
                      <td className="py-1 font-semibold text-ink">{formatPeso(e.amount)}</td>
                      <td className="py-1 text-ink-faint">{e.notes ?? '—'}</td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr><td colSpan={5} className="py-4 text-center text-ink-faint">No transactions this month.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Print footer */}
            <div className="mt-8 hidden border-t border-gray-300 pt-3 text-center text-[10px] text-gray-400 print:block">
              Generated by Ipon Challenge · {new Date().toLocaleDateString('en-PH', { dateStyle: 'long' })}
            </div>
          </>
        )}
      </div>

      {/* Print styles — Tailwind print: variants handle most of it */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </>
  );
}

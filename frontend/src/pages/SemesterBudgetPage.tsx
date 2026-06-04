import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GraduationCap, ArrowLeft, X } from 'lucide-react';
import { useSemesterBudgetStore } from '../store/semesterBudgetStore';
import semesterBudgetService from '../services/semesterBudgetService';
import type { SemesterBudget, SemesterBudgetPayload, WeeklyBreakdown } from '../types/semesterBudget';
import SemesterBudgetCard from '../components/semesterBudget/SemesterBudgetCard';
import SemesterBudgetForm from '../components/semesterBudget/SemesterBudgetForm';
import WeeklyBreakdownChart from '../components/semesterBudget/WeeklyBreakdownChart';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import EmptyStateGuide from '../components/help/EmptyStateGuide';
import FeatureGuide from '../components/help/FeatureGuide';
import { formatPeso, clamp } from '../lib/utils';
import { staggerContainer, popIn } from '../lib/motion';
import { TOOLTIPS, GUIDE, SEMESTER_BUDGET_STEPS } from '../lib/helpContent';

// ─── Detail view for a single semester ───────────────────────────────────────
function SemesterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [semester, setSemester] = useState<SemesterBudget | null>(null);
  const [weeks, setWeeks] = useState<WeeklyBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      semesterBudgetService.getOne(id),
      semesterBudgetService.getWeeklyBreakdown(id),
    ])
      .then(([s, w]) => { setSemester(s); setWeeks(w); })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <div className="mx-auto max-w-2xl px-4 py-8"><div className="skeleton h-64 w-full rounded-3xl" /></div>;
  if (!semester) return null;

  const pct = clamp(semester.progressPercentage, 0, 100);
  const currentWeek = weeks.find((w) => w.isCurrent);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <button onClick={() => navigate('/semester-budget')} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft size={15} /> Back to Semesters
      </button>

      <div className="card mb-5 p-6">
        <div className="mb-4 flex items-start justify-between gap-2">
          <h1 className="font-display text-xl font-bold text-ink">{semester.semesterName}</h1>
          <span className="text-xs text-ink-faint">{semester.startDate} → {semester.endDate}</span>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Budget', value: formatPeso(semester.totalBudget) },
            { label: 'Spent', value: formatPeso(semester.totalSpent) },
            { label: 'Remaining', value: formatPeso(semester.remaining) },
            { label: 'Weekly Budget', value: formatPeso(semester.weeklyBudget) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl bg-surface-soft/70 px-3 py-3 text-center">
              <p className="text-[10px] text-ink-faint">{label}</p>
              <p className="mt-0.5 text-sm font-bold text-ink">{value}</p>
            </div>
          ))}
        </div>

        <div className="mb-2 flex justify-between text-xs text-ink-faint">
          <span>{pct.toFixed(1)}% used · Week {semester.weeksElapsed}/{semester.totalWeeks}</span>
          <span>{semester.weeksRemaining} week{semester.weeksRemaining !== 1 ? 's' : ''} remaining</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-surface-soft">
          <div
            className="h-full rounded-full bg-nu-blue-600 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-ink-soft">{semester.statusMessage}</p>
      </div>

      {currentWeek && (
        <div className={`card mb-5 border-l-4 p-5 ${
          currentWeek.status === 'OVERSPENT' ? 'border-rose-500' :
          currentWeek.status === 'WARNING'   ? 'border-amber-400' : 'border-emerald-500'
        }`}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">This Week</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-lg font-bold text-ink">{formatPeso(currentWeek.spentAmount)}</p>
              <p className="text-xs text-ink-soft">spent of {formatPeso(currentWeek.allocatedAmount)} allocated</p>
            </div>
            <div className="text-right">
              {currentWeek.status === 'OVERSPENT' ? (
                <p className="text-sm font-semibold text-rose-600">Over budget!</p>
              ) : currentWeek.status === 'WARNING' ? (
                <p className="text-sm font-semibold text-amber-600">
                  {formatPeso(currentWeek.remainingAmount)} left — slow down
                </p>
              ) : (
                <p className="text-sm font-semibold text-emerald-600">
                  {formatPeso(currentWeek.remainingAmount)} remaining
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {weeks.length > 0 && (
        <div className="card p-5">
          <WeeklyBreakdownChart weeks={weeks} />
          <div className="mt-4 space-y-1.5">
            {weeks.map((w) => (
              <div
                key={w.weekNumber}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs ${
                  w.isCurrent ? 'bg-nu-blue-50 dark:bg-nu-blue-500/10 font-semibold' : 'bg-surface-soft/40'
                }`}
              >
                <span className="text-ink-soft">
                  Week {w.weekNumber} {w.isCurrent && <span className="text-nu-blue-600">← now</span>}
                </span>
                <span className="text-ink-faint">{w.weekStart} – {w.weekEnd}</span>
                <span className={`font-semibold ${
                  w.status === 'OVERSPENT' ? 'text-rose-600' :
                  w.status === 'WARNING'   ? 'text-amber-600' :
                  w.status === 'UPCOMING'  ? 'text-ink-faint' : 'text-emerald-600'
                }`}>
                  {w.status === 'UPCOMING' ? '—' : formatPeso(w.spentAmount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── List view ────────────────────────────────────────────────────────────────
export default function SemesterBudgetPage() {
  const { id } = useParams<{ id?: string }>();
  if (id) return <SemesterDetailPage />;

  const { semesters, isLoading, error, fetchSemesters, addSemester, editSemester, removeSemester } =
    useSemesterBudgetStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SemesterBudget | null>(null);

  useEffect(() => { fetchSemesters(); }, []);

  const handleSubmit = async (data: SemesterBudgetPayload) => {
    if (editing) await editSemester(editing.id, data);
    else await addSemester(data);
    setShowForm(false);
    setEditing(null);
  };

  const openEdit = (s: SemesterBudget) => { setEditing(s); setShowForm(true); };
  const openCreate = () => { setEditing(null); setShowForm(true); };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this semester budget?')) return;
    await removeSemester(id);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Semester Budget"
        help={TOOLTIPS.semesterBudget}
        subtitle="Plan your finances for the whole semester."
        action={
          !showForm ? (
            <button onClick={openCreate} className="btn-gold hidden sm:inline-flex">
              <Plus size={18} /> New Semester
            </button>
          ) : undefined
        }
      />

      <FeatureGuide
        guideName={GUIDE.SEMESTER_GUIDE}
        title="Semester Budget"
        steps={SEMESTER_BUDGET_STEPS}
      />

      <AnimatePresence>
        {showForm && (
          <motion.div
            variants={popIn}
            initial="hidden"
            animate="show"
            exit="exit"
            className="card mb-6 p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display font-bold text-ink">
                {editing ? 'Edit Semester' : 'New Semester Budget'}
              </p>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="rounded-xl p-1.5 hover:bg-surface-soft">
                <X size={16} className="text-ink-faint" />
              </button>
            </div>
            <SemesterBudgetForm onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditing(null); }} editing={editing} />
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => <div key={i} className="skeleton h-52 w-full" />)}
        </div>
      ) : error ? (
        <EmptyState icon={GraduationCap} title="Couldn't load semester budgets" message={error} />
      ) : semesters.length === 0 ? (
        <EmptyStateGuide
          emoji="🎓"
          title="No semester budgets yet"
          message="Divide your total semester money into a realistic weekly budget so it lasts the whole term."
          actionLabel="Create Semester Budget"
          onAction={openCreate}
          helpHref="/help#semester-budget"
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {semesters.map((s) => (
            <SemesterBudgetCard key={s.id} semester={s} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </motion.div>
      )}

      {/* Mobile FAB */}
      {!showForm && (
        <button
          onClick={openCreate}
          className="fixed bottom-24 left-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-nu-gradient-gold text-nu-blue-900 shadow-glow sm:hidden"
          aria-label="New semester budget"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

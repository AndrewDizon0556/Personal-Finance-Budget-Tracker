import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CalendarDays, X, Lightbulb } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import schoolEventService from '../services/schoolEventService';
import type { SchoolEvent, SchoolEventPayload, EventCategory } from '../types/schoolEvent';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import TextField from '../components/ui/TextField';
import { formatPeso } from '../lib/utils';
import { staggerContainer, fadeUpItem, popIn } from '../lib/motion';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  date: z.string().min(1, 'Date is required'),
  category: z.enum(['EXAM', 'PROJECT', 'TUITION', 'EVENT', 'DEADLINE']),
  estimatedCost: z.number().min(0).optional().nullable(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const CAT_ICONS: Record<string, string> = {
  EXAM: '📝', PROJECT: '🗂️', TUITION: '🏫', EVENT: '🎉', DEADLINE: '⏰',
};
const CAT_COLORS: Record<string, string> = {
  EXAM: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15',
  PROJECT: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15',
  TUITION: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15',
  EVENT: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15',
  DEADLINE: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15',
};

export default function SchoolCalendarPage() {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SchoolEvent | null>(null);
  const [tab, setTab] = useState<'upcoming' | 'all'>('upcoming');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => { load(); }, [tab]);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = tab === 'upcoming'
        ? await schoolEventService.getUpcoming()
        : await schoolEventService.getAll();
      setEvents(data);
    } finally { setIsLoading(false); }
  };

  const openCreate = () => { setEditing(null); reset({}); setShowForm(true); };
  const openEdit = (e: SchoolEvent) => {
    setEditing(e);
    reset({ title: e.title, date: e.date, category: e.category as EventCategory,
            estimatedCost: e.estimatedCost ?? undefined, notes: e.notes ?? '' });
    setShowForm(true);
  };

  const onSubmit = async (data: FormData) => {
    const payload: SchoolEventPayload = {
      title: data.title, date: data.date, category: data.category,
      estimatedCost: data.estimatedCost ?? null, notes: data.notes,
    };
    if (editing) await schoolEventService.update(editing.id, payload);
    else await schoolEventService.create(payload);
    setShowForm(false); setEditing(null); await load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;
    await schoolEventService.remove(id); await load();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader title="School Calendar" subtitle="Plan ahead. Budget smarter."
        action={!showForm ? (
          <button onClick={openCreate} className="btn-gold hidden sm:inline-flex"><Plus size={18} /> Add Event</button>
        ) : undefined} />

      <div className="mb-5 flex gap-2">
        {(['upcoming', 'all'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-2xl px-4 py-1.5 text-sm font-semibold transition-colors ${tab === t ? 'bg-nu-blue-700 text-white' : 'bg-surface-soft text-ink-soft hover:bg-surface-border'}`}>
            {t === 'upcoming' ? '⏳ Upcoming (30 days)' : '📅 All Events'}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div variants={popIn} initial="hidden" animate="show" exit="exit" className="card mb-6 p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display font-bold text-ink">{editing ? 'Edit Event' : 'New School Event'}</p>
              <button onClick={() => setShowForm(false)} className="rounded-xl p-1.5 hover:bg-surface-soft">
                <X size={16} className="text-ink-faint" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <TextField label="Event Title" placeholder="e.g. Midterm Exams" error={errors.title?.message} {...register('title')} />
              <TextField label="Date" type="date" error={errors.date?.message} {...register('date')} />
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-soft">Category</label>
                <select className="input-field w-full" {...register('category')}>
                  <option value="EXAM">📝 Exam</option>
                  <option value="PROJECT">🗂️ Project</option>
                  <option value="TUITION">🏫 Tuition</option>
                  <option value="EVENT">🎉 Event</option>
                  <option value="DEADLINE">⏰ Deadline</option>
                </select>
              </div>
              <TextField label="Estimated Cost (₱)" type="number" placeholder="0" hint="(optional)" error={errors.estimatedCost?.message} {...register('estimatedCost', { valueAsNumber: true })} />
              <TextField label="Notes" placeholder="Any details..." {...register('notes')} />
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting ? 'Saving…' : editing ? 'Update' : 'Add Event'}</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="space-y-3">{[0,1,2].map(i => <div key={i} className="skeleton h-20 w-full" />)}</div>
      ) : events.length === 0 ? (
        <EmptyState icon={CalendarDays} title={tab === 'upcoming' ? 'No upcoming events' : 'No events yet'}
          message="Add exams, projects, or tuition deadlines to get budget suggestions."
          action={<button onClick={openCreate} className="btn-gold"><Plus size={18} /> Add Event</button>} />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-3">
          {events.map(ev => (
            <motion.div key={ev.id} variants={fadeUpItem} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex flex-col items-center rounded-2xl bg-surface-soft px-3 py-2 text-center min-w-[48px]">
                  <p className="text-[10px] font-semibold text-ink-faint">{new Date(ev.date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short' })}</p>
                  <p className="font-display text-lg font-bold text-ink leading-none">{new Date(ev.date + 'T00:00:00').getDate()}</p>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-sm font-bold text-ink">{ev.title}</p>
                    <span className={`chip text-[10px] ${CAT_COLORS[ev.category]}`}>{CAT_ICONS[ev.category]} {ev.category}</span>
                    {ev.isUpcoming && ev.daysUntil === 0 && <span className="chip bg-rose-100 text-rose-700 text-[10px]">Today!</span>}
                    {ev.isUpcoming && ev.daysUntil > 0 && <span className="chip bg-amber-50 text-amber-600 text-[10px]">in {ev.daysUntil}d</span>}
                  </div>
                  {ev.estimatedCost && <p className="mt-0.5 text-xs text-ink-faint">Est. cost: {formatPeso(ev.estimatedCost)}</p>}
                  {ev.notes && <p className="mt-0.5 text-xs text-ink-faint">{ev.notes}</p>}
                  {ev.budgetSuggestion && (
                    <div className="mt-2 flex items-start gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                      <Lightbulb size={12} className="mt-0.5 shrink-0" />
                      {ev.budgetSuggestion}
                    </div>
                  )}
                </div>

                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => openEdit(ev)} className="rounded-xl px-2 py-1 text-xs font-semibold text-ink-soft hover:bg-surface-soft hover:text-nu-blue-600">Edit</button>
                  <button onClick={() => handleDelete(ev.id)} className="rounded-xl px-2 py-1 text-xs font-semibold text-ink-soft hover:bg-surface-soft hover:text-rose-500">Delete</button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!showForm && (
        <button onClick={openCreate} className="fixed bottom-24 right-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-nu-gradient-gold text-nu-blue-900 shadow-glow sm:hidden"><Plus size={22} strokeWidth={2.5} /></button>
      )}
    </div>
  );
}

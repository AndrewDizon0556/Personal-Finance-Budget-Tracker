import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Shield, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import emergencyFundService from '../services/emergencyFundService';
import type { EmergencyFund, EmergencyFundPayload } from '../types/emergencyFund';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import ProgressRing from '../components/ui/ProgressRing';
import TextField from '../components/ui/TextField';
import { formatPeso, clamp } from '../lib/utils';
import { staggerContainer, fadeUpItem, popIn } from '../lib/motion';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  category: z.enum(['MEDICAL', 'TRANSPORTATION', 'SCHOOL', 'GENERAL']),
  targetAmount: z.number({ invalid_type_error: 'Required' }).min(1, 'Must be at least ₱1'),
  currentAmount: z.number().min(0).optional(),
});
type FormData = z.infer<typeof schema>;

const CATEGORY_ICONS: Record<string, string> = {
  MEDICAL: '🏥', TRANSPORTATION: '🚌', SCHOOL: '🎓', GENERAL: '🛡️',
};
const CATEGORY_COLORS: Record<string, string> = {
  MEDICAL: 'bg-rose-100 text-rose-700 dark:bg-rose-500/25 dark:text-rose-300',
  TRANSPORTATION: 'bg-sky-100 text-sky-700 dark:bg-sky-500/25 dark:text-sky-300',
  SCHOOL: 'bg-violet-100 text-violet-700 dark:bg-violet-500/25 dark:text-violet-300',
  GENERAL: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300',
};

export default function EmergencyFundPage() {
  const [funds, setFunds] = useState<EmergencyFund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EmergencyFund | null>(null);
  const [contributeId, setContributeId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    try { setFunds(await emergencyFundService.getAll()); }
    finally { setIsLoading(false); }
  };

  const openCreate = () => { setEditing(null); reset({}); setShowForm(true); };
  const openEdit = (f: EmergencyFund) => {
    setEditing(f);
    reset({ name: f.name, category: f.category, targetAmount: f.targetAmount, currentAmount: f.currentAmount });
    setShowForm(true);
  };

  const onSubmit = async (data: FormData) => {
    const payload: EmergencyFundPayload = { ...data };
    if (editing) await emergencyFundService.update(editing.id, payload);
    else await emergencyFundService.create(payload);
    setShowForm(false); setEditing(null); await load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this emergency fund?')) return;
    await emergencyFundService.remove(id); await load();
  };

  const handleContribute = async (id: string) => {
    const amount = parseFloat(contributeAmount);
    if (!amount || amount <= 0) return;
    await emergencyFundService.contribute(id, amount);
    setContributeId(null); setContributeAmount(''); await load();
  };

  const totalTarget = funds.reduce((s, f) => s + f.targetAmount, 0);
  const totalSaved  = funds.reduce((s, f) => s + f.currentAmount, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Emergency Fund"
        subtitle="Build your safety net before you need it."
        action={!showForm ? (
          <button onClick={openCreate} className="btn-gold hidden sm:inline-flex">
            <Plus size={18} /> New Fund
          </button>
        ) : undefined}
      />

      {funds.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat label="Total Target" value={totalTarget} />
          <Stat label="Total Saved" value={totalSaved} />
          <div className="card flex items-center gap-3 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-300">
              <Shield size={18} />
            </span>
            <div>
              <p className="text-xs text-ink-faint">Funds Ready</p>
              <p className="font-display text-lg font-bold text-ink">
                {funds.filter(f => f.funded).length}/{funds.length}
              </p>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div variants={popIn} initial="hidden" animate="show" exit="exit" className="card mb-6 p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display font-bold text-ink">{editing ? 'Edit Fund' : 'New Emergency Fund'}</p>
              <button onClick={() => setShowForm(false)} className="rounded-xl p-1.5 hover:bg-surface-soft">
                <X size={16} className="text-ink-faint" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <TextField label="Fund Name" placeholder="e.g. Medical Emergency" error={errors.name?.message} {...register('name')} />
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-soft">Category</label>
                <select className="input-field w-full" {...register('category')}>
                  <option value="GENERAL">🛡️ General</option>
                  <option value="MEDICAL">🏥 Medical</option>
                  <option value="TRANSPORTATION">🚌 Transportation</option>
                  <option value="SCHOOL">🎓 School</option>
                </select>
              </div>
              <TextField label="Target Amount (₱)" type="number" placeholder="3000" error={errors.targetAmount?.message} {...register('targetAmount', { valueAsNumber: true })} />
              <TextField label="Current Amount (₱)" type="number" placeholder="0" hint="(optional)" error={errors.currentAmount?.message} {...register('currentAmount', { valueAsNumber: true })} />
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting ? 'Saving…' : editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">{[0,1].map(i => <div key={i} className="skeleton h-44 w-full" />)}</div>
      ) : funds.length === 0 ? (
        <EmptyState icon={Shield} title="No emergency funds yet"
          message="Start small — even ₱500 saved for emergencies gives you peace of mind."
          action={<button onClick={openCreate} className="btn-gold"><Plus size={18} /> Create a Fund</button>} />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {funds.map(fund => (
            <motion.div key={fund.id} variants={fadeUpItem} whileHover={{ y: -4 }} className="card p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{CATEGORY_ICONS[fund.category]}</span>
                  <div>
                    <p className="font-display text-sm font-bold text-ink">{fund.name}</p>
                    <span className={`chip text-[10px] ${CATEGORY_COLORS[fund.category]}`}>{fund.category}</span>
                  </div>
                </div>
                <ProgressRing progress={clamp(fund.progressPercentage, 0, 100)} size={52} stroke={6} colorClass={fund.funded ? 'text-emerald-500' : 'text-accent'}>
                  <p className="text-[9px] font-bold text-ink">{fund.progressPercentage.toFixed(0)}%</p>
                </ProgressRing>
              </div>

              <div className="mb-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-ink-faint">Saved</span><span className="font-semibold text-ink">{formatPeso(fund.currentAmount)}</span></div>
                <div className="flex justify-between"><span className="text-ink-faint">Target</span><span className="font-semibold text-ink">{formatPeso(fund.targetAmount)}</span></div>
                {!fund.funded && <div className="flex justify-between"><span className="text-ink-faint">Still needed</span><span className="font-semibold text-rose-600">{formatPeso(fund.remaining)}</span></div>}
              </div>

              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-soft">
                <div className={`h-full rounded-full transition-all ${fund.funded ? 'bg-emerald-500' : 'bg-accent'}`} style={{ width: `${clamp(fund.progressPercentage, 0, 100)}%` }} />
              </div>

              {contributeId === fund.id ? (
                <div className="flex gap-2">
                  <input type="number" value={contributeAmount} onChange={e => setContributeAmount(e.target.value)} placeholder="Amount ₱" className="input-field flex-1 text-sm" />
                  <button onClick={() => handleContribute(fund.id)} className="btn-primary text-xs px-3">Add</button>
                  <button onClick={() => setContributeId(null)} className="btn-ghost text-xs px-3">Cancel</button>
                </div>
              ) : (
                <div className="flex gap-2 border-t border-surface-border/60 pt-3">
                  <button onClick={() => setContributeId(fund.id)} className="flex-1 rounded-xl py-1.5 text-xs font-semibold text-emerald-600 hover:bg-surface-soft">+ Contribute</button>
                  <button onClick={() => openEdit(fund)} className="flex-1 rounded-xl py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-soft hover:text-nu-blue-600">Edit</button>
                  <button onClick={() => handleDelete(fund.id)} className="flex-1 rounded-xl py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-soft hover:text-rose-500">Delete</button>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
      {!showForm && (
        <button onClick={openCreate} className="fixed bottom-24 left-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-nu-gradient-gold text-nu-blue-900 shadow-glow sm:hidden"><Plus size={22} strokeWidth={2.5} /></button>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div><p className="text-xs text-ink-faint">{label}</p><p className="font-display text-lg font-bold text-ink">{formatPeso(value)}</p></div>
    </div>
  );
}

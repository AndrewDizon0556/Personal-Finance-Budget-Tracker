import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Play, RefreshCw, LogOut } from 'lucide-react';
import challengeService from '../services/challengeService';
import type { Challenge } from '../types/challenge';
import PageHeader from '../components/ui/PageHeader';
import EmptyStateGuide from '../components/help/EmptyStateGuide';
import { staggerContainer, fadeUpItem } from '../lib/motion';
import { clamp } from '../lib/utils';
import { TOOLTIPS } from '../lib/helpContent';

const TYPE_ICONS: Record<string, string> = {
  NO_SPEND: '🚫', SAVINGS_TARGET: '💰', STREAK: '🔥',
};
const TYPE_LABELS: Record<string, string> = {
  NO_SPEND: 'No-Spend', SAVINGS_TARGET: 'Savings Target', STREAK: 'Streak',
};
const TYPE_COLORS: Record<string, string> = {
  NO_SPEND: 'bg-rose-100 text-rose-700 dark:bg-rose-500/25 dark:text-rose-300',
  SAVINGS_TARGET: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300',
  STREAK: 'bg-amber-100 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300',
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    try { setChallenges(await challengeService.getAll()); }
    finally { setIsLoading(false); }
  };

  const handleJoin = async (id: string) => {
    setActionId(id);
    try { const updated = await challengeService.join(id); setChallenges(cs => cs.map(c => c.id === id ? updated : c)); }
    finally { setActionId(null); }
  };

  const handleProgress = async (id: string) => {
    setActionId(id);
    try { const updated = await challengeService.updateProgress(id); setChallenges(cs => cs.map(c => c.id === id ? updated : c)); }
    finally { setActionId(null); }
  };

  const handleLeave = async (id: string) => {
    if (!window.confirm('Leave this challenge? Your progress will be lost.')) return;
    setActionId(id);
    try { await challengeService.leave(id); await load(); }
    finally { setActionId(null); }
  };

  const joined    = challenges.filter(c => c.joined && !c.completed);
  const completed = challenges.filter(c => c.completed);
  const available = challenges.filter(c => !c.joined);
  const totalXpEarned = completed.reduce((s, c) => s + c.rewardXp, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader title="Challenges" help={TOOLTIPS.challenges} subtitle="Complete challenges. Earn XP. Build better habits." />

      {challenges.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <SumCard icon="🏆" label="Completed" value={String(completed.length)} />
          <SumCard icon="⚡" label="In Progress" value={String(joined.length)} />
          <SumCard icon="✨" label="XP Earned" value={`+${totalXpEarned}`} />
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">{[0,1,2,3].map(i => <div key={i} className="skeleton h-36 w-full" />)}</div>
      ) : (
        <div className="space-y-8">
          {joined.length > 0 && (
            <Section title="In Progress 🔥">
              {joined.map(c => <ChallengeCard key={c.id} challenge={c} actionId={actionId} onProgress={handleProgress} onLeave={handleLeave} />)}
            </Section>
          )}
          {completed.length > 0 && (
            <Section title="Completed 🎉">
              {completed.map(c => <ChallengeCard key={c.id} challenge={c} actionId={actionId} onProgress={handleProgress} onLeave={handleLeave} />)}
            </Section>
          )}
          {available.length > 0 && (
            <Section title="Available Challenges">
              {available.map(c => <ChallengeCard key={c.id} challenge={c} actionId={actionId} onJoin={handleJoin} onProgress={handleProgress} onLeave={handleLeave} />)}
            </Section>
          )}
          {challenges.length === 0 && (
            <EmptyStateGuide
              emoji="🏆"
              title="No challenges yet"
              message="Challenges help you build better saving habits and earn XP. Check back soon — new ones are coming!"
              helpHref="/help#challenges"
            />
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 font-display text-sm font-bold text-ink-soft uppercase tracking-wide">{title}</p>
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {children}
      </motion.div>
    </div>
  );
}

function ChallengeCard({ challenge: c, actionId, onJoin, onProgress, onLeave }: {
  challenge: Challenge;
  actionId: string | null;
  onJoin?: (id: string) => void;
  onProgress: (id: string) => void;
  onLeave: (id: string) => void;
}) {
  const busy = actionId === c.id;
  const pct  = clamp(c.progressPercentage, 0, 100);

  return (
    <motion.div variants={fadeUpItem} className={`card p-5 ${c.completed ? 'opacity-80' : ''}`}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">{TYPE_ICONS[c.type]}</span>
          <p className="truncate font-display text-sm font-bold text-ink">{c.title}</p>
        </div>
        {c.completed && <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />}
      </div>

      <p className="mb-3 text-xs text-ink-soft line-clamp-2">{c.description}</p>

      <div className="mb-3 flex flex-wrap gap-2 text-[10px]">
        <span className={`chip ${TYPE_COLORS[c.type]}`}>{TYPE_LABELS[c.type]}</span>
        <span className="chip bg-surface-soft text-ink-faint">🎯 {c.targetDays} days</span>
        <span className="chip bg-amber-50 text-amber-700 dark:bg-amber-500/10">⚡ +{c.rewardXp} XP</span>
      </div>

      {c.joined && (
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-xs text-ink-faint">
            <span>{c.currentProgress}/{c.targetDays} days</span>
            <span>{pct.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-soft">
            <div className={`h-full rounded-full transition-all ${c.completed ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <div className="flex gap-2 border-t border-surface-border/60 pt-3">
        {!c.joined && onJoin && (
          <button onClick={() => onJoin(c.id)} disabled={busy} className="btn-primary flex-1 text-xs py-1.5">
            <Play size={12} /> {busy ? 'Joining…' : 'Join'}
          </button>
        )}
        {c.joined && !c.completed && (
          <>
            <button onClick={() => onProgress(c.id)} disabled={busy} className="flex flex-1 items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-semibold text-nu-blue-600 hover:bg-surface-soft">
              <RefreshCw size={12} className={busy ? 'animate-spin' : ''} /> Refresh
            </button>
            <button onClick={() => onLeave(c.id)} disabled={busy} className="flex flex-1 items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-soft hover:text-rose-500">
              <LogOut size={12} /> Leave
            </button>
          </>
        )}
        {c.completed && (
          <p className="flex-1 py-1.5 text-center text-xs font-semibold text-emerald-600">
            🎉 Challenge Complete! +{c.rewardXp} XP
          </p>
        )}
      </div>
    </motion.div>
  );
}

function SumCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="card p-3 text-center">
      <p className="text-xl">{icon}</p>
      <p className="font-display text-base font-bold text-ink">{value}</p>
      <p className="text-[10px] text-ink-faint">{label}</p>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Send, X, Loader2, Sparkles, Check } from 'lucide-react';
import aiService, { type AiCoachType, type ProposedAction } from '../../services/aiService';
import { useUiStore } from '../../store/uiStore';
import CoachAvatar, { type CoachVariant } from './CoachAvatar';

type Msg = {
  role: 'user' | 'ai';
  text: string;
  action?: ProposedAction;
  actionState?: 'pending' | 'done' | 'cancelled';
};

const QUICK: { label: string; type: AiCoachType; input: string }[] = [
  { label: "How's my budget?", type: 'budget_advice', input: 'How am I doing with my budget this month?' },
  { label: 'Can I afford ₱1,000?', type: 'tutor_question', input: 'Can I afford to spend ₱1,000 right now without hurting my budget or savings goals?' },
  { label: 'Log ₱150 food', type: 'tutor_question', input: 'Add a ₱150 food expense for today.' },
];

const AVATAR_KEY = 'ipon-coach-avatar';

function loadVariant(): CoachVariant {
  return localStorage.getItem(AVATAR_KEY) === 'man' ? 'man' : 'woman';
}

/**
 * Ipon Coach — the AI assistant, surfaced as a second floating action button
 * (stacked above the bulldog quick-action FAB). Its icon is a customizable
 * man/woman avatar; tapping it opens a chat panel powered by the AI backend.
 */
export default function AiCoachFab() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<CoachVariant>(loadVariant);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Lets the rest of the app refresh (dashboard, lists) after the AI saves something.
  const bumpMutation = useUiStore((s) => s.bumpMutation);

  // Persist the avatar choice.
  useEffect(() => {
    localStorage.setItem(AVATAR_KEY, variant);
  }, [variant]);

  // Check whether the AI Coach is configured (once).
  useEffect(() => {
    aiService.status().then((s) => setEnabled(s.enabled)).catch(() => setEnabled(false));
  }, []);

  // Auto-scroll to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (type: AiCoachType, text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setMessages((m) => [...m, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);
    try {
      const res = await aiService.coach(type, trimmed);
      setMessages((m) => [
        ...m,
        {
          role: 'ai',
          text: res.reply,
          action: res.action ?? undefined,
          actionState: res.action ? 'pending' : undefined,
        },
      ]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Sorry, I could not respond right now. Please try again.';
      setMessages((m) => [...m, { role: 'ai', text: msg }]);
    } finally {
      setLoading(false);
    }
  };

  // User tapped "Confirm" on a proposed action — execute it, then refresh the app.
  const confirmAction = async (index: number) => {
    const action = messages[index]?.action;
    if (!action || loading) return;
    setLoading(true);
    try {
      const res = await aiService.executeAction(action);
      setMessages((m) =>
        m.map((msg, i) => (i === index ? { ...msg, actionState: 'done' as const } : msg)).concat({ role: 'ai', text: res.message }),
      );
      bumpMutation();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "I couldn't complete that action. Please try again.";
      setMessages((m) =>
        m.map((mm, i) => (i === index ? { ...mm, actionState: 'cancelled' as const } : mm)).concat({ role: 'ai', text: msg }),
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelAction = (index: number) => {
    setMessages((m) =>
      m
        .map((msg, i) => (i === index ? { ...msg, actionState: 'cancelled' as const } : msg))
        .concat({ role: 'ai', text: "Okay, I won't make that change." }),
    );
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Tap-away scrim */}
            <motion.button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[59] cursor-default bg-nu-blue-950/25 backdrop-blur-[1px] print:hidden"
            />

            {/* Chat panel */}
            <motion.div
              role="dialog"
              aria-label="Ipon Coach"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 26 }}
              className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 z-[60] flex h-[28rem] max-h-[68vh] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-surface-border/70 bg-surface shadow-float lg:bottom-6 lg:right-28 print:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between bg-nu-gradient px-4 py-3 text-white">
                <div className="flex items-center gap-2.5">
                  <CoachAvatar variant={variant} size={36} className="ring-2 ring-white/30" />
                  <div className="leading-tight">
                    <p className="text-sm font-bold">Ipon Coach</p>
                    <p className="text-[11px] text-white/70">Your AI money buddy</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {/* Avatar switcher (customization) */}
                  {(['woman', 'man'] as CoachVariant[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => setVariant(v)}
                      aria-label={`Use ${v} avatar`}
                      aria-pressed={variant === v}
                      className={`grid place-items-center rounded-full p-0.5 transition ${
                        variant === v ? 'ring-2 ring-nu-gold-300' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <CoachAvatar variant={v} size={24} />
                    </button>
                  ))}
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="ml-1 rounded-lg p-1 hover:bg-white/15"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {enabled === false ? (
                  <div className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                    The AI Coach isn't set up yet. Add a free Gemini API key on the server
                    (<code>AI_API_KEY</code>) to switch it on.
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-ink-soft">
                    Hi! 👋 I can see your balance, spending, budgets, and goals — and I can
                    <span className="font-medium text-ink"> record income, expenses, and goals</span> for you
                    (you confirm first). Try <span className="font-medium text-ink">"Can I afford ₱2,000?"</span> or
                    <span className="font-medium text-ink"> "Add my ₱5,000 allowance."</span>
                  </p>
                ) : (
                  messages.map((m, i) =>
                    m.role === 'user' ? (
                      <div key={i} className="flex justify-end">
                        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-nu-gradient px-3.5 py-2 text-sm text-white shadow-sm">
                          {m.text}
                        </div>
                      </div>
                    ) : (
                      <div key={i} className="flex justify-start gap-2">
                        <CoachAvatar variant={variant} size={28} className="mt-0.5 shadow-sm" />
                        <div className="flex max-w-[82%] flex-col gap-2">
                          <div className="whitespace-pre-wrap rounded-2xl rounded-bl-md bg-surface px-3.5 py-2 text-sm text-ink shadow-sm ring-1 ring-surface-border/60">
                            {m.text}
                          </div>

                          {/* Confirmation card for a proposed action */}
                          {m.action && m.actionState === 'pending' && (
                            <div className="rounded-2xl border border-nu-blue-200 bg-nu-blue-50/70 p-2.5 dark:border-nu-blue-700/60 dark:bg-nu-blue-500/10">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => confirmAction(i)}
                                  disabled={loading}
                                  className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-nu-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-nu-blue-700 disabled:opacity-50"
                                >
                                  <Check size={14} /> Confirm
                                </button>
                                <button
                                  onClick={() => cancelAction(i)}
                                  disabled={loading}
                                  className="flex-1 rounded-xl bg-surface-soft px-3 py-1.5 text-xs font-semibold text-ink-soft ring-1 ring-surface-border/60 transition hover:text-ink disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                          {m.actionState === 'done' && (
                            <span className="text-[11px] font-medium text-emerald-600">✓ Saved to your account</span>
                          )}
                          {m.action && m.actionState === 'cancelled' && (
                            <span className="text-[11px] text-ink-faint">Cancelled — nothing was changed</span>
                          )}
                        </div>
                      </div>
                    ),
                  )
                )}
                {loading && (
                  <div className="flex items-center gap-2">
                    <CoachAvatar variant={variant} size={28} />
                    <div className="flex items-center gap-2 rounded-2xl bg-surface-soft px-3.5 py-2 text-sm text-ink-soft">
                      <Loader2 size={14} className="animate-spin" /> Thinking…
                    </div>
                  </div>
                )}
              </div>

              {/* Quick chips + input */}
              {enabled !== false && (
                <div className="border-t border-surface-border/60 p-3">
                  {messages.length === 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {QUICK.map((q) => (
                        <button
                          key={q.label}
                          onClick={() => send(q.type, q.input)}
                          disabled={loading}
                          className="rounded-full bg-surface-soft px-3 py-1.5 text-xs font-medium text-ink-soft ring-1 ring-surface-border/60 transition hover:bg-surface hover:text-ink hover:shadow-sm disabled:opacity-50"
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      send('tutor_question', input);
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      maxLength={1000}
                      placeholder="Ask Ipon Coach…"
                      className="flex-1 rounded-xl border border-surface-border bg-surface-soft px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-nu-blue-400 focus:bg-surface focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      aria-label="Send"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-nu-blue-600 text-white transition hover:bg-nu-blue-700 disabled:opacity-50"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* The AI Coach FAB — avatar icon, stacked above the bulldog FAB */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close Ipon Coach' : 'Open Ipon Coach (AI money buddy)'}
        whileHover={reduceMotion ? undefined : { y: -3, scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-[calc(9.75rem+env(safe-area-inset-bottom))] right-[1.25rem] z-50 grid h-14 w-14 place-items-center rounded-full bg-surface shadow-float outline-none ring-nu-gold-300 focus-visible:ring-4 lg:bottom-[6.75rem] lg:right-[1.85rem] print:hidden"
      >
        <CoachAvatar variant={variant} size={56} className="ring-2 ring-white/70 dark:ring-white/15" />
        {/* AI sparkle badge */}
        <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-nu-gradient-gold text-nu-blue-900 shadow-glow ring-2 ring-surface">
          <Sparkles size={11} strokeWidth={2.5} />
        </span>
      </motion.button>
    </>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, Info, Lightbulb } from 'lucide-react';
import financialLiteracyService from '../services/financialLiteracyService';
import type { Lesson, ContentBlock } from '../types/lesson';
import CompoundCalculator from '../components/literacy/CompoundCalculator';
import { fadeUpItem, staggerContainer } from '../lib/motion';

// ─── Content block renderers ─────────────────────────────────────────────────
function IntroBlock({ text }: { text: string }) {
  return <p className="text-base leading-relaxed text-ink-soft">{text}</p>;
}

function TipsBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl bg-surface-soft/60 p-4">
      <p className="mb-3 text-sm font-semibold text-ink">{title}</p>
      <ol className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-ink-soft">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-nu-blue-100 text-[10px] font-bold text-nu-blue-700 dark:bg-nu-blue-500/15">
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ExampleBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-surface-border bg-surface-soft/30 p-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">{title}</p>
      <p className="text-sm text-ink-soft">{text}</p>
    </div>
  );
}

function CalloutBlock({ tone, text }: { tone: string; text: string }) {
  const styles = {
    warning: { bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-300', text: 'text-amber-800 dark:text-amber-300', Icon: AlertTriangle },
    positive: { bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300', text: 'text-emerald-800 dark:text-emerald-300', Icon: Lightbulb },
    info:    { bg: 'bg-sky-50 dark:bg-sky-500/10 border-sky-300', text: 'text-sky-800 dark:text-sky-300', Icon: Info },
  }[tone] ?? { bg: 'bg-surface-soft border-surface-border', text: 'text-ink-soft', Icon: Info };

  const { bg, text: textColor, Icon } = styles;
  return (
    <div className={`flex gap-3 rounded-2xl border p-4 ${bg}`}>
      <Icon size={16} className={`mt-0.5 shrink-0 ${textColor}`} />
      <p className={`text-sm ${textColor}`}>{text}</p>
    </div>
  );
}

// ─── Quiz component ───────────────────────────────────────────────────────────
function QuizBlock({
  question,
  options,
  correctIndex,
  explanation,
  onAnswer,
}: {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  const choose = (i: number) => {
    if (answered) return;
    setSelected(i);
    onAnswer(i === correctIndex);
  };

  return (
    <div className="rounded-2xl border border-nu-blue-200 bg-nu-blue-50 p-4 dark:border-nu-blue-700/30 dark:bg-nu-blue-500/5">
      <p className="mb-3 text-sm font-semibold text-ink">Quiz: {question}</p>
      <div className="space-y-2">
        {options.map((opt, i) => {
          let cls = 'border border-surface-border bg-white dark:bg-surface-soft/40 text-ink-soft hover:border-nu-blue-400';
          if (answered) {
            if (i === correctIndex) cls = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700';
            else if (i === selected) cls = 'border-rose-400 bg-rose-50 dark:bg-rose-500/10 text-rose-700';
            else cls = 'border-surface-border bg-white/50 dark:bg-surface-soft/20 text-ink-faint';
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <p className="mt-3 text-xs text-ink-soft">
          <span className={selected === correctIndex ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>
            {selected === correctIndex ? '✅ Correct! ' : '❌ Not quite. '}
          </span>
          {explanation}
        </p>
      )}
    </div>
  );
}

// ─── Full lesson page ─────────────────────────────────────────────────────────
export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!id) return;
    financialLiteracyService.getLesson(id)
      .then((l) => { setLesson(l); setCompleted(l.completed); })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <div className="mx-auto max-w-2xl px-4 py-8"><div className="skeleton h-96 w-full rounded-3xl" /></div>;
  if (!lesson) return null;

  let blocks: ContentBlock[] = [];
  try { blocks = JSON.parse(lesson.content); } catch { /* malformed content — render nothing */ }

  const quizBlock = blocks.find((b): b is Extract<ContentBlock, { type: 'quiz' }> => b.type === 'quiz');

  const handleComplete = async () => {
    if (!id || completing) return;
    setCompleting(true);
    try {
      const score = quizBlock
        ? quizScore !== null ? (quizScore ? 100 : 0) : undefined
        : undefined;
      const updated = await financialLiteracyService.completeLesson(id, score);
      setCompleted(true);
      setLesson(updated);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <button
        onClick={() => navigate('/financial-literacy')}
        className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to Lessons
      </button>

      {/* Header */}
      <motion.div variants={fadeUpItem} initial="hidden" animate="show" className="card mb-5 p-6">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{lesson.icon}</span>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold text-ink">{lesson.title}</h1>
            <p className="mt-1 text-sm text-ink-soft">{lesson.description}</p>
            <p className="mt-1.5 flex items-center gap-1 text-xs text-ink-faint">
              <Clock size={11} /> {lesson.estimatedMinutes} min read
              {completed && <span className="ml-2 flex items-center gap-1 font-semibold text-emerald-600"><CheckCircle2 size={12} /> Completed</span>}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Content blocks */}
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
        {blocks.map((block, i) => (
          <motion.div key={i} variants={fadeUpItem}>
            {block.type === 'intro'      && <IntroBlock {...block} />}
            {block.type === 'tips'       && <TipsBlock {...block} />}
            {block.type === 'example'    && <ExampleBlock {...block} />}
            {block.type === 'callout'    && <CalloutBlock {...block} />}
            {block.type === 'calculator' && <CompoundCalculator />}
            {block.type === 'quiz'       && (
              <QuizBlock
                {...block}
                onAnswer={(correct) => setQuizScore(correct ? 1 : 0)}
              />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Complete button */}
      {!completed && (
        <div className="mt-8">
          <button
            onClick={handleComplete}
            disabled={completing || (!!quizBlock && quizScore === null)}
            className="btn-primary w-full"
          >
            {completing ? 'Marking complete…' :
             quizBlock && quizScore === null ? 'Answer the quiz to complete' :
             'Mark as Complete ✅'}
          </button>
          {quizBlock && quizScore === null && (
            <p className="mt-2 text-center text-xs text-ink-faint">Answer the quiz question above first</p>
          )}
        </div>
      )}

      {completed && (
        <div className="mt-8 rounded-2xl bg-emerald-50 p-4 text-center dark:bg-emerald-500/10">
          <p className="font-semibold text-emerald-700 dark:text-emerald-400">
            🎉 Lesson complete! {lesson.score != null && `You scored ${lesson.score}%.`}
          </p>
          <button
            onClick={() => navigate('/financial-literacy')}
            className="mt-3 text-sm font-semibold text-nu-blue-600 hover:underline"
          >
            Back to all lessons →
          </button>
        </div>
      )}
    </div>
  );
}

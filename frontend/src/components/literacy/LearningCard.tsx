import { motion } from 'framer-motion';
import { CheckCircle2, Clock, ChevronRight, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Lesson } from '../../types/lesson';
import { fadeUpItem } from '../../lib/motion';

interface Props {
  lesson: Lesson;
}

const CATEGORY_COLORS: Record<string, string> = {
  ALLOWANCE: 'bg-sky-100 text-sky-700 dark:bg-sky-500/25 dark:text-sky-300',
  SAVINGS:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300',
  PLANNING:  'bg-violet-100 text-violet-700 dark:bg-violet-500/25 dark:text-violet-300',
  CREDIT:    'bg-rose-100 text-rose-700 dark:bg-rose-500/25 dark:text-rose-300',
  BUDGETING: 'bg-amber-100 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300',
  DEBT:      'bg-orange-100 text-orange-700 dark:bg-orange-500/25 dark:text-orange-300',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER:     'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10',
  INTERMEDIATE: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10',
};

export default function LearningCard({ lesson }: Props) {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={fadeUpItem}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/financial-literacy/${lesson.id}`)}
      className="card relative cursor-pointer overflow-hidden p-5 transition-shadow hover:shadow-md"
    >
      {lesson.completed && (
        <div className="absolute right-3 top-3">
          <CheckCircle2 size={18} className="text-emerald-500" />
        </div>
      )}

      <div className="mb-3 flex items-center gap-3">
        <span className="text-3xl">{lesson.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold text-ink pr-5">{lesson.title}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            <span className={`chip text-[10px] ${CATEGORY_COLORS[lesson.category] ?? 'bg-surface-soft text-ink-faint'}`}>
              {lesson.category.charAt(0) + lesson.category.slice(1).toLowerCase()}
            </span>
            <span className={`chip text-[10px] ${DIFFICULTY_COLORS[lesson.difficulty]}`}>
              {lesson.difficulty.charAt(0) + lesson.difficulty.slice(1).toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      <p className="mb-3 text-xs text-ink-soft line-clamp-2">{lesson.description}</p>

      <div className="flex items-center justify-between text-xs text-ink-faint">
        <span className="flex items-center gap-1">
          <Clock size={11} /> {lesson.estimatedMinutes} min
          {lesson.hasCalculator && (
            <span className="ml-1 flex items-center gap-0.5 text-nu-blue-600">
              <Calculator size={11} /> Calculator
            </span>
          )}
        </span>
        <span className="flex items-center gap-0.5 font-semibold text-nu-blue-600">
          {lesson.completed ? `Score: ${lesson.score ?? '—'}%` : 'Start'} <ChevronRight size={13} />
        </span>
      </div>

      {/* Completed progress strip */}
      {lesson.completed && (
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-emerald-400" />
      )}
    </motion.div>
  );
}

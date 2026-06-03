import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import financialLiteracyService from '../services/financialLiteracyService';
import type { Lesson, LessonCategory, UserProgress } from '../types/lesson';
import LearningCard from '../components/literacy/LearningCard';
import ProgressTracker from '../components/literacy/ProgressTracker';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { staggerContainer } from '../lib/motion';

const CATEGORIES: { value: LessonCategory | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'ALLOWANCE', label: '💰 Allowance' },
  { value: 'BUDGETING', label: '📊 Budgeting' },
  { value: 'SAVINGS', label: '🐷 Savings' },
  { value: 'PLANNING', label: '🎯 Planning' },
  { value: 'CREDIT', label: '💳 Credit' },
  { value: 'DEBT', label: '⚖️ Debt' },
];

export default function FinancialLiteracyPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<LessonCategory | 'ALL'>('ALL');

  useEffect(() => {
    Promise.all([
      financialLiteracyService.getLessons(),
      financialLiteracyService.getProgress(),
    ])
      .then(([l, p]) => { setLessons(l); setProgress(p); })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? lessons : lessons.filter((l) => l.category === filter);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Financial Literacy"
        subtitle="Learn money skills built for student life."
      />

      {/* Progress summary */}
      {progress && !isLoading && (
        <div className="mb-6">
          <ProgressTracker progress={progress} />
        </div>
      )}

      {/* Category filter chips */}
      <div className="mb-5 flex flex-wrap gap-2">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-2xl px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === value
                ? 'bg-nu-blue-700 text-white'
                : 'bg-surface-soft text-ink-soft hover:bg-surface-border'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-40 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No lessons found"
          message="Try a different category filter."
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {filtered.map((lesson) => (
            <LearningCard key={lesson.id} lesson={lesson} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

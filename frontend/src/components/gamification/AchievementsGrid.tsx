import { motion } from 'framer-motion';
import {
  PiggyBank,
  Flame,
  GraduationCap,
  ShieldCheck,
  Trophy,
  Star,
  Target,
  Receipt,
  Lock,
  type LucideIcon,
} from 'lucide-react';
import type { Achievement } from '../../types/gamification';
import { staggerContainer, fadeUpItem } from '../../lib/motion';

const ICONS: Record<string, LucideIcon> = {
  piggy: PiggyBank,
  flame: Flame,
  cap: GraduationCap,
  shield: ShieldCheck,
  trophy: Trophy,
  star: Star,
  target: Target,
  receipt: Receipt,
};

export default function AchievementsGrid({ achievements }: { achievements: Achievement[] }) {
  if (achievements.length === 0) {
    return <p className="text-sm text-ink-faint">Achievements will appear here as you use the app.</p>;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      {achievements.map((a) => {
        const Icon = a.unlocked ? ICONS[a.icon] ?? Trophy : Lock;
        return (
          <motion.div
            key={a.code}
            variants={fadeUpItem}
            className={`flex flex-col items-center gap-2 rounded-3xl border p-4 text-center ${
              a.unlocked
                ? 'border-nu-gold-200 bg-nu-gold-50/60 dark:border-nu-gold-500/30 dark:bg-nu-gold-500/10'
                : 'border-surface-border bg-surface-soft/40 opacity-70'
            }`}
          >
            <div
              className={`grid h-12 w-12 place-items-center rounded-2xl ${
                a.unlocked ? 'bg-nu-gradient-gold text-nu-blue-900' : 'bg-surface-soft text-ink-faint'
              }`}
            >
              <Icon size={22} />
            </div>
            <p className="text-xs font-bold text-ink">{a.title}</p>
            <p className="text-[11px] leading-tight text-ink-faint">{a.description}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

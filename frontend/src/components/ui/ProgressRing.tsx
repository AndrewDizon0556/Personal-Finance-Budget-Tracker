import { motion } from 'framer-motion';
import { clamp } from '../../lib/utils';

interface ProgressRingProps {
  /** 0–100 */
  progress: number;
  size?: number;
  stroke?: number;
  /** Tailwind text-color class for the arc, or a raw color. Defaults to accent. */
  colorClass?: string;
  trackClass?: string;
  children?: React.ReactNode;
}

/** Animated circular progress ring. */
export default function ProgressRing({
  progress,
  size = 120,
  stroke = 10,
  colorClass = 'text-accent',
  trackClass = 'text-surface-soft',
  children,
}: ProgressRingProps) {
  const pct = clamp(progress, 0, 100);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          className={trackClass}
          stroke="currentColor"
          fill="none"
          strokeWidth={stroke}
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <motion.circle
          className={colorClass}
          stroke="currentColor"
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  );
}

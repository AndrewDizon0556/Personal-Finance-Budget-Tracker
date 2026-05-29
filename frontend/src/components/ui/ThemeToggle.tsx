import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

/** Compact dark/light mode toggle. */
export default function ThemeToggle() {
  const { mode, toggleMode } = useThemeStore();
  const isDark = mode === 'dark';

  return (
    <button
      onClick={toggleMode}
      aria-label="Toggle theme"
      className="grid h-9 w-9 place-items-center rounded-xl text-ink-soft transition-colors hover:bg-surface-soft hover:text-ink"
    >
      <motion.span key={mode} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </motion.span>
    </button>
  );
}

import {
  Utensils,
  Bus,
  GraduationCap,
  BookOpen,
  FolderKanban,
  Wifi,
  Gamepad2,
  Siren,
  Wallet,
  TrendingUp,
  Home,
  type LucideIcon,
} from 'lucide-react';

interface CategoryStyle {
  icon: LucideIcon;
  /** Tailwind classes for icon foreground + soft background. */
  fg: string;
  bg: string;
  /** Hex for charts. */
  hex: string;
}

const STYLES: Record<string, CategoryStyle> = {
  food: { icon: Utensils, fg: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-500/15', hex: '#f97316' },
  transport: { icon: Bus, fg: 'text-sky-600', bg: 'bg-sky-100 dark:bg-sky-500/15', hex: '#0ea5e9' },
  rent: { icon: Home, fg: 'text-amber-600 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-500/20', hex: '#d97706' },
  tuition: { icon: GraduationCap, fg: 'text-nu-blue-700', bg: 'bg-nu-blue-100 dark:bg-nu-blue-500/20', hex: '#35408e' },
  supplies: { icon: BookOpen, fg: 'text-violet-600', bg: 'bg-violet-100 dark:bg-violet-500/15', hex: '#8b5cf6' },
  project: { icon: FolderKanban, fg: 'text-teal-600', bg: 'bg-teal-100 dark:bg-teal-500/15', hex: '#14b8a6' },
  load: { icon: Wifi, fg: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-500/15', hex: '#6366f1' },
  leisure: { icon: Gamepad2, fg: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-500/15', hex: '#ec4899' },
  emergency: { icon: Siren, fg: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-500/15', hex: '#f43f5e' },
  income: { icon: TrendingUp, fg: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/15', hex: '#10b981' },
  default: { icon: Wallet, fg: 'text-nu-blue-600', bg: 'bg-nu-blue-100 dark:bg-nu-blue-500/15', hex: '#4d5db4' },
};

/** Resolve a category style from its display name via keyword matching. */
export function categoryStyle(name?: string | null): CategoryStyle {
  if (!name) return STYLES.default;
  const n = name.toLowerCase();
  if (n.includes('food') || n.includes('baon') || n.includes('meal')) return STYLES.food;
  if (n.includes('transp') || n.includes('fare') || n.includes('jeep')) return STYLES.transport;
  if (n.includes('rent') || n.includes('house') || n.includes('boarding') || n.includes('dorm')) return STYLES.rent;
  if (n.includes('tuition') || n.includes('school fee')) return STYLES.tuition;
  if (n.includes('suppl') || n.includes('book')) return STYLES.supplies;
  if (n.includes('project')) return STYLES.project;
  if (n.includes('load') || n.includes('data') || n.includes('wifi') || n.includes('internet')) return STYLES.load;
  if (n.includes('leisure') || n.includes('fun') || n.includes('game') || n.includes('ent')) return STYLES.leisure;
  if (n.includes('emerg')) return STYLES.emergency;
  if (n.includes('income') || n.includes('allowance') || n.includes('salary')) return STYLES.income;
  return STYLES.default;
}

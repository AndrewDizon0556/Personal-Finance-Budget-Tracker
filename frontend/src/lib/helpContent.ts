import {
  LayoutDashboard,
  Receipt,
  Target,
  GraduationCap,
  Trophy,
  Wallet,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

/**
 * Single source of truth for every guidance string in the app — contextual
 * tooltips, the first-time tour, step-by-step feature guides, and the Help
 * Center. Keeping copy here (not scattered across components) makes the voice
 * consistent and easy to tweak without hunting through JSX.
 */

/** Stable identifiers persisted in `user_help_preferences.guide_name`. */
export const GUIDE = {
  WELCOME_TOUR: 'welcome-tour',
  SEMESTER_GUIDE: 'semester-budget-guide',
} as const;

// ─── Feature 1: contextual help tooltips ──────────────────────────────────────
export const TOOLTIPS = {
  dashboard:
    'This shows your current allowance, spending progress, and how much you can safely spend.',
  transactions:
    'Add your daily expenses here so Ipon Challenge can calculate your spending habits.',
  goals: 'Create a goal and track your progress until you reach your target.',
  semesterBudget:
    'This helps divide your total semester money into a realistic weekly budget.',
  challenges: 'Complete challenges to build better saving habits and earn XP.',
  safeToSpend:
    'Your remaining balance divided by the days left until your next allowance — what you can spend per day without running out.',
  runway:
    'An estimate of how many days your money will last based on your recent spending pace.',
} as const;

// ─── Feature 2: first-time guided tour ────────────────────────────────────────
export interface TourStep {
  icon: LucideIcon;
  title: string;
  body: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    icon: GraduationCap,
    title: 'Welcome to Ipon Challenge',
    body: "Let's set up your student budget. This 30-second tour shows you where everything lives.",
  },
  {
    icon: Wallet,
    title: 'Allowance Setup',
    body: 'Add your allowance schedule so we can calculate your safe-to-spend amount automatically.',
  },
  {
    icon: Receipt,
    title: 'Expense Tracking',
    body: 'Record your daily spending so you can understand where your money actually goes.',
  },
  {
    icon: Target,
    title: 'Savings Goals',
    body: 'Set goals for the things you want — a laptop, tuition, a barkada trip — and watch progress grow.',
  },
  {
    icon: LayoutDashboard,
    title: 'Your Dashboard',
    body: 'Check your financial progress anytime. You can replay this tour from Settings → Help.',
  },
];

// ─── Feature 4: step-by-step feature guides ───────────────────────────────────
export interface GuideStep {
  title: string;
  description: string;
}

export const SEMESTER_BUDGET_STEPS: GuideStep[] = [
  { title: 'Enter your semester money', description: 'Total allowance or budget for the whole term.' },
  { title: 'Choose semester dates', description: 'Pick the start and end so we can split it by week.' },
  { title: 'Review weekly breakdown', description: 'See a realistic amount to spend each week.' },
  { title: 'Track spending', description: 'Log expenses and watch each week stay on target.' },
];

// ─── Feature 5: Help Center content ───────────────────────────────────────────
export interface HelpFaq {
  q: string;
  a: string;
}

export interface HelpSection {
  id: string;
  icon: LucideIcon;
  title: string;
  summary: string;
  steps: string[];
  faqs: HelpFaq[];
}

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'getting-started',
    icon: GraduationCap,
    title: 'Getting Started',
    summary: 'Ipon Challenge helps you track your allowance, control spending, and save through the semester.',
    steps: [
      'Set your allowance amount and how often you receive it.',
      'Log a few expenses so the app learns your habits.',
      'Create one savings goal to stay motivated.',
      'Check your dashboard each day to see your safe-to-spend.',
    ],
    faqs: [
      { q: 'Where do I start?', a: 'Begin on the Dashboard, then add your first expense from the gold "Add" button. Everything builds from there.' },
      { q: 'Can I use it offline?', a: 'Yes. Your data is saved on your device and syncs automatically the next time you are online.' },
    ],
  },
  {
    id: 'allowance',
    icon: Wallet,
    title: 'Allowance Tracking',
    summary: 'Your allowance is the money you receive on a schedule. We use it to compute how much you can safely spend.',
    steps: [
      'Open Profile or Settings and set your allowance amount.',
      'Choose your schedule: daily, weekly, bi-weekly, or monthly.',
      'The dashboard updates your safe-to-spend automatically.',
    ],
    faqs: [
      { q: 'How is "safe to spend" calculated?', a: 'We take your remaining balance and divide it by the number of days until your next allowance.' },
      { q: 'My allowance changed — what do I do?', a: 'Just update the amount in Profile. Future calculations use the new value right away.' },
    ],
  },
  {
    id: 'expenses',
    icon: Receipt,
    title: 'Expenses',
    summary: 'Recording expenses is how the app understands your spending habits and keeps your balance accurate.',
    steps: [
      'Tap "Add Transaction" anywhere in the app.',
      'Enter the amount, pick a category, and add an optional note.',
      'Choose whether it is an expense or income.',
      'Review your history any time on the Transactions page.',
    ],
    faqs: [
      { q: 'What is the difference between expense and income?', a: 'Expenses lower your balance (e.g. food, load). Income raises it (e.g. allowance, a gift).' },
      { q: 'Can I edit a mistake?', a: 'Yes — open the transaction from the Transactions page to edit or delete it.' },
    ],
  },
  {
    id: 'savings',
    icon: Target,
    title: 'Savings Goals',
    summary: 'Goals turn big dreams into trackable milestones so saving feels achievable.',
    steps: [
      'Go to Goals and tap "New Goal".',
      'Name your goal and set a target amount.',
      'Add to it over time and watch the progress ring fill.',
    ],
    faqs: [
      { q: 'How much should I save?', a: 'Start small. Even setting aside a little each week adds up — the progress ring keeps you motivated.' },
      { q: 'What happens when I reach a goal?', a: 'It is marked complete and celebrated. You can then set your next one.' },
    ],
  },
  {
    id: 'semester-budget',
    icon: GraduationCap,
    title: 'Semester Budget',
    summary: 'Divide your total semester money into a realistic weekly budget so it lasts the whole term.',
    steps: [
      'Enter your total semester money.',
      'Choose your semester start and end dates.',
      'Review the suggested weekly breakdown.',
      'Track spending and stay on target each week.',
    ],
    faqs: [
      { q: 'How is the weekly budget calculated?', a: 'We split your total budget evenly across the number of weeks between your start and end dates.' },
      { q: 'What if I overspend one week?', a: 'The week is flagged so you can adjust. Try to spend a little less the following week to balance out.' },
    ],
  },
  {
    id: 'challenges',
    icon: Trophy,
    title: 'Challenges',
    summary: 'Challenges are fun, time-boxed goals that build better saving habits and earn you XP.',
    steps: [
      'Browse available challenges and tap "Join".',
      'Make progress by saving or avoiding spending.',
      'Refresh to update your progress until you complete it.',
    ],
    faqs: [
      { q: 'What is XP for?', a: 'XP raises your level — a playful way to measure how consistent your saving habits are becoming.' },
      { q: 'Can I leave a challenge?', a: 'Yes, but you will lose your current progress on it.' },
    ],
  },
  {
    id: 'reports',
    icon: BarChart3,
    title: 'Reports & Analytics',
    summary: 'See where your money goes with charts, category breakdowns, and a downloadable report.',
    steps: [
      'Open Analytics to view spending by category and week.',
      'Open Reports to generate a summary you can download as a PDF.',
    ],
    faqs: [
      { q: 'Why is a category empty?', a: 'You have not logged any expenses in it yet. Add a few and the charts will fill in.' },
    ],
  },
];

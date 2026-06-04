import type { ReactNode } from 'react';
import HelpTooltip from '../help/HelpTooltip';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  /** Optional one-line explanation shown as a (?) tooltip beside the title. */
  help?: string;
}

/** Consistent page header used across authed pages. */
export default function PageHeader({ title, subtitle, action, help }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">{title}</h1>
          {help && <HelpTooltip content={help} label={`What is ${title}?`} />}
        </div>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

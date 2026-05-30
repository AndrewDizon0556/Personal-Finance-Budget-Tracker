import { cn } from '../../lib/utils';

interface LogoProps {
  className?: string;
  /** Render only the mark without the wordmark. */
  markOnly?: boolean;
  /** Use light text (for dark/blue backgrounds). */
  light?: boolean;
}

/** Ipon Challenge brand lockup — coin + graduation cap + peso mark with wordmark. */
export default function Logo({ className, markOnly = false, light = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img
        src="/logo-icon.svg"
        alt="Ipon Challenge"
        className="h-9 w-9 rounded-xl shadow-glow-blue"
        width={36}
        height={36}
      />
      {!markOnly && (
        <div className="leading-none">
          <span
            className={cn(
              'font-display text-base font-extrabold tracking-tight',
              light ? 'text-white' : 'text-ink',
            )}
          >
            Ipon
            <span className="text-gradient-gold">Challenge</span>
          </span>
        </div>
      )}
    </div>
  );
}

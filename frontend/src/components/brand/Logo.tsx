import { cn } from '../../lib/utils';

interface LogoProps {
  className?: string;
  /** Render only the mark without the wordmark. */
  markOnly?: boolean;
  /** Use light text (for dark/blue backgrounds). */
  light?: boolean;
}

/** Ipon Challenge brand lockup — NU-inspired shield mark + wordmark. */
export default function Logo({ className, markOnly = false, light = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-nu-gradient shadow-glow-blue">
        <span className="font-display text-base font-extrabold text-nu-gold-400">i</span>
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-nu-gradient-gold ring-2 ring-surface" />
      </div>
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

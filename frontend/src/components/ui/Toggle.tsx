import type { ButtonHTMLAttributes } from 'react';

type ToggleSize = 'sm' | 'md';

interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Current on/off state. */
  checked: boolean;
  /** Called with the next state when the user flips the switch. */
  onChange: (checked: boolean) => void;
  size?: ToggleSize;
}

// Each size keeps the knob perfectly centred with equal 2px padding on every edge,
// so the switch can never overflow its track or look detached from the row.
const SIZES: Record<ToggleSize, { track: string; knob: string; on: string; off: string }> = {
  sm: { track: 'h-5 w-9', knob: 'h-4 w-4', on: 'translate-x-4', off: 'translate-x-0.5' },
  md: { track: 'h-6 w-11', knob: 'h-5 w-5', on: 'translate-x-[22px]', off: 'translate-x-0.5' },
};

/**
 * The app-wide on/off switch. Used for every boolean setting (notifications,
 * help tips, future preferences) so toggles look and behave identically
 * everywhere. Flex-centred — no absolute positioning — to guarantee the knob
 * stays inside the track on every screen size.
 */
export default function Toggle({
  checked,
  onChange,
  size = 'md',
  disabled,
  className = '',
  ...rest
}: ToggleProps) {
  const s = SIZES[size];
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex ${s.track} shrink-0 cursor-pointer touch-manipulation items-center rounded-full
        ring-1 ring-inset ring-black/[0.06] transition-colors duration-200 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2
        focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50
        dark:ring-white/10 ${checked ? 'bg-accent' : 'bg-surface-border'} ${className}`}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block ${s.knob} transform rounded-full bg-white shadow-sm
          ring-1 ring-black/5 transition-transform duration-200 ease-in-out ${checked ? s.on : s.off}`}
      />
    </button>
  );
}

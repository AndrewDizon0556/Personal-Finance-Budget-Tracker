import type { ButtonHTMLAttributes } from 'react';

type ToggleSize = 'sm' | 'md';

interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Current on/off state. */
  checked: boolean;
  /** Called with the next state when the user flips the switch. */
  onChange: (checked: boolean) => void;
  size?: ToggleSize;
}

// Every distance here is rem-based (Tailwind's default scale) so the knob travel
// always scales with the track width. The track's p-0.5 padding plus an `on` slide
// equal to (innerWidth - knobWidth) keeps the knob structurally inside the track —
// it cannot overflow. (The earlier bug mixed a fixed px slide with rem widths, so on
// mobile, where 1rem isn't exactly 16px, the knob drifted past the right edge.)
const SIZES: Record<ToggleSize, { track: string; knob: string; on: string }> = {
  sm: { track: 'h-5 w-9', knob: 'h-4 w-4', on: 'translate-x-4' },
  md: { track: 'h-6 w-11', knob: 'h-5 w-5', on: 'translate-x-5' },
};

/**
 * The app-wide on/off switch. Used for every boolean setting (notifications,
 * help tips, subscription active state) so toggles look and behave identically
 * everywhere.
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
      className={`relative inline-flex ${s.track} shrink-0 cursor-pointer touch-manipulation items-center rounded-full p-0.5
        ring-1 ring-inset ring-black/[0.06] transition-colors duration-200 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2
        focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50
        dark:ring-white/10 ${checked ? 'bg-accent' : 'bg-surface-border'} ${className}`}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block ${s.knob} transform rounded-full bg-white shadow-sm
          ring-1 ring-black/5 transition-transform duration-200 ease-in-out ${checked ? s.on : 'translate-x-0'}`}
      />
    </button>
  );
}

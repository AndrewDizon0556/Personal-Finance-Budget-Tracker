import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
}

/** Labeled input with error state, compatible with react-hook-form register(). */
const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          {label} {hint && <span className="font-normal text-ink-faint">{hint}</span>}
        </label>
        <input ref={ref} className={`input-field ${className ?? ''}`} {...props} />
        {error && <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>}
      </div>
    );
  },
);

TextField.displayName = 'TextField';
export default TextField;

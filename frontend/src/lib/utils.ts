/** Minimal classname joiner (no external dep). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Format a number as Philippine Peso. */
export function formatPeso(value: number, opts: { compact?: boolean } = {}): string {
  // Coerce anything non-finite (null/undefined/NaN from the API) to 0 so we never
  // render "₱NaN" or throw downstream.
  if (typeof value !== 'number' || !Number.isFinite(value)) value = 0;
  if (opts.compact && Math.abs(value) >= 1000) {
    return (
      '₱' +
      new Intl.NumberFormat('en-PH', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value)
    );
  }
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Short, friendly date label e.g. "May 29". */
export function formatShortDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Guard against null/invalid dates so we never render "Invalid Date".
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

/** Clamp a value between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

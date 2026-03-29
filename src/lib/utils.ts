/**
 * Utility Functions — NuruOS Field Intelligence
 */

// ---------------------------------------------------------------------------
// Class name merging
// ---------------------------------------------------------------------------

/**
 * Merge class name fragments, filtering out falsy values and deduplicating.
 *
 * @example
 *   cn('btn', isActive && 'btn-active', undefined, 'px-4')
 *   // => 'btn btn-active px-4'
 */
export function cn(
  ...inputs: Array<string | false | null | undefined | 0 | ''>
): string {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const input of inputs) {
    if (!input) continue;
    const parts = input.split(/\s+/);
    for (const part of parts) {
      if (part && !seen.has(part)) {
        seen.add(part);
        result.push(part);
      }
    }
  }

  return result.join(' ');
}

// ---------------------------------------------------------------------------
// Currency formatting
// ---------------------------------------------------------------------------

/**
 * Format a number as Tanzanian Shillings.
 *
 * @example
 *   formatTZS(1200)   // "TZS 1,200"
 *   formatTZS(0)      // "TZS 0"
 */
export function formatTZS(amount: number): string {
  const formatted = new Intl.NumberFormat('en-TZ', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `TZS ${formatted}`;
}

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

function toDate(input: string | number | Date): Date {
  if (input instanceof Date) return input;
  return new Date(input);
}

/**
 * Format a date as "15 Mar 2026".
 */
export function formatDate(input: string | number | Date): string {
  const d = toDate(input);
  const day = d.getDate();
  const month = MONTH_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format a date-time as "15 Mar 2026, 14:30".
 */
export function formatDateTime(input: string | number | Date): string {
  const d = toDate(input);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${formatDate(d)}, ${hours}:${minutes}`;
}

// ---------------------------------------------------------------------------
// Debounce
// ---------------------------------------------------------------------------

/**
 * Returns a debounced version of `fn` that delays invocation until after
 * `ms` milliseconds of silence.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = undefined;
      fn.apply(this, args);
    }, ms);
  };
}

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

/**
 * Generate a v4 UUID via the Web Crypto API.
 */
export function generateId(): string {
  return crypto.randomUUID();
}

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
// Locale-aware numeric parsing (Swahili decimal-comma support)
// ---------------------------------------------------------------------------

/**
 * Normalize a numeric string for locales that use a comma as decimal separator.
 *
 * Tanzania/Swahili users commonly type "2,5" to mean 2.5 hectares. Raw
 * `Number("2,5")` returns NaN and `parseFloat("2,5")` returns 2 — both silently
 * wrong. This preprocessor returns a string that JS numeric parsers accept.
 *
 * Rules (applied in order):
 *   1. Non-strings are returned as-is.
 *   2. Trim surrounding whitespace; strip ASCII spaces and NBSP / narrow NBSP
 *      used as thousands separators in some locales.
 *   3. If the string contains both `,` and `.`: the last-occurring one is the
 *      decimal; the other is treated as a thousands separator and stripped.
 *   4. If the string contains `,` but no `.`: the final `,` is the decimal,
 *      any earlier commas are thousands separators.
 *   5. Otherwise the string is left unchanged.
 *
 * @example
 *   normalizeDecimalComma('2,5')       // '2.5'
 *   normalizeDecimalComma('1 200,75')  // '1200.75'
 *   normalizeDecimalComma('1,200.50')  // '1200.50'
 *   normalizeDecimalComma('3.14')      // '3.14'
 *   normalizeDecimalComma(2.5)         // 2.5 (unchanged)
 */
export function normalizeDecimalComma<T>(value: T): T | string {
  if (typeof value !== 'string') return value;

  // Strip ASCII spaces, non-breaking space (U+00A0), narrow NBSP (U+202F).
  const stripped = value.trim().replace(/[\s\u00A0\u202F]/g, '');
  if (stripped === '') return stripped;

  const hasComma = stripped.includes(',');
  const hasDot = stripped.includes('.');

  if (hasComma && hasDot) {
    const lastComma = stripped.lastIndexOf(',');
    const lastDot = stripped.lastIndexOf('.');
    if (lastComma > lastDot) {
      // Comma is decimal; dots are thousands separators.
      return stripped.replace(/\./g, '').replace(',', '.');
    }
    // Dot is decimal; commas are thousands separators.
    return stripped.replace(/,/g, '');
  }

  if (hasComma) {
    const lastComma = stripped.lastIndexOf(',');
    const head = stripped.slice(0, lastComma).replace(/,/g, '');
    const tail = stripped.slice(lastComma + 1);
    return `${head}.${tail}`;
  }

  return stripped;
}

/**
 * Parse a user-entered numeric string into a finite `number`, accepting both
 * "1.5" and the Swahili "1,5" decimal-comma convention.
 *
 * Returns `null` for empty / non-numeric / non-finite input. Pass-through for
 * finite numbers. Does NOT enforce a sign — callers add range constraints.
 */
export function parseLocaleNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  const normalized = normalizeDecimalComma(String(value));
  if (typeof normalized !== 'string' || normalized === '') return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

// ---------------------------------------------------------------------------
// Numeric parsing (area / hectares)
// ---------------------------------------------------------------------------

/**
 * Parse a user-entered area value (hectares) into a finite non-negative number.
 *
 * Accepts Swahili comma-decimals ("2,5") via `parseLocaleNumber`. Returns
 * `null` for any input that is not a valid numeric area:
 *   - empty string / whitespace / null / undefined
 *   - NaN, Infinity, negative numbers
 *   - strings that parse to NaN
 *
 * Use this instead of `parseFloat(x) || 0`, which silently turns invalid input
 * (including empty fields) into 0 ha — producing bogus zero-area submissions.
 * Call sites that need a default for DISPLAY aggregation should opt in
 * explicitly with `parseAreaHa(x) ?? 0`. Submission paths should treat `null`
 * as an error.
 */
export function parseAreaHa(value: unknown): number | null {
  const parsed = parseLocaleNumber(value);
  if (parsed === null) return null;
  return parsed >= 0 ? parsed : null;
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

import { describe, it, expect } from 'vitest';
import {
  normalizeDecimalComma,
  parseLocaleNumber,
  parseAreaHa,
} from '../utils';

// ---------------------------------------------------------------------------
// normalizeDecimalComma — Swahili / European decimal-comma preprocessor
// ---------------------------------------------------------------------------

describe('normalizeDecimalComma', () => {
  it('passes numbers through unchanged', () => {
    expect(normalizeDecimalComma(2.5)).toBe(2.5);
    expect(normalizeDecimalComma(0)).toBe(0);
  });

  it('passes non-string, non-number values through', () => {
    expect(normalizeDecimalComma(null)).toBe(null);
    expect(normalizeDecimalComma(undefined)).toBe(undefined);
  });

  it('converts comma-only decimal to dot', () => {
    expect(normalizeDecimalComma('2,5')).toBe('2.5');
    expect(normalizeDecimalComma('0,75')).toBe('0.75');
  });

  it('trims whitespace and strips NBSP thousands spaces', () => {
    expect(normalizeDecimalComma('  2,5  ')).toBe('2.5');
    expect(normalizeDecimalComma('1\u00A0200,75')).toBe('1200.75');
    expect(normalizeDecimalComma('1 200,75')).toBe('1200.75');
  });

  it('treats trailing comma group as decimal, earlier commas as thousands', () => {
    expect(normalizeDecimalComma('1,200,5')).toBe('1200.5');
  });

  it('when both comma and dot present, uses the last one as decimal', () => {
    // en-TZ-style thousands: "1,200.50" → 1200.50
    expect(normalizeDecimalComma('1,200.50')).toBe('1200.50');
    // de-style: "1.200,50" → 1200.50
    expect(normalizeDecimalComma('1.200,50')).toBe('1200.50');
  });

  it('leaves plain dot decimals unchanged', () => {
    expect(normalizeDecimalComma('3.14')).toBe('3.14');
    expect(normalizeDecimalComma('0.5')).toBe('0.5');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(normalizeDecimalComma('')).toBe('');
    expect(normalizeDecimalComma('   ')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// parseLocaleNumber — end-to-end parse accepting comma decimals
// ---------------------------------------------------------------------------

describe('parseLocaleNumber', () => {
  it('parses Swahili decimal-comma input', () => {
    expect(parseLocaleNumber('2,5')).toBe(2.5);
    expect(parseLocaleNumber('0,0')).toBe(0);
  });

  it('parses en-style dot decimals', () => {
    expect(parseLocaleNumber('2.5')).toBe(2.5);
  });

  it('parses thousands-separated values', () => {
    expect(parseLocaleNumber('1,200.50')).toBe(1200.5);
    expect(parseLocaleNumber('1.200,50')).toBe(1200.5);
    expect(parseLocaleNumber('1 200,75')).toBe(1200.75);
  });

  it('passes finite numbers through', () => {
    expect(parseLocaleNumber(42)).toBe(42);
    expect(parseLocaleNumber(-3.14)).toBe(-3.14);
  });

  it('returns null for empty / invalid input', () => {
    expect(parseLocaleNumber('')).toBe(null);
    expect(parseLocaleNumber('   ')).toBe(null);
    expect(parseLocaleNumber('abc')).toBe(null);
    expect(parseLocaleNumber(null)).toBe(null);
    expect(parseLocaleNumber(undefined)).toBe(null);
    expect(parseLocaleNumber(NaN)).toBe(null);
    expect(parseLocaleNumber(Infinity)).toBe(null);
  });
});

// ---------------------------------------------------------------------------
// parseAreaHa — now accepts comma decimals for hectares
// ---------------------------------------------------------------------------

describe('parseAreaHa', () => {
  it('accepts Swahili comma decimals for hectare entry', () => {
    expect(parseAreaHa('2,5')).toBe(2.5);
    expect(parseAreaHa('0,75')).toBe(0.75);
  });

  it('accepts dot decimals', () => {
    expect(parseAreaHa('2.5')).toBe(2.5);
  });

  it('rejects negative areas', () => {
    expect(parseAreaHa('-1,5')).toBe(null);
    expect(parseAreaHa(-2)).toBe(null);
  });

  it('returns null for empty / invalid input', () => {
    expect(parseAreaHa('')).toBe(null);
    expect(parseAreaHa(null)).toBe(null);
    expect(parseAreaHa(undefined)).toBe(null);
    expect(parseAreaHa('abc')).toBe(null);
  });
});

import { describe, expect, it } from 'vitest';
import { centsToDecimal, decimalToCents, formatCents } from './money';

describe('formatCents', () => {
  it('formats cents as Brazilian reais', () => {
    expect(formatCents(1890)).toBe('R$ 18,90');
    expect(formatCents(0)).toBe('R$ 0,00');
    expect(formatCents(123456)).toBe('R$ 1.234,56');
  });

  it('rejects floats and negative values', () => {
    expect(() => formatCents(18.9)).toThrow(RangeError);
    expect(() => formatCents(-1)).toThrow(RangeError);
  });
});

describe('centsToDecimal / decimalToCents', () => {
  it('round-trips every cent value from R$ 0,00 to R$ 1.000,00', () => {
    for (let cents = 0; cents <= 100_000; cents++) {
      expect(decimalToCents(centsToDecimal(cents))).toBe(cents);
    }
  });

  it('absorbs floating point noise from external APIs', () => {
    expect(decimalToCents(0.1 + 0.2)).toBe(30);
    expect(decimalToCents(18.9)).toBe(1890);
  });

  it('rejects invalid amounts', () => {
    expect(() => decimalToCents(Number.NaN)).toThrow(RangeError);
    expect(() => decimalToCents(-5)).toThrow(RangeError);
  });
});

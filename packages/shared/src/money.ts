/**
 * Money is always an integer number of cents (e.g. 1890 = R$ 18,90).
 * Never store or compute prices as floats; convert only at the edges (screen and external APIs).
 */

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function assertCents(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`Expected a non-negative integer amount in cents, got ${value}`);
  }
}

/** 1890 -> "R$ 18,90" (with the non-breaking space Intl uses for pt-BR). */
export function formatCents(cents: number): string {
  assertCents(cents);
  return brl.format(cents / 100);
}

/** 1890 -> 18.9. Use only when an external API (e.g. Mercado Pago) requires a decimal amount. */
export function centsToDecimal(cents: number): number {
  assertCents(cents);
  return Number((cents / 100).toFixed(2));
}

/** 18.9 -> 1890. Use only when reading a decimal amount from an external API. */
export function decimalToCents(amount: number): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new RangeError(`Expected a non-negative finite amount, got ${amount}`);
  }
  return Math.round(amount * 100);
}

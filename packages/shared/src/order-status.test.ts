import { describe, expect, it } from 'vitest';
import {
  InvalidTransitionError,
  ORDER_STATUSES,
  assertTransition,
  canTransition,
  isFinalStatus,
  nextStatuses,
} from './order-status';

describe('order status machine', () => {
  it('follows the happy path', () => {
    expect(canTransition('pending_payment', 'paid')).toBe(true);
    expect(canTransition('paid', 'preparing')).toBe(true);
    expect(canTransition('preparing', 'ready')).toBe(true);
    expect(canTransition('ready', 'delivered')).toBe(true);
  });

  it('only lets unpaid orders expire', () => {
    expect(canTransition('pending_payment', 'expired')).toBe(true);
    expect(canTransition('paid', 'expired')).toBe(false);
  });

  it('never moves backwards', () => {
    expect(canTransition('ready', 'preparing')).toBe(false);
    expect(() => assertTransition('ready', 'preparing')).toThrow(InvalidTransitionError);
  });

  it('keeps final states final', () => {
    const finals = ORDER_STATUSES.filter(isFinalStatus);
    expect(finals).toEqual(['delivered', 'canceled', 'expired']);
    for (const status of finals) {
      expect(nextStatuses(status)).toHaveLength(0);
    }
  });
});

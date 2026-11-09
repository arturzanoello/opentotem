/**
 * Order lifecycle (section 5 of the project doc):
 *
 *   pending_payment -> paid -> preparing -> ready -> delivered
 *   pending_payment -> expired   (PIX expired)
 *   pending_payment -> canceled  (declined or abandoned)
 *   paid            -> canceled  (manager refund)
 *
 * Any other transition is rejected (HTTP 422 in the API).
 */

export const ORDER_STATUSES = [
  'pending_payment',
  'paid',
  'preparing',
  'ready',
  'delivered',
  'canceled',
  'expired',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

const TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  pending_payment: ['paid', 'canceled', 'expired'],
  paid: ['preparing', 'canceled'],
  preparing: ['ready'],
  ready: ['delivered'],
  delivered: [],
  canceled: [],
  expired: [],
};

export class InvalidTransitionError extends Error {
  constructor(
    readonly from: OrderStatus,
    readonly to: OrderStatus,
  ) {
    super(`Invalid order status transition: ${from} -> ${to}`);
    this.name = 'InvalidTransitionError';
  }
}

export function nextStatuses(from: OrderStatus): readonly OrderStatus[] {
  return TRANSITIONS[from];
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new InvalidTransitionError(from, to);
  }
}

export function isFinalStatus(status: OrderStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

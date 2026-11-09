/**
 * Public contract of pos-bridge (section 7 of the project doc).
 * Every terminal manufacturer becomes one PosAdapter; the app only talks to this interface.
 */

export type PaymentMethod = 'credit' | 'debit';

export interface ChargeRequest {
  amountCents: number;
  method: PaymentMethod;
  /** Credit only. */
  installments?: number;
  idempotencyKey: string;
  /** Printed on the receipt, e.g. "#42". */
  orderRef: string;
}

export type TerminalEvent =
  | { type: 'waiting_card' }
  | { type: 'card_read'; entry: 'chip' | 'contactless' | 'magstripe' }
  | { type: 'waiting_pin' }
  | { type: 'processing' }
  | { type: 'remove_card' }
  /** Free text shown by the terminal itself. */
  | { type: 'message'; text: string };

export type DeclineCode =
  | 'insufficient_funds'
  | 'invalid_pin'
  | 'card_expired'
  | 'card_blocked'
  | 'not_authorized'
  | 'terminal_error';

export type ChargeResult =
  | {
      status: 'approved';
      nsu: string;
      authorizationCode: string;
      brand: string;
      last4: string;
      receipt?: string;
    }
  | { status: 'declined'; code: DeclineCode; message: string }
  /** Customer or operator canceled on the terminal. */
  | { status: 'canceled' }
  /** Timeout or lost connection: the outcome is unknown and must be checked with getStatus. */
  | { status: 'unknown'; reason: string };

export interface PosAdapter {
  readonly name: string;
  initialize(config: Record<string, unknown>): Promise<void>;
  charge(request: ChargeRequest, onEvent: (event: TerminalEvent) => void): Promise<ChargeResult>;
  cancelOngoing(): Promise<void>;
  getStatus(idempotencyKey: string): Promise<ChargeResult | null>;
  refund(nsu: string, amountCents: number): Promise<ChargeResult>;
}

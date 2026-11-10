/**
 * Database schema (section 5 of the project doc). Coupons are out of the 21-day scope.
 *
 * Conventions:
 * - Money columns end in `_cents` and are integers.
 * - IDs are UUID v7 (time-ordered). Orders get their ID from the kiosk, so `orders.id` has no default.
 * - Column names are snake_case in the database and camelCase in TypeScript.
 */

import { ORDER_STATUSES } from '@opentotem/shared';
import { relations, sql } from 'drizzle-orm';
import {
  bigserial,
  boolean,
  char,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { v7 as uuidv7 } from 'uuid';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const userRole = pgEnum('user_role', ['admin', 'manager', 'kitchen']);
export const deviceKind = pgEnum('device_kind', ['kiosk', 'kds', 'display']);
/** Same list as the state machine in packages/shared, so the two cannot drift apart. */
export const orderStatus = pgEnum('order_status', ORDER_STATUSES);
export const diningOption = pgEnum('dining_option', ['here', 'takeaway']);
export const paymentMethod = pgEnum('payment_method', ['pix', 'credit', 'debit']);
export const paymentStatus = pgEnum('payment_status', [
  'pending',
  'approved',
  'declined',
  'expired',
  'refunded',
]);

// ---------------------------------------------------------------------------
// Column helpers
// ---------------------------------------------------------------------------

const id = () =>
  uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv7());

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

// ---------------------------------------------------------------------------
// Store, staff and devices
// ---------------------------------------------------------------------------

export const stores = pgTable('stores', {
  id: id(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  timezone: text('timezone').notNull().default('America/Sao_Paulo'),
  pixExpirationSeconds: integer('pix_expiration_seconds').notNull().default(300),
});

export const users = pgTable('users', {
  id: id(),
  storeId: uuid('store_id')
    .notNull()
    .references(() => stores.id),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  /** argon2id */
  passwordHash: text('password_hash').notNull(),
  role: userRole('role').notNull(),
});

export const devices = pgTable('devices', {
  id: id(),
  storeId: uuid('store_id')
    .notNull()
    .references(() => stores.id),
  /** e.g. "Totem 1 - Entrada" */
  name: text('name').notNull(),
  kind: deviceKind('kind').notNull(),
  /** SHA-256 of the device token. The token itself is never stored. */
  tokenHash: text('token_hash').notNull(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
});

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------

export const categories = pgTable('categories', {
  id: id(),
  storeId: uuid('store_id')
    .notNull()
    .references(() => stores.id),
  name: text('name').notNull(),
  position: integer('position').notNull().default(0),
});

export const products = pgTable(
  'products',
  {
    id: id(),
    storeId: uuid('store_id')
      .notNull()
      .references(() => stores.id),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id),
    name: text('name').notNull(),
    description: text('description'),
    imageUrl: text('image_url'),
    priceCents: integer('price_cents').notNull(),
    /** EAN-13 of packaged products, read by the kiosk camera. */
    barcode: text('barcode'),
    available: boolean('available').notNull().default(true),
    position: integer('position').notNull().default(0),
    updatedAt: updatedAt(),
  },
  (t) => [check('products_price_cents_check', sql`${t.priceCents} >= 0`)],
);

/** e.g. "Ponto da carne" (pick exactly 1) or "Adicionais" (pick up to 3). */
export const modifierGroups = pgTable('modifier_groups', {
  id: id(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  minSelect: integer('min_select').notNull().default(0),
  maxSelect: integer('max_select').notNull().default(1),
});

export const modifiers = pgTable('modifiers', {
  id: id(),
  groupId: uuid('group_id')
    .notNull()
    .references(() => modifierGroups.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  priceCents: integer('price_cents').notNull().default(0),
});

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

/**
 * One row per store and day. The order number comes from
 * INSERT ... ON CONFLICT DO UPDATE SET last_number = last_number + 1 RETURNING last_number,
 * so two kiosks never get the same number.
 */
export const dailyCounters = pgTable(
  'daily_counters',
  {
    storeId: uuid('store_id')
      .notNull()
      .references(() => stores.id),
    day: date('day').notNull(),
    lastNumber: integer('last_number').notNull(),
  },
  (t) => [primaryKey({ columns: [t.storeId, t.day] })],
);

export const orders = pgTable(
  'orders',
  {
    /** UUID v7 generated by the kiosk: a retried request cannot create a second order. */
    id: uuid('id').primaryKey(),
    storeId: uuid('store_id')
      .notNull()
      .references(() => stores.id),
    deviceId: uuid('device_id')
      .notNull()
      .references(() => devices.id),
    /** Order number of the day, shown on the display panel. */
    number: integer('number').notNull(),
    status: orderStatus('status').notNull().default('pending_payment'),
    diningOption: diningOption('dining_option').notNull(),
    customerName: text('customer_name'),
    subtotalCents: integer('subtotal_cents').notNull(),
    discountCents: integer('discount_cents').notNull().default(0),
    totalCents: integer('total_cents').notNull(),
    createdAt: createdAt(),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    readyAt: timestamp('ready_at', { withTimezone: true }),
  },
  (t) => [index('orders_store_status_idx').on(t.storeId, t.status, t.createdAt)],
);

export const orderItems = pgTable(
  'order_items',
  {
    id: id(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    /** Copied at the time of sale: changing the menu later does not change past orders. */
    productName: text('product_name').notNull(),
    unitPriceCents: integer('unit_price_cents').notNull(),
    quantity: integer('quantity').notNull(),
    notes: text('notes'),
  },
  (t) => [
    check('order_items_quantity_check', sql`${t.quantity} > 0`),
    // PostgreSQL does not index foreign keys automatically.
    index('order_items_order_idx').on(t.orderId),
  ],
);

export const orderItemModifiers = pgTable(
  'order_item_modifiers',
  {
    orderItemId: uuid('order_item_id')
      .notNull()
      .references(() => orderItems.id, { onDelete: 'cascade' }),
    modifierId: uuid('modifier_id')
      .notNull()
      .references(() => modifiers.id),
    /** Copied at the time of sale, like order_items.product_name. */
    name: text('name').notNull(),
    priceCents: integer('price_cents').notNull(),
  },
  (t) => [primaryKey({ columns: [t.orderItemId, t.modifierId] })],
);

/** Order history: one row per change, shown as a timeline in the admin panel. */
export const orderEvents = pgTable(
  'order_events',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id),
    /** 'created' | 'paid' | 'status_changed' ... */
    type: text('type').notNull(),
    /** 'device:<id>' | 'user:<id>' | 'system' */
    actor: text('actor').notNull(),
    data: jsonb('data'),
    createdAt: createdAt(),
  },
  (t) => [index('order_events_order_idx').on(t.orderId)],
);

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export const payments = pgTable(
  'payments',
  {
    id: id(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id),
    method: paymentMethod('method').notNull(),
    /** 'mercadopago' | 'simulator' */
    provider: text('provider').notNull(),
    providerPaymentId: text('provider_payment_id'),
    status: paymentStatus('status').notNull().default('pending'),
    amountCents: integer('amount_cents').notNull(),
    idempotencyKey: uuid('idempotency_key').notNull().unique(),
    // Card data is limited to what a receipt shows. Never the card number.
    cardBrand: text('card_brand'),
    cardLast4: char('card_last4', { length: 4 }),
    nsu: text('nsu'),
    authorizationCode: text('authorization_code'),
    pixQrCode: text('pix_qr_code'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    /** Provider response, kept for debugging and reconciliation. */
    raw: jsonb('raw'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('payments_order_idx').on(t.orderId),
    // Last line of defense: even with a bug in the code, the database refuses
    // a second approved payment for the same order.
    uniqueIndex('payments_one_approved_per_order')
      .on(t.orderId)
      .where(sql`status = 'approved'`),
  ],
);

/** Every webhook received, stored before processing. The same notice arriving twice is ignored. */
export const webhookEvents = pgTable(
  'webhook_events',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    provider: text('provider').notNull(),
    externalId: text('external_id').notNull(),
    payload: jsonb('payload').notNull(),
    receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
  },
  (t) => [unique('webhook_events_provider_external_id_key').on(t.provider, t.externalId)],
);

// ---------------------------------------------------------------------------
// Relations (used by db.query.* to load nested data, e.g. the menu tree)
// ---------------------------------------------------------------------------

export const storesRelations = relations(stores, ({ many }) => ({
  categories: many(categories),
  products: many(products),
  devices: many(devices),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  store: one(stores, { fields: [categories.storeId], references: [stores.id] }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, { fields: [products.storeId], references: [stores.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  modifierGroups: many(modifierGroups),
}));

export const modifierGroupsRelations = relations(modifierGroups, ({ one, many }) => ({
  product: one(products, { fields: [modifierGroups.productId], references: [products.id] }),
  modifiers: many(modifiers),
}));

export const modifiersRelations = relations(modifiers, ({ one }) => ({
  group: one(modifierGroups, { fields: [modifiers.groupId], references: [modifierGroups.id] }),
}));

export const devicesRelations = relations(devices, ({ one }) => ({
  store: one(stores, { fields: [devices.storeId], references: [stores.id] }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
  payments: many(payments),
  events: many(orderEvents),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  modifiers: many(orderItemModifiers),
}));

export const orderItemModifiersRelations = relations(orderItemModifiers, ({ one }) => ({
  orderItem: one(orderItems, {
    fields: [orderItemModifiers.orderItemId],
    references: [orderItems.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, { fields: [orderEvents.orderId], references: [orders.id] }),
}));

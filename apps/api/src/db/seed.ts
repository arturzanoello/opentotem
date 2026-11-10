/**
 * Resets the database and loads the Café Oeste demo data.
 * Run with `pnpm db:seed`. Refuses to run when NODE_ENV=production.
 */

import { sql } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { generateDeviceToken, hashDeviceToken } from '../auth/device-token';
import { loadEnv } from '../env';
import { createDb } from './client';
import * as schema from './schema';
import * as data from './seed-data';

const env = loadEnv();

if (env.NODE_ENV === 'production') {
  console.error('Refusing to seed: NODE_ENV is production and the seed deletes all data.');
  process.exit(1);
}

const { db, pool } = createDb(env.DATABASE_URL);

try {
  const tokens = await db.transaction(async (tx) => {
    // Start from an empty database so the seed can run any number of times.
    await tx.execute(sql`
      TRUNCATE stores, users, devices, categories, products, modifier_groups, modifiers,
        daily_counters, orders, order_items, order_item_modifiers, order_events,
        payments, webhook_events
      RESTART IDENTITY CASCADE
    `);

    const storeId = uuidv7();
    await tx.insert(schema.stores).values({ id: storeId, ...data.store });

    const deviceTokens = data.devices.map((device) => ({
      ...device,
      token: generateDeviceToken(),
    }));
    await tx.insert(schema.devices).values(
      deviceTokens.map(({ name, kind, token }) => ({
        storeId,
        name,
        kind,
        tokenHash: hashDeviceToken(token),
      })),
    );

    for (const [categoryIndex, category] of data.menu.entries()) {
      const categoryId = uuidv7();
      await tx
        .insert(schema.categories)
        .values({ id: categoryId, storeId, name: category.name, position: categoryIndex });

      for (const [productIndex, product] of category.products.entries()) {
        const productId = uuidv7();
        await tx.insert(schema.products).values({
          id: productId,
          storeId,
          categoryId,
          name: product.name,
          description: product.description,
          priceCents: product.priceCents,
          barcode: product.barcode,
          position: productIndex,
        });

        for (const group of product.modifierGroups ?? []) {
          const groupId = uuidv7();
          await tx.insert(schema.modifierGroups).values({
            id: groupId,
            productId,
            name: group.name,
            minSelect: group.minSelect,
            maxSelect: group.maxSelect,
          });
          await tx
            .insert(schema.modifiers)
            .values(group.modifiers.map((modifier) => ({ groupId, ...modifier })));
        }
      }
    }

    return deviceTokens;
  });

  const productCount = data.menu.reduce((sum, category) => sum + category.products.length, 0);
  console.log(
    `Seeded ${data.store.name}: ${data.menu.length} categories, ${productCount} products, ${tokens.length} devices.`,
  );
  console.log('\nDevice tokens (only the hash is stored; a new seed creates new tokens):');
  for (const { name, kind, token } of tokens) {
    console.log(`  ${kind.padEnd(8)} ${name.padEnd(20)} ${token}`);
  }
} finally {
  await pool.end();
}

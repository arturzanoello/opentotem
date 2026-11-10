import { assertCents } from '@opentotem/shared';
import { describe, expect, it } from 'vitest';
import { menu } from '../src/db/seed-data';

const products = menu.flatMap((category) => category.products);
const groups = products.flatMap((product) => product.modifierGroups ?? []);

function ean13CheckDigit(first12: string): number {
  const sum = [...first12].reduce(
    (acc, digit, index) => acc + Number(digit) * (index % 2 === 0 ? 1 : 3),
    0,
  );
  return (10 - (sum % 10)) % 10;
}

describe('Café Oeste seed data', () => {
  it('has 4 categories and about 15 products', () => {
    expect(menu).toHaveLength(4);
    expect(products.length).toBeGreaterThanOrEqual(12);
  });

  it('uses unique product names', () => {
    const names = products.map((product) => product.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('stores every price as integer cents', () => {
    const prices = [
      ...products.map((product) => product.priceCents),
      ...groups.flatMap((group) => group.modifiers.map((modifier) => modifier.priceCents)),
    ];
    for (const price of prices) {
      expect(() => assertCents(price)).not.toThrow();
    }
  });

  it('has modifier groups that can be satisfied', () => {
    for (const group of groups) {
      expect(group.minSelect).toBeGreaterThanOrEqual(0);
      expect(group.minSelect).toBeLessThanOrEqual(group.maxSelect);
      expect(group.maxSelect).toBeLessThanOrEqual(group.modifiers.length);
    }
  });

  it('uses valid, unique EAN-13 barcodes from the in-store range', () => {
    const barcodes = products.flatMap((product) => (product.barcode ? [product.barcode] : []));
    expect(barcodes.length).toBeGreaterThan(0);
    expect(new Set(barcodes).size).toBe(barcodes.length);

    for (const barcode of barcodes) {
      expect(barcode).toMatch(/^2\d{12}$/);
      expect(Number(barcode[12])).toBe(ean13CheckDigit(barcode.slice(0, 12)));
    }
  });
});

import { describe, expect, it } from 'vitest';
import { hasMinimumPurchaseCompliance } from '../Purchases';
import type { Purchase } from '../../../../core/types/types';

const makePurchase = (overrides: Partial<Purchase> = {}): Partial<Purchase> => ({
  supplierId: 'supplier-1',
  invoiceNumber: 'FAT-2026-010',
  ...overrides,
});

describe('Purchases submit compliance', () => {
  it('bloqueia quando supplierId está ausente', () => {
    expect(hasMinimumPurchaseCompliance(makePurchase({ supplierId: '' }))).toBe(false);
  });

  it('bloqueia quando invoiceNumber está ausente', () => {
    expect(hasMinimumPurchaseCompliance(makePurchase({ invoiceNumber: '   ' }))).toBe(false);
  });

  it('permite quando ambos os campos existem', () => {
    expect(hasMinimumPurchaseCompliance(makePurchase())).toBe(true);
  });
});

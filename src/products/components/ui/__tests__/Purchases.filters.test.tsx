import { describe, expect, it } from 'vitest';
import { matchesPurchaseCompositeFilters } from '../Purchases';
import type { Purchase } from '../../../../core/types/types';

const makePurchase = (overrides: Partial<Purchase> = {}): Purchase => ({
  id: 'p-1',
  supplierId: 's-1',
  supplierName: 'Fornecedor A',
  items: [],
  totalAmount: 100,
  date: '2026-03-24',
  invoiceNumber: 'FAT-2026-001',
  ...overrides,
});

describe('Purchases composite filters', () => {
  it('aplica AND entre fornecedor e fatura', () => {
    const purchase = makePurchase({ supplierName: 'Fornecedor XPTO', invoiceNumber: 'FAT-2026-099' });

    expect(matchesPurchaseCompositeFilters(purchase, 'xpto', '099')).toBe(true);
    expect(matchesPurchaseCompositeFilters(purchase, 'xpto', '777')).toBe(false);
    expect(matchesPurchaseCompositeFilters(purchase, 'outro', '099')).toBe(false);
  });

  it('aceita filtros vazios como coringa', () => {
    const purchase = makePurchase();
    expect(matchesPurchaseCompositeFilters(purchase, '', '')).toBe(true);
    expect(matchesPurchaseCompositeFilters(purchase, '', '001')).toBe(true);
    expect(matchesPurchaseCompositeFilters(purchase, 'Fornecedor', '')).toBe(true);
  });
});

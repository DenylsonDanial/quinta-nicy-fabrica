import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Purchase } from '../../../core/types/types';

const insertMock = vi.fn();
const selectMock = vi.fn();
const singleMock = vi.fn();
const fromMock = vi.fn();

vi.mock('../../../core/services/supabaseClient', () => ({
  isSupabaseConfigured: () => true,
  supabase: {
    from: fromMock,
  },
}));

vi.mock('../stockService', () => ({
  stockService: {
    getStockMovements: vi.fn().mockResolvedValue([]),
    deleteStockMovement: vi.fn().mockResolvedValue(undefined),
    ensureStockMovement: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('purchaseService compliance gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    fromMock.mockReturnValue({
      insert: insertMock,
    });
    insertMock.mockReturnValue({
      select: selectMock,
    });
    selectMock.mockReturnValue({
      single: singleMock,
    });
    singleMock.mockResolvedValue({
      data: {
        id: 'purchase-1',
        supplier_id: 'supplier-1',
        supplier_name: 'Fornecedor 1',
        date: '2026-03-24',
        invoice_number: 'FAT-2026-0001',
        items: [],
        total_amount: 100,
      },
      error: null,
    });
  });

  const validPurchase = (): Purchase => ({
    id: '',
    supplierId: 'supplier-1',
    supplierName: 'Fornecedor 1',
    date: '2026-03-24',
    invoiceNumber: 'FAT-2026-0001',
    items: [],
    totalAmount: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('bloqueia createPurchase sem supplierId', async () => {
    const { purchaseService } = await import('../purchaseService');
    const purchase = validPurchase();
    purchase.supplierId = '';

    const result = await purchaseService.createPurchase(purchase);

    expect(result.purchase).toBeNull();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('bloqueia createPurchase sem invoiceNumber', async () => {
    const { purchaseService } = await import('../purchaseService');
    const purchase = validPurchase();
    purchase.invoiceNumber = '   ';

    const result = await purchaseService.createPurchase(purchase);

    expect(result.purchase).toBeNull();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('permite createPurchase valido e persiste', async () => {
    const { purchaseService } = await import('../purchaseService');
    const purchase = validPurchase();

    const result = await purchaseService.createPurchase(purchase);

    expect(result.purchase?.id).toBe('purchase-1');
    expect(fromMock).toHaveBeenCalledWith('purchases');
    expect(insertMock).toHaveBeenCalledTimes(1);
  });
});

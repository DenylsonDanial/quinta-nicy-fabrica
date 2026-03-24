import { beforeEach, describe, expect, it, vi } from 'vitest';

const selectSingleMock = vi.fn();
const updateEqMock = vi.fn();
const updateMock = vi.fn();
const selectMock = vi.fn();
const eqMock = vi.fn();
const fromMock = vi.fn();

const logActionMock = vi.fn();
const checkPermissionMock = vi.fn();

vi.mock('../../../core/services/supabaseClient', () => ({
  isSupabaseConfigured: () => true,
  supabase: {
    from: fromMock,
  },
}));

vi.mock('../../../core/services/auditService', () => ({
  auditService: {
    logAction: logActionMock,
  },
}));

vi.mock('../../../core/services/permissionsService', () => ({
  permissionsService: {
    checkPermission: checkPermissionMock,
  },
}));

describe('purchaseService audit + permission gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    fromMock.mockImplementation((table: string) => {
      if (table === 'purchases') {
        return {
          select: selectMock,
          update: updateMock,
        };
      }
      return {};
    });

    selectMock.mockReturnValue({ eq: eqMock });
    eqMock.mockReturnValue({ single: selectSingleMock });
    selectSingleMock.mockResolvedValue({
      data: {
        items: [],
        date: '2026-03-24',
        supplier_id: 'sup-1',
        supplier_name: 'Fornecedor 1',
        invoice_number: 'FT-1',
        payment_status: 'pending',
        payment_date: null,
        notes: null,
      },
    });

    updateMock.mockReturnValue({ eq: updateEqMock });
    updateEqMock.mockResolvedValue({ error: null });

    checkPermissionMock.mockResolvedValue(true);
    logActionMock.mockResolvedValue({ success: true });
  });

  it('bloqueia update quando actor nao tem permissao purchases.edit', async () => {
    checkPermissionMock.mockResolvedValue(false);
    const { purchaseService } = await import('../purchaseService');

    const ok = await purchaseService.updatePurchase(
      'purchase-1',
      { invoiceNumber: 'FT-2' },
      false,
      { userId: 'user-1' },
    );

    expect(ok).toBe(false);
    expect(updateMock).not.toHaveBeenCalled();
    expect(logActionMock).not.toHaveBeenCalled();
  });

  it('registra trilha de metadata correction com old/new/user', async () => {
    const { purchaseService } = await import('../purchaseService');

    const ok = await purchaseService.updatePurchase(
      'purchase-1',
      { invoiceNumber: 'FT-2', notes: 'Correcao fiscal' },
      false,
      { userId: 'user-1', userName: 'Operador', userEmail: 'op@example.com' },
    );

    expect(ok).toBe(true);
    expect(updateMock).toHaveBeenCalled();
    expect(logActionMock).toHaveBeenCalledTimes(1);
    expect(logActionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'purchase.metadata_corrected',
        entityType: 'purchase',
        entityId: 'purchase-1',
        userId: 'user-1',
        oldData: expect.objectContaining({ invoiceNumber: 'FT-1' }),
        newData: expect.objectContaining({ invoiceNumber: 'FT-2' }),
      }),
    );
  });
});

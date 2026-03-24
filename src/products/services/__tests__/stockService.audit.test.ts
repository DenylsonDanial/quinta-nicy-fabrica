import { describe, expect, it } from 'vitest';
import { AUDIT_EVENT_CATALOG, isKnownAuditAction } from '../../../core/services/auditEvents';

describe('stock audit events contract', () => {
  it('mantem nomenclatura padronizada de eventos criticos de stock', () => {
    expect(AUDIT_EVENT_CATALOG.stock.movementCreated.action).toBe('stock.movement_created');
    expect(AUDIT_EVENT_CATALOG.stock.movementUpdated.action).toBe('stock.movement_updated');
    expect(AUDIT_EVENT_CATALOG.stock.movementDeleted.action).toBe('stock.movement_deleted');
    expect(AUDIT_EVENT_CATALOG.stock.adjustmentCreated.action).toBe('stock.adjustment_created');
    expect(AUDIT_EVENT_CATALOG.stock.auditApplied.action).toBe('stock.audit_applied');
  });

  it('garante que eventos de stock estao registrados no catalogo validado', () => {
    expect(isKnownAuditAction('stock.movement_created')).toBe(true);
    expect(isKnownAuditAction('stock.movement_updated')).toBe(true);
    expect(isKnownAuditAction('stock.audit_applied')).toBe(true);
    expect(isKnownAuditAction('stock.update')).toBe(false);
  });
});

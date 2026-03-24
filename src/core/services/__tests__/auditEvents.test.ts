import { describe, expect, it } from 'vitest';
import {
  AUDIT_EVENT_CATALOG,
  isKnownAuditAction,
  isKnownAuditEntityType,
} from '../auditEvents';

describe('audit event catalog', () => {
  it('inclui eventos obrigatorios da fase 2', () => {
    expect(AUDIT_EVENT_CATALOG.purchase.metadataCorrected.action).toBe('purchase.metadata_corrected');
    expect(AUDIT_EVENT_CATALOG.stock.movementCreated.action).toBe('stock.movement_created');
    expect(AUDIT_EVENT_CATALOG.stock.movementUpdated.action).toBe('stock.movement_updated');
    expect(AUDIT_EVENT_CATALOG.stock.adjustmentCreated.action).toBe('stock.adjustment_created');
    expect(AUDIT_EVENT_CATALOG.stock.auditApplied.action).toBe('stock.audit_applied');
  });

  it('valida action/entity_type padronizados', () => {
    expect(isKnownAuditAction('purchase.metadata_corrected')).toBe(true);
    expect(isKnownAuditAction('stock.audit_applied')).toBe(true);
    expect(isKnownAuditAction('purchase.updated')).toBe(false);

    expect(isKnownAuditEntityType('purchase')).toBe(true);
    expect(isKnownAuditEntityType('stock_movement')).toBe(true);
    expect(isKnownAuditEntityType('movement')).toBe(false);
  });
});

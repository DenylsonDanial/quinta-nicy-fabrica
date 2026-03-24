export const AUDIT_EVENT_CATALOG = {
  purchase: {
    metadataCorrected: {
      action: 'purchase.metadata_corrected',
      entityType: 'purchase',
    },
  },
  stock: {
    movementCreated: {
      action: 'stock.movement_created',
      entityType: 'stock_movement',
    },
    movementUpdated: {
      action: 'stock.movement_updated',
      entityType: 'stock_movement',
    },
    movementDeleted: {
      action: 'stock.movement_deleted',
      entityType: 'stock_movement',
    },
    adjustmentCreated: {
      action: 'stock.adjustment_created',
      entityType: 'stock_adjustment',
    },
    adjustmentUpdated: {
      action: 'stock.adjustment_updated',
      entityType: 'stock_adjustment',
    },
    adjustmentDeleted: {
      action: 'stock.adjustment_deleted',
      entityType: 'stock_adjustment',
    },
    auditApproved: {
      action: 'stock.audit_approved',
      entityType: 'stock_audit',
    },
    auditApplied: {
      action: 'stock.audit_applied',
      entityType: 'stock_audit',
    },
    auditReverted: {
      action: 'stock.audit_reverted',
      entityType: 'stock_audit',
    },
  },
} as const;

type CatalogBranch = typeof AUDIT_EVENT_CATALOG[keyof typeof AUDIT_EVENT_CATALOG];
type CatalogLeaf = CatalogBranch[keyof CatalogBranch];

export const AUDIT_ACTIONS = new Set<string>(
  Object.values(AUDIT_EVENT_CATALOG).flatMap((group) =>
    Object.values(group).map((event) => event.action),
  ),
);

export const AUDIT_ENTITY_TYPES = new Set<string>(
  Object.values(AUDIT_EVENT_CATALOG).flatMap((group) =>
    Object.values(group).map((event) => event.entityType),
  ),
);

export function isKnownAuditAction(action: string): boolean {
  return AUDIT_ACTIONS.has(action);
}

export function isKnownAuditEntityType(entityType: string): boolean {
  return AUDIT_ENTITY_TYPES.has(entityType);
}

export function resolveCatalogEvent(event: CatalogLeaf): CatalogLeaf {
  return event;
}

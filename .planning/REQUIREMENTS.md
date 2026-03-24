# REQUIREMENTS

## v1 Requirements

### Faturacao e Documentos

- [x] **BILL-01**: Usuario pode registrar compra com numero de fatura obrigatorio e fornecedor associado.
- [x] **BILL-02**: Usuario pode consultar historico de compras por periodo, fornecedor e numero de fatura.
- [ ] **BILL-03**: Usuario pode corrigir metadados de faturacao com trilha de auditoria.
- [x] **BILL-04**: Sistema impede fechamento de compra sem campos fiscais minimos definidos para o negocio.

### Stock Operacional

- [ ] **STK-01**: Sistema cria movimento de entrada de stock automaticamente ao confirmar compra faturada.
- [ ] **STK-02**: Usuario pode consultar movimentos de stock com origem, data, documento e responsavel.
- [ ] **STK-03**: Usuario pode gerir lotes com saldo, validade e estado.
- [ ] **STK-04**: Usuario pode executar ajustes de stock com motivo e aprovacao conforme permissao.
- [ ] **STK-05**: Usuario pode executar auditoria de stock e emitir relatorio de divergencias.

### Integridade e Seguranca

- [ ] **INT-01**: Sistema garante consistencia entre faturacao de compras e saldo de stock sem divergencia silenciosa.
- [ ] **INT-02**: Sistema registra logs auditaveis para operacoes criticas de faturacao e stock.
- [ ] **INT-03**: Sistema aplica permissoes por perfil para criar, editar e auditar dados criticos.

### Preparacao para Producao

- [ ] **PRD-01**: Sistema classifica itens como materia-prima, semiacabado e produto acabado.
- [ ] **PRD-02**: Sistema prepara estrutura de dados para futura ordem de producao sem quebrar fluxo atual.

## v2 Requirements (Deferred)

- [ ] **MFG-01**: Usuario pode criar e gerir ordens de producao com status operacional.
- [ ] **MFG-02**: Sistema baixa consumo de materia-prima por ordem de producao.
- [ ] **MFG-03**: Sistema calcula custo por lote de producao.
- [ ] **MFG-04**: Sistema rastreia lote ponta a ponta (entrada -> producao -> expedicao).

## Out of Scope

- Fidelizacao e campanhas de marketing orientadas a loja — nao critico para transicao fabril inicial.
- Expansao de canais comerciais e CRM avancado — adiado para apos estabilizacao de faturacao/stock.
- Replatform completo de frontend/backend — alto risco, sem necessidade para este milestone.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BILL-01 | Phase 1 | Complete |
| BILL-02 | Phase 1 | Complete |
| BILL-03 | Phase 2 | Pending |
| BILL-04 | Phase 1 | Complete |
| STK-01 | Phase 3 | Pending |
| STK-02 | Phase 3 | Pending |
| STK-03 | Phase 4 | Pending |
| STK-04 | Phase 4 | Pending |
| STK-05 | Phase 4 | Pending |
| INT-01 | Phase 3 | Pending |
| INT-02 | Phase 2 | Pending |
| INT-03 | Phase 2 | Pending |
| PRD-01 | Phase 5 | Pending |
| PRD-02 | Phase 5 | Pending |

---
*Last updated: 2026-03-23 after roadmap creation*

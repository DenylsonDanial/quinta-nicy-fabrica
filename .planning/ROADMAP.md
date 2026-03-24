# Roadmap: Quinta Nicy Fabrica

## Overview

Roadmap de migracao brownfield de loja para fabrica com foco inicial em faturacao e stock confiaveis, auditaveis e consistentes. A sequencia prioriza risco operacional e financeiro: primeiro conformidade documental de compras, depois integridade e seguranca das operacoes criticas, em seguida stock integrado e auditavel, e por fim a base estrutural para a fase seguinte de producao.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Faturacao e Compliance de Compras** - Garantir registro fiscal minimo e consulta confiavel de compras.
- [x] **Phase 2: Integridade e Seguranca Operacional** - Fechar trilha auditavel e controle de permissao nas operacoes criticas.
- [ ] **Phase 3: Stock Integrado a Compras** - Sincronizar entradas de stock com compras faturadas sem divergencia silenciosa.
- [ ] **Phase 4: Lotes, Ajustes e Auditoria de Stock** - Consolidar governanca de lotes, ajustes controlados e auditoria operacional.
- [ ] **Phase 5: Base de Dados para Producao** - Preparar classificacao e estrutura para ordens de producao futuras sem quebrar fluxo atual.

## Phase Details

### Phase 1: Faturacao e Compliance de Compras
**Goal**: Usuarios conseguem registrar e consultar compras com dados fiscais minimos obrigatorios para operacao fabril.
**Depends on**: Nothing (first phase)
**Requirements**: BILL-01, BILL-02, BILL-04
**Success Criteria** (what must be TRUE):
  1. Usuario consegue registrar compra com numero de fatura obrigatorio e fornecedor associado em formulario unico.
  2. Usuario consegue consultar historico de compras por periodo, fornecedor e numero de fatura em tela de busca.
  3. Sistema bloqueia fechamento de compra quando campos fiscais minimos exigidos nao estao preenchidos.
**Plans**: 2 plans
Plans:
- [ ] 01-01-PLAN.md - Endurecer compliance fiscal no service para bloquear registro/fechamento invalido (BILL-01, BILL-04).
- [ ] 01-02-PLAN.md - Implementar consulta composta e bloqueio de submit na UI de compras (BILL-02, BILL-04).
**UI hint**: yes

### Phase 01.1: Limpeza de funcionalidades obsoletas e simplificacao de fluxos legados (INSERTED)

**Goal:** Reduzir ruido de compatibilidade legada em rotas/admin para preparar base mais previsivel antes da Fase 2.
**Requirements**: N/A (housekeeping tecnico)
**Depends on:** Phase 1
**Plans:** 1 plan

Plans:
- [x] 01.1-01-PLAN.md - Remover duplicidade de rota legada e alinhar testes de contrato de rotas aos paths atuais.

### Phase 2: Integridade e Seguranca Operacional
**Goal**: Operacoes criticas de faturacao e stock ficam corrigiveis com auditoria completa e acesso por perfil.
**Depends on**: Phase 1
**Requirements**: BILL-03, INT-02, INT-03
**Success Criteria** (what must be TRUE):
  1. Usuario autorizado consegue corrigir metadados de faturacao e cada alteracao fica registrada com antes/depois e responsavel.
  2. Operacoes criticas de faturacao e stock geram logs auditaveis consultaveis por periodo e tipo de evento.
  3. Usuario sem permissao adequada nao consegue criar, editar ou auditar dados criticos; usuario com perfil correto consegue.
**Plans**: 3 plans
Plans:
- [x] 02-01-PLAN.md - Definir taxonomia de eventos e criar Wave 0 de testes para auditoria e permissoes criticas (BILL-03, INT-02, INT-03).
- [x] 02-02-PLAN.md - Implementar correcao de metadados de faturacao com diff auditavel e gate por perfil em compras (BILL-03, INT-02, INT-03).
- [x] 02-03-PLAN.md - Endurecer logging/autorizacao de stock e guards de UI/rotas com consulta auditavel por periodo e tipo (INT-02, INT-03).
**UI hint**: yes

### Phase 3: Stock Integrado a Compras
**Goal**: Confirmacao de compra faturada atualiza stock automaticamente e mantem consistencia entre documentos e saldos.
**Depends on**: Phase 2
**Requirements**: STK-01, STK-02, INT-01
**Success Criteria** (what must be TRUE):
  1. Ao confirmar compra faturada, sistema cria movimento de entrada de stock automaticamente sem acao manual adicional.
  2. Usuario consegue consultar movimentos de stock com origem, data, documento e responsavel em visao operacional.
  3. Nao existe divergencia silenciosa entre dados de faturacao de compras e saldo de stock para o mesmo documento.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Lotes, Ajustes e Auditoria de Stock
**Goal**: Operacao de stock passa a ter controle por lote, ajustes governados por permissao e auditoria formal de divergencias.
**Depends on**: Phase 3
**Requirements**: STK-03, STK-04, STK-05
**Success Criteria** (what must be TRUE):
  1. Usuario consegue gerir lotes com saldo, validade e estado em tela dedicada de lotes.
  2. Usuario com permissao consegue executar ajuste de stock com motivo obrigatorio e aprovacao registrada.
  3. Usuario consegue executar auditoria de stock e emitir relatorio de divergencias para reconciliacao operacional.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Base de Dados para Producao
**Goal**: Sistema fica pronto para iniciar ordens de producao futuras com classificacao correta de itens e estrutura de dados compativel.
**Depends on**: Phase 4
**Requirements**: PRD-01, PRD-02
**Success Criteria** (what must be TRUE):
  1. Usuario consegue classificar itens como materia-prima, semiacabado e produto acabado de forma consistente.
  2. Estrutura de dados para futura ordem de producao existe e nao quebra os fluxos atuais de faturacao e stock.
  3. Dados classificados estao disponiveis para uso na proxima fase de producao sem retrabalho estrutural.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 1.1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Faturacao e Compliance de Compras | 0/TBD | Not started | - |
| 1.1. Limpeza de funcionalidades obsoletas e simplificacao de fluxos legados | 1/1 | Complete | 2026-03-24 |
| 2. Integridade e Seguranca Operacional | 3/3 | Complete | 2026-03-24 |
| 3. Stock Integrado a Compras | 0/TBD | Not started | - |
| 4. Lotes, Ajustes e Auditoria de Stock | 0/TBD | Not started | - |
| 5. Base de Dados para Producao | 0/TBD | Not started | - |

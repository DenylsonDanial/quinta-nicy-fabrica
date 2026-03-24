# Quinta Nicy Fabrica

## What This Is

Sistema de gestao da Quinta Nicy que esta a ser migrado de um modelo de loja para um modelo de fabrica. O foco imediato e estabilizar faturacao e stock para garantir operacao confiavel e rastreavel. Em seguida, o sistema evolui para cobrir producao, consumo de materia-prima e controlo industrial completo.

## Core Value

Toda entrada e saida de stock ligada a faturacao deve ser confiavel, auditavel e consistente em tempo real.

## Requirements

### Validated

- ✓ Gestao de compras com fornecedores e registro de faturas (invoice number) — existente
- ✓ Gestao de stock com movimentos, alertas, lotes e auditoria — existente
- ✓ Gestao de produtos/variantes para operacao comercial — existente
- ✓ Gestao de pedidos e vendas no contexto atual — existente
- ✓ Autenticacao, perfis, roles e controlo de permissao — existente

### Active

- [ ] Adaptar faturacao atual para fluxo de fabrica (entradas de materia-prima e rastreio documental)
- [ ] Adaptar stock para operacao fabril (lotes, consistencia, base para consumo de producao)
- [ ] Remover ou desativar funcionalidades legadas de loja que nao agregam ao contexto fabril
- [ ] Preparar base funcional para fase seguinte de producao

### Out of Scope

- Programas de fidelizacao e marketing orientados a loja — fora do foco da transicao fabril inicial
- Novos canais de venda/experiencias comerciais avancadas — prioridade menor que faturacao e stock

## Context

O projeto usa React + TypeScript + Vite com Supabase como backend (auth, database, storage). O codebase map ja foi criado em `.planning/codebase/` e mostrou pontos criticos:

- Faturacao/Compras em `src/products/components/ui/Purchases.tsx` e `src/products/services/purchaseService.ts`
- Stock em `src/products/services/stockService.ts`, `src/products/services/stockMovementService.ts` e telas de `src/products/pages/`
- Legados a reavaliar: `src/sales/pages/ShopReceipts.tsx`, `src/admin/components/CompatibilityRedirect.tsx`, `src/core/services/locationService.ts`, `src/core/services/mockData.ts`

Tambem foram gerados artefatos de transicao em `.planning/factory-transition/` com inventario funcional, matriz de transicao e backlog inicial.

## Constraints

- **Tech stack**: Manter React + TypeScript + Supabase no curto prazo — reduzir risco e acelerar entrega
- **Operacional**: Migracao progressiva sem quebrar operacao atual — continuidade do negocio
- **Qualidade**: Fluxos de faturacao e stock precisam rastreabilidade e integridade — impacto financeiro
- **Escopo**: Fase inicial limitada a faturacao e stock — evitar dispersao antes da base fabril

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Priorizar faturacao e stock antes de producao | Maior impacto operacional e financeiro imediato | — Pending |
| Reaproveitar arquitetura existente e adaptar por fases | Reduz retrabalho e acelera transicao brownfield | — Pending |
| Classificar funcionalidades atuais em manter/adaptar/descontinuar | Evita carregar legado desnecessario para o contexto fabril | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check -> still the right priority?
3. Audit Out of Scope -> reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-23 after initialization*

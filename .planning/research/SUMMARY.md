# Project Research Summary

**Project:** Quinta Nicy Fabrica  
**Domain:** Gestao fabril para PME (brownfield de loja para fabrica)  
**Researched:** 2026-03-23  
**Confidence:** MEDIUM-HIGH

## Executive Summary

Quinta Nicy Fabrica e um produto de transicao operacional: sair de um contexto de loja para um fluxo fabril sem replatform. A abordagem validada por pesquisa e manter React + TypeScript + Supabase/Postgres, mas transferir logica critica de negocio para RPC SQL transacionais, com Postgres como fonte unica da verdade para faturacao, stock e, na fase seguinte, producao.

No curto prazo, a prioridade executavel deve ser faturacao e stock com consistencia contabilistica e rastreabilidade minima por lote. Isso inclui cadastro mestre, emissao de faturas/notas de credito com auditoria, movimentos de stock por armazem e regras de custeio/COGS alinhadas ao razao geral. A fase seguinte deve ativar producao minima viavel (BOM, ordens, consumo, output e encerramento atomico), reutilizando os mesmos pilares de consistencia.

Os maiores riscos sao divergencia entre stock e financeiro, quebra de rastreabilidade de lotes e fiscalidade tratada tarde. Mitigacoes recomendadas: matriz de posting e reconciliacao diaria no go-live, bloqueio de transacoes sem tracking completo, UAT fiscal com cenarios reais antes de liberar faturacao em producao, e politica de cutover sem backdating apos freeze.

## Key Findings

### Recommended Stack

A stack recomendada e evolutiva, nao disruptiva: manter frontend atual e endurecer backend de dados. O foco e reduzir risco operacional por meio de transacoes atomicas, seguranca por RLS e leitura otimizada para operacao diaria.

**Core technologies:**
- **React 19 + TypeScript:** camada de UI e fluxos operacionais — manter para velocidade de entrega sem reescrita.
- **Supabase Postgres + RPC SQL:** motor transacional de negocio — centraliza regras criticas (faturacao, stock, consumo/encerramento de producao) com atomicidade.
- **RLS por dominio/papel:** seguranca e segregacao operacional — reduz risco de alteracao indevida.
- **TanStack Query (incremental):** estado de servidor no frontend — melhora cache/invalidation e previsibilidade de dados.
- **Supabase Realtime (seletivo):** atualizacao operacional de telas — usar apenas para notificacoes de alto valor.
- **Supabase Queues/pgmq (pontual):** jobs assincronos — desacopla tarefas pesadas de fluxo interativo.

### Expected Features

Pesquisa converge para MVP com table stakes de faturacao e stock, seguido por producao enxuta. Diferenciadores devem entrar apos estabilidade de dados e processo.

**Must have (table stakes):**
- Cadastro mestre: clientes, produtos, armazens, precos.
- Faturacao completa: faturas, notas de credito, estados e auditoria.
- Stock por armazem/localizacao com movimentos e ajustes controlados.
- Custeio de stock + COGS automatico (inventario perpetuo).
- Compras ligadas ao stock (pedido -> rececao -> atualizacao de custo/saldo).
- Alertas min/max e relatorios operacionais basicos.
- Rastreabilidade por lote em itens criticos.

**Should have (competitive):**
- Margem em tempo real por documento.
- Cockpit unico de faturacao + stock + producao.
- Reposicao orientada por consumo.
- Apontamento simplificado de producao por tablet.

**Defer (v2+):**
- APS/MRP avancado com otimizacao complexa.
- Motor de customizacao ilimitada no MVP.
- BI enterprise antes da estabilizacao de dados.
- Microservicos precoces.

### Architecture Approach

A arquitetura indicada e **modular monolith orientado a dominio**, com fronteiras claras entre `sales_billing`, `inventory_core`, `production_execution`, `bom_routing`, `ledger_costing`, `traceability`, `quality_checks` e `analytics`. Padrao obrigatorio para fluxos criticos: escrita via RPC transacional unica; eventos internos em `domain_events`; RLS por papel/unidade; views/materialized views para leitura pesada.

**Major components:**
1. **sales_billing** — documentos comerciais/fiscais e estados.
2. **inventory_core** — movimentos, saldos, ajustes, auditoria.
3. **production_execution** — ordens, consumo, output e encerramento.
4. **ledger_costing** — custo real/padrao, COGS e reconciliacao.
5. **traceability** — genealogia lote a lote ponta a ponta.

### Critical Pitfalls

1. **Quebra de reconciliacao stock x G/L** — prevenir com matriz de posting validada, rotina de ajuste de custo antes de posting e checkpoint diario no go-live.
2. **Rastreabilidade de lote incompleta** — bloquear transacoes sem tracking completo, carga inicial por lote com reconciliacao fisica assinada.
3. **Fiscalidade tratada tarde** — incluir compliance fiscal desde o desenho de faturacao, executar UAT por cenarios reais.
4. **Cutover com backdating/periodos abertos** — aplicar freeze, governar excecoes com aprovacao e bloquear edicoes em periodo fechado.
5. **Ativar producao sem baseline de stock/custo** — exigir gate de qualidade de dados antes do piloto de producao.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Faturacao e Compliance Primeiro
**Rationale:** risco fiscal/comercial bloqueia operacao e gera retrabalho imediato se deixado para depois.  
**Delivers:** cadastro mestre, fatura/nota de credito, estados e auditoria, regras fiscais validadas em UAT.  
**Addresses:** table stakes de faturacao e conformidade documental.  
**Avoids:** pitfall de fiscalidade tardia e alta taxa de correcao de faturas.

### Phase 2: Stock Confiavel e Custeio Basico
**Rationale:** producao e margem dependem de stock e custo consistentes.  
**Delivers:** movimentos por armazem/lote, inventario perpetuo, compras integradas, min/max, reconciliacao diaria com financeiro.  
**Uses:** Supabase Postgres + RPC + RLS + views para leitura operacional.  
**Implements:** `inventory_core` + base de `ledger_costing` + `traceability` minima.

### Phase 3: Producao MVP (Fase Seguinte)
**Rationale:** somente apos baseline confiavel de faturacao/stock para evitar variancia e custo distorcido.  
**Delivers:** BOM basica, ordens de producao, consumo por lote, entrada de acabado, encerramento atomico, apontamento simples.  
**Addresses:** inicio de `production_execution` com rastreabilidade funcional.  
**Avoids:** pitfall de consumo sem lote e custo instavel em WIP.

### Phase 4: Custo Industrial e Rastreabilidade End-to-End
**Rationale:** consolidar governanca financeira-operacional apos estabilizar execucao.  
**Delivers:** custo real por ordem/lote, conciliacao periodica COGS, genealogia completa compra -> producao -> venda, KPIs executivos.

### Phase Ordering Rationale

- Dependencias fortes: faturacao/compliance -> stock/custo -> producao -> rastreabilidade/custos avancados.
- Agrupamento por dominio reduz acoplamento e facilita rollout gradual no brownfield.
- Ordem proposta minimiza os riscos criticos mapeados (fiscalidade, reconciliacao, lotes e cutover).

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Producao MVP):** modelagem de BOM/roteiro, regras de consumo por lote e integracao com qualidade.
- **Phase 4 (Custo/Rastreabilidade E2E):** estrategia de custo real (material, mao de obra, overhead) e janelas de fecho.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Faturacao/Compliance):** padroes maduros e amplamente documentados.
- **Phase 2 (Stock/Custeio basico):** praticas consolidadas para inventario perpetuo, RLS e reconciliacao operacional.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Baseado em docs oficiais Supabase/React e aderencia direta ao contexto brownfield atual. |
| Features | HIGH | Table stakes convergentes em documentacao de ERPs fabris (Odoo/ERPNext) e pratica recorrente. |
| Architecture | MEDIUM-HIGH | Padrao robusto e pragmatico; detalhes de BOM/execucao precisam ajuste ao processo real da fabrica. |
| Pitfalls | MEDIUM-HIGH | Riscos centrais suportados por fontes oficiais e experiencia de migracao; metricas de mercado sao menos fortes. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Requisitos fiscais locais detalhados:** validar matriz fiscal por tipo de documento e cenarios reais com responsavel fiscal.
- **Volume real de dados e SLOs:** confirmar estrategia de indices, refresh de materialized views e jobs de fecho.
- **Modelo de custo industrial final:** definir politica oficial de rateio e tratamento de variancias antes da escala de producao.
- **Governanca de dados mestres:** formalizar dicionario e fluxo de aprovacao para itens, UMs, lotes e classificacoes.

## Sources

### Primary (HIGH confidence)
- Supabase docs (RLS, RPC/functions, triggers, realtime, queues) — seguranca, transacao e operacao backend.
- React docs — padroes oficiais de UI e composicao.
- Microsoft Learn (inventory posting, reconcile inventory x G/L, item tracking) — reconciliacao e rastreabilidade.
- Odoo/ERPNext documentation — table stakes funcionais de faturacao, stock e manufatura.

### Secondary (MEDIUM confidence)
- ISA-95 / OPC references — separacao conceitual ERP-MES e fronteiras de dominio.
- NetSuite docs (cost recalculation behavior) — reforco de risco em ajustes retroativos.
- Vertex / Innovate Tax — riscos de compliance fiscal em migracoes ERP.

### Tertiary (LOW confidence)
- Artigos de mercado e blogs de implementacao ERP 2026 — sinais de tendencia e anti-patterns, requerem validacao local.

---
*Research completed: 2026-03-23*  
*Ready for roadmap: yes*

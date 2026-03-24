# Technology Stack (2026) - Quinta Nicy Fabrica

**Projeto:** Quinta Nicy Fabrica (brownfield, migracao loja -> fabrica)  
**Foco:** evoluir faturacao + stock + producao sem trocar a base React + TypeScript + Supabase no curto prazo  
**Data:** 2026-03-23

## Direcao Recomendada

Manter a base atual e fortalecer consistencia transacional no backend (Postgres/Supabase), com frontend mais previsivel para estado de servidor. A estrategia de menor risco para 2026 e:

1. Consolidar regras criticas (faturacao, movimentos de stock, consumo de producao) em **funcoes SQL/RPC**.
2. Tratar **Postgres como fonte unica da verdade** (ledger de movimentos + saldos derivados), evitando logica de negocio critica no cliente.
3. Adotar incrementalmente bibliotecas que reduzem complexidade operacional (ex.: cache/sincronizacao de dados no frontend), sem replatform.

## Manter (curto prazo, alta prioridade)

| Item | Manter? | Motivo pratico | Confianca |
|---|---|---|---|
| React 19 + TypeScript | Sim | Base moderna, produtiva e ja operacional no projeto; evita custo/risco de reescrita | **HIGH** |
| Supabase (Postgres + Auth + RLS) | Sim | Mantem velocidade de entrega e permite governanca de dados sensiveis com politicas por linha | **HIGH** |
| Vite + Vitest | Sim | Fluxo rapido para iteracao e testes sem friccao de tooling | **HIGH** |
| Modelo orientado a servicos no frontend atual | Sim (com ajuste) | Preservar estrutura existente, movendo apenas regras criticas para RPC no backend | **MEDIUM** |

## Adotar Agora (incremental, sem trocar base)

| Recomendacao | Onde aplicar | Ganho esperado | Evitar |
|---|---|---|---|
| **RPC/Functions SQL para transacoes de negocio** | Fecho de fatura, entrada de stock, consumo de materia-prima, estorno/correcao | Atomicidade e auditoria consistentes; menos divergencia entre telas e base | Fluxos multi-etapa gravados direto do cliente em varias tabelas |
| **RLS por dominio (faturacao/stock/producao) + papeis** | Tabelas de compras, lotes, movimentos, ordens | Seguranca e segregacao operacional por perfil | Regras de permissao apenas no frontend |
| **Ledger de stock (append-only) + saldo materializado** | `stock_movements` como historico imutavel; saldo consultavel por visao/tabela derivada | Rastreabilidade fiscal/operacional e reconciliacao confiavel | Atualizar saldo final manualmente sem trilha completa |
| **TanStack Query para server state** | Leitura/listagens/consultas operacionais (stock atual, lotes, ordens) | Cache, deduplicacao, invalidacao previsivel e UX mais rapida | `useEffect` + estado local espalhado para dados remotos |
| **Supabase Realtime seletivo** | Alertas operacionais (ex.: ruptura de stock, ordem concluida) | Atualizacao em tempo real onde gera valor claro | Realtime em massa para todas as tabelas/telas |
| **Filas para tarefas assincronas (Supabase Queues/pgmq)** | Emissao de docs, reconciliacoes, jobs de fechamento | Resiliencia e retries sem travar fluxo principal | Processamento pesado no clique do utilizador |

### Confianca por recomendacao

| Recomendacao | Confianca | Justificativa |
|---|---|---|
| RPC/Functions SQL para operacoes intensivas de dados | **HIGH** | Alinhado com orientacao oficial do Supabase para operacoes data-intensive |
| RLS por dominio e papeis | **HIGH** | RLS e pratica central documentada no Supabase/Postgres |
| Ledger de stock + saldos derivados | **MEDIUM** | Padrao robusto em sistemas de inventario/contabilidade; validar volume real e indices na fase |
| TanStack Query para estado de servidor | **MEDIUM** | Padrao consolidado no ecossistema React para server state; adocao incremental recomendada |
| Realtime seletivo | **HIGH** | Suporte oficial e maduro; risco baixo quando usado pontualmente |
| Filas com Supabase Queues | **MEDIUM** | Recurso oficial e aderente a background tasks; requer validacao de throughput e operacao no contexto real |

## O que Evitar (para nao travar a migracao)

| Evitar | Por que prejudica | Alternativa recomendada | Confianca |
|---|---|---|---|
| Reescrever stack (ex.: trocar React/Supabase agora) | Aumenta prazo, risco de regressao e custo de transicao | Evolucao incremental da base atual | **HIGH** |
| Logica critica de faturacao/stock no frontend | Inconsistencias, concorrencia e menor auditabilidade | Encapsular em funcoes SQL/RPC transacionais | **HIGH** |
| Triggers excessivos e opacos para toda regra | Dificulta depuracao e manutencao | Usar trigger apenas para invariantes simples; regra de negocio principal em RPC | **MEDIUM** |
| `security definer` sem `search_path` controlado | Risco de seguranca e comportamento inesperado | Preferir `security invoker`; se definer, fixar `search_path` vazio e schema explicito | **HIGH** |
| Realtime indiscriminado | Custo e complexidade desnecessarios | Realtime apenas em eventos de alto valor operacional | **HIGH** |
| Big-bang de event sourcing completo | Alto risco em brownfield e curva operacional | Comecar com ledger de movimentos + projecoes/saldos | **MEDIUM** |

## Stack-Alvo Recomendada (12 meses, sem replatform)

### Core

| Camada | Tecnologia | Decisao | Confianca |
|---|---|---|---|
| Frontend | React 19 + TypeScript | **Manter** | **HIGH** |
| Data Access | `@supabase/supabase-js` + RPC | **Manter e reforcar** | **HIGH** |
| Banco | Supabase Postgres | **Manter como source of truth** | **HIGH** |
| Seguranca | RLS + papeis por dominio | **Expandir** | **HIGH** |
| Server State UI | TanStack Query | **Adicionar incrementalmente** | **MEDIUM** |
| Async Jobs | Supabase Queues (pgmq) | **Introduzir onde houver gargalo** | **MEDIUM** |
| Tempo real | Supabase Realtime | **Uso seletivo** | **HIGH** |

## Plano Pratico de Adocao (sem ruptura)

1. **Sprint 1-2:** mapear operacoes criticas e migrar 2-3 fluxos para RPC (entrada por fatura, ajuste de stock, consumo de producao).
2. **Sprint 2-3:** endurecer RLS por dominio e revisar permissoes de funcoes.
3. **Sprint 3-4:** introduzir TanStack Query nas telas de maior volume de leitura.
4. **Sprint 4+:** mover rotinas pesadas para fila (reconciliacao, documentos, fechamentos).

## Pacotes Recomendados (incrementais)

```bash
npm install @tanstack/react-query
```

Opcional (somente se surgir dor de validacao tipada de formularios/entrada):

```bash
npm install zod
```

## Fontes

- Supabase - Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase - Database Functions (inclui recomendacao Functions vs Edge Functions): https://supabase.com/docs/guides/database/functions
- Supabase - Triggers: https://supabase.com/docs/guides/database/postgres/triggers
- Supabase - Realtime Postgres Changes: https://supabase.com/docs/guides/realtime/postgres-changes
- Supabase - Queues (pgmq): https://supabase.com/docs/guides/queues
- TanStack Query (React) Overview: https://tanstack.com/query/latest/docs/framework/react/overview
- React Docs: https://react.dev/learn

## Confianca Geral

**MEDIUM-HIGH** — Direcao principal e forte (React+TS+Supabase + RPC + RLS) com alta confianca; itens de operacao em escala (queues, desenho final de ledger/projecoes) exigem validacao de volume real e SLOs durante as fases de implementacao.

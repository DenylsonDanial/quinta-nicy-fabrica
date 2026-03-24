# Architecture Patterns

**Domínio:** Evolução de loja para fábrica (brownfield React + Supabase)  
**Projeto:** Quinta Nicy Fabrica  
**Pesquisado em:** 2026-03-23

## Arquitetura Recomendada

Recomendação: **modular monolith orientado a domínio**, com React no frontend e Supabase/Postgres como backend transacional, evoluindo por capacidades de negócio (não por tecnologia).  
Motivo: o sistema já existe, já tem serviços por domínio e precisa ganhar robustez operacional sem custo de coordenação de microserviços.

Referência de organização funcional: separar claramente **nível de planeamento comercial/financeiro** de **nível de execução fabril** (alinhado ao modelo ERP-MES do ISA-95), mantendo integração por eventos e tabelas de integração.

## Componentes e Fronteiras

| Componente | Responsabilidade | Comunica com |
|-----------|-------------------|--------------|
| `sales_billing` | Faturas, notas de crédito, documentos comerciais, estado fiscal | `inventory_core`, `ledger_costing`, `traceability` |
| `inventory_core` | Movimentos, saldo por variante/lote/local, ajustes e auditoria | `sales_billing`, `production_execution`, `traceability`, `analytics` |
| `production_execution` | Ordens de produção, operações, consumo de matéria-prima, produção de acabados | `inventory_core`, `bom_routing`, `quality_checks`, `traceability` |
| `bom_routing` | BOM, versões de receita, roteiros e parâmetros de operação | `production_execution`, `ledger_costing` |
| `ledger_costing` | Custo padrão e real (material, mão de obra, overhead), variações e COGS | `inventory_core`, `production_execution`, `sales_billing`, `analytics` |
| `traceability` | Genealogia lote->lote/serial, histórico de transformações e vínculos documentais | Todos os componentes operacionais |
| `quality_checks` | Inspeções de entrada/processo/saída e bloqueio/liberação de lote | `production_execution`, `inventory_core`, `traceability` |
| `analytics` | Views/materialized views para KPIs operacionais e financeiros | Leitura de todos os componentes |

## Fluxo de Dados (Trilha Evolutiva)

### Fase 1 - Faturação + Stock

1. Utilizador confirma compra/venda na UI React.
2. Serviço de domínio chama **RPC transacional** no Postgres (Supabase `rpc`) para gravar documento e movimentos no mesmo ciclo de consistência.
3. Trigger `AFTER` grava evento em tabela `domain_events` e registra trilha de auditoria.
4. `inventory_core` atualiza saldo por variante/lote e histórico de transações.
5. Realtime é usado apenas para atualização de UI operacional (não para lógica crítica).

### Fase 2 - Produção

1. Planeamento cria ordem de produção (`production_order`) com BOM e versão de roteiro.
2. Execução aponta consumo por lote de matéria-prima.
3. RPC de encerramento de operação faz baixa de componentes e entrada de produto acabado de forma atómica.
4. `traceability` registra relação de genealogia: lotes de entrada -> lote(s) produzido(s).
5. `quality_checks` pode bloquear lote e impedir expedição até liberação.

### Fase 3 - Custos + Rastreabilidade End-to-End

1. `ledger_costing` calcula custo real por lote/ordem (material consumido + operação + overhead).
2. Fecho periódico reconcilia stock, COGS e variações de produção.
3. `traceability` expõe consulta completa: compra de MP -> produção -> venda/expedição.
4. `analytics` consolida KPIs: rendimento, perdas, margem por lote e desvios de custo.

## Padrões de Implementação

### 1) Escrita transacional via RPC (obrigatório para fluxos críticos)
**O que:** operações críticas (faturar, consumir stock, fechar OP) devem ocorrer em função SQL/PLpgSQL única.  
**Porquê:** evita inconsistência de múltiplas chamadas cliente->API em sequência.

### 2) Eventos internos via tabela `domain_events`
**O que:** após commit transacional, registrar evento de domínio (`invoice_posted`, `stock_moved`, `production_closed`).  
**Porquê:** desacopla integrações e permite reprocessamento/auditoria.

### 3) RLS por papel e unidade operacional
**O que:** políticas Supabase por perfil (`financeiro`, `stock`, `producao`, `qualidade`, `admin`) e escopo de unidade/armazém.  
**Porquê:** segurança operacional e redução de risco de alteração indevida.

### 4) Views para leitura e materialized views para KPI pesado
**O que:** leitura de painéis por `view`; agregações históricas pesadas por `materialized view` com refresh controlado.  
**Porquê:** melhora performance sem degradar escrita transacional.

## Anti-Patterns a Evitar

### 1) Orquestração crítica no frontend
Executar passos de faturação/stock/producão em cadeia no cliente aumenta risco de estado parcial.

### 2) Ajuste manual recorrente para "corrigir" fluxo
Se ajuste vira rotina, falta regra transacional ou validação de processo.

### 3) Microserviços prematuros
Neste contexto brownfield, aumenta custo operacional antes de estabilizar domínio e dados.

## Ordem de Implementação Recomendada

1. **Hardening da Fase 1 (faturação + stock)**
   - Consolidar escrita crítica em RPC transacionais.
   - Padronizar `source_reference` e `document_id` em todos os movimentos.
   - Criar `domain_events` + trilha de auditoria mínima.

2. **Introduzir Produção mínima viável**
   - Tabelas: `bom`, `bom_item`, `production_order`, `production_operation`, `production_consumption`, `production_output`.
   - Fluxo: abrir OP -> consumir -> produzir -> encerrar com validações.
   - Bloqueio de lote por qualidade quando necessário.

3. **Custos industriais**
   - Modelo de custo por ordem/lote e reconciliação com COGS.
   - Fecho periódico com relatórios de variação.

4. **Rastreabilidade completa**
   - Genealogia lote a lote em toda transformação.
   - Consulta única de trilha documental (compra -> produção -> venda).

5. **Escala e governança**
   - Materialized views e painéis executivos.
   - SLOs de consistência e monitorização de divergências.

## Riscos e Mitigações por Etapa

| Etapa | Risco principal | Mitigação |
|------|------------------|-----------|
| Faturação+stock | Divergência entre documento e saldo | RPC única + constraints + auditoria |
| Produção | Consumo sem vínculo de lote | Consumo obrigatório com lote e validação de disponibilidade |
| Custos | Cálculo inconsistente por regra difusa | Motor de custo único com versionamento de regras |
| Rastreabilidade | Quebra da cadeia de genealogia | Relações explícitas `input_lot_id -> output_lot_id` e testes de integridade |

## Nível de confiança

- Modelo arquitetural geral (modular monolith + domínio): **HIGH**  
- Padrões Supabase (RLS, RPC, triggers, Realtime): **HIGH**  
- Mapeamento ERP-MES para trilha proposta: **MEDIUM** (boa aderência conceitual, precisa ajuste fino com processo real da fábrica)

## Fontes

- Supabase - Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security  
- Supabase - Postgres Changes (Realtime): https://supabase.com/docs/guides/realtime/postgres-changes  
- Supabase - Database Functions (RPC): https://supabase.com/docs/guides/database/functions  
- Supabase - Postgres Triggers: https://supabase.com/docs/guides/database/postgres/triggers  
- Supabase - Tables, Views e Materialized Views: https://supabase.com/docs/guides/database/tables  
- ISA - ISA-95 Standard overview: https://www.isa.org/standards-and-publications/isa-standards/isa-95-standard  
- OPC Foundation - ISA-95 reference model: https://reference.opcfoundation.org/ISA-95/v100/docs/4.2.3

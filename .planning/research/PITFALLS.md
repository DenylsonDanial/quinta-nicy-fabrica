# Domain Pitfalls

**Domain:** Migracao de ERP de loja para gestao fabril (brownfield)  
**Researched:** 2026-03-23  
**Scope:** Quinta Nicy Fabrica - prioridade em faturacao e stock, depois producao

## Critical Pitfalls

### Pitfall 1: Quebra de reconciliacao entre stock e razao geral (G/L)
**What goes wrong:** Movimentos de stock sao registados, mas custo/valor nao e reconciliado com contabilizacao financeira.  
**Why it happens:** Configuracao incompleta de posting groups, execucao incorreta de ajuste de custo antes de postar no G/L, ou dependencias de dimensoes com erro.  
**Consequences:** COGS errado, margem distorcida, fecho contabilistico atrasado e retrabalho financeiro.  
**Warning signs:**  
- Diferencas recorrentes entre valor de inventario e contas de inventario no G/L  
- Entradas "skipped" em jobs de reconciliacao/posting  
- Equipas financeiras a fazer conciliacoes manuais frequentes  
**Prevention:**  
- Definir e validar matriz de posting (produto x local x tipo de movimento) antes do cutover  
- Rodar rotina de ajuste de custo antes de rotina de posting para G/L em ambiente de teste e em producao  
- Criar checkpoint diario de reconciliacao no go-live + primeiras semanas

### Pitfall 2: Rastreabilidade de lote incompleta na transicao
**What goes wrong:** Entradas, transferencias e saidas nao preservam consistencia de lote; lotes ficam "quebrados" entre compra, stock e consumo.  
**Why it happens:** Dados mestres e saldos iniciais entram sem tracking completo; utilizadores alteram quantidades sem disciplina de lotes; regras de validacao fracas.  
**Consequences:** Perda de rastreabilidade, risco de nao conformidade, dificuldade de recall e erros no consumo de producao.  
**Warning signs:**  
- Linhas com quantidade "undefined" ou divergente entre documento e tracking  
- Aumento de ajustes manuais em lotes apos rececao/transferencia  
- Divergencia frequente entre saldo fisico por lote e saldo de sistema  
**Prevention:**  
- Fazer carga inicial de stock por lote com reconciliacao fisica assinada  
- Bloquear transacoes criticas sem tracking completo (entrada, transferencia, consumo, expedicao)  
- Implementar rotina ciclica de contagem por lotes de alto giro

### Pitfall 3: Fiscalidade/faturacao tratada tarde no projeto
**What goes wrong:** Processo "tecnicamente funcional" em compras/vendas, mas com regras fiscais incompletas para documentos, impostos e compliance.  
**Why it happens:** Projeto foca fluxo operacional e adia requisitos fiscais para depois do go-live.  
**Consequences:** Erros de faturacao, risco de auditoria, notas de credito/correcao em volume elevado.  
**Warning signs:**  
- Alta taxa de correcao de faturas nas primeiras semanas  
- Campos fiscais obrigatorios preenchidos manualmente fora do fluxo  
- Diferenca entre regra fiscal esperada e aplicada em documentos similares  
**Prevention:**  
- Incluir fiscalidade no desenho inicial de order-to-cash e procure-to-pay  
- Validar amostras de faturas/entradas por cenarios reais antes do go-live  
- Definir dono funcional de compliance fiscal no steering da migracao

### Pitfall 4: Cutover com alteracoes retroativas e periodos mal controlados
**What goes wrong:** Alteracoes retroativas em movimentos de inventario durante/apos cutover geram recalculo pesado de custo e inconsistencias em fecho de periodo.  
**Why it happens:** Janela de corte mal governada; permissoes permitem editar transacoes historicas sem controlo.  
**Consequences:** Relatorios instaveis, performance degradada, erros de custo em cadeia.  
**Warning signs:**  
- Recalculos longos apos pequenas correcoes historicas  
- Fecho de periodo com jobs de custo ainda em execucao  
- Relatorios mudam dias depois de publicados  
**Prevention:**  
- Politica de "no backdating" apos freeze, salvo aprovacao formal  
- Congelar edicao de periodos fechados e trilhar excecoes com aprovacao  
- Ensaiar cutover com dados reais e medir tempo de recalculo/fecho

## Moderate Pitfalls

### Pitfall 1: Migrar processos de loja sem simplificacao para fabrica
**What goes wrong:** ERP novo replica workarounds de loja e adiciona customizacao desnecessaria.  
**Prevention:** Modelar processo alvo fabril primeiro e customizar apenas onde ha ganho claro.

### Pitfall 2: Master data sem governanca industrial
**What goes wrong:** Itens, UMs e classificacoes (materia-prima, semiacabado, acabado) ficam ambiguos.  
**Prevention:** Definir dicionario de dados fabril e regras de criacao/aprovacao antes da migracao em massa.

### Pitfall 3: Integracoes de fronteira esquecidas no cutover
**What goes wrong:** Integracoes (ex.: EDI, balancas, WMS, faturacao externa) quebram ao trocar IDs/campos.  
**Prevention:** Mapear dependencias ponta a ponta e executar testes de regressao de integracao com parceiros.

## Minor Pitfalls

### Pitfall 1: Treino insuficiente em excecoes operacionais
**What goes wrong:** Equipa sabe fluxo feliz, mas nao sabe tratar rejeicoes, ajustes e devolucoes.  
**Prevention:** Treino com cenarios de excecao e runbooks de suporte rapido no piso.

### Pitfall 2: KPIs sem baseline pre-migracao
**What goes wrong:** Nao se prova se migracao melhorou ou piorou operacao.  
**Prevention:** Congelar baseline (acuracia stock, tempo de fecho, taxa de correcao de fatura) antes do go-live.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Warning Signs | Mitigation |
|-------------|----------------|---------------|------------|
| Faturacao (compras e vendas) | Regra fiscal incompleta por tipo de documento | Correcao frequente de faturas, divergencias entre cenarios semelhantes | UAT fiscal por cenarios reais + validacao com financeiro/fiscal antes de go-live |
| Stock (entrada, transferencia, ajuste) | Divergencia entre saldo fisico e sistema | Aumento de ajustes manuais, perda de confianca no saldo | Contagem ciclica por criticidade + bloqueios de transacao sem tracking |
| Cutover financeiro | Reconciliacao incompleta G/L x inventario | Entradas "skipped", diferenca persistente nos relat. | Checklist de posting + reconciliacao diaria no hypercare |
| Preparacao para producao | BOM e consumo sem base de dados confiavel | Variancia de consumo alta, ordens sem rastreio de lote | Gate de qualidade de dados antes de ativar ordens fabris |
| Producao inicial | Custo de WIP/produto acabado distorcido | COGS instavel, margem oscila sem causa operacional | Piloto com poucas familias, reconciliacao de custo por ordem |

## Sequencia recomendada para reduzir risco

1. **Faturacao + compliance documental/fiscal** com testes por cenario real.  
2. **Stock + rastreabilidade de lotes** com reconciliacao diaria no go-live.  
3. **Producao piloto (limitada)** so apos baseline confiavel de stock e custo.  
4. **Escala de producao** depois de estabilizar variancia de consumo e custo.

## Confidence Notes

- **HIGH:** Riscos de reconciliacao de inventario/custo e regras de tracking por lote (documentacao oficial Microsoft/Oracle).  
- **MEDIUM:** Riscos de fiscalidade e desenho organizacional (fontes especializadas de tax/ERP e convergencia com pratica de mercado).  
- **LOW-MEDIUM:** Estatisticas agregadas de falha de migracao e percentuais reportados por fornecedores/consultorias (usar como indicativo, nao como metrica oficial do projeto).

## Sources

- Microsoft Learn - Design details: Inventory posting (updated 2026-03-17): https://learn.microsoft.com/en-us/dynamics365/business-central/design-details-inventory-posting  
- Microsoft Learn - Reconcile inventory costs with the general ledger (updated 2024-10-03): https://learn.microsoft.com/en-ca/dynamics365/business-central/finance-how-to-post-inventory-costs-to-the-general-ledger  
- Microsoft Learn - Track items with serial, lot, and package numbers (updated 2025-08-21): https://learn.microsoft.com/en-us/dynamics365/business-central/inventory-how-work-item-tracking  
- Oracle NetSuite Docs - Inventory costing recalculations on inventory adjustments: https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/bridgehead_N2198841.html  
- Vertex (2025) - Tax involvement in ERP implementations: https://www.vertexinc.com/resources/resource-library/how-leading-tax-groups-influence-erp-implementations  
- Innovate Tax (2026) - Indirect tax challenges in ERP migrations: https://innovatetax.com/blog/the-biggest-indirect-tax-challenges-of-erp-migrations-in-2026/  
- Orderful ERP migration checklist (contexto de integracao e cutover): https://www.orderful.com/blog/how-to-prepare-for-erp-migration

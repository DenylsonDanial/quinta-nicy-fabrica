# Feature Landscape

**Domínio:** Software de gestão fabril (PME industrial, contexto brownfield)  
**Projeto:** Quinta Nicy Fabrica  
**Foco inicial:** Faturação e stock  
**Fase seguinte:** Produção  
**Pesquisado em:** 2026-03-23

## Table Stakes

Funcionalidades que o utilizador espera de imediato. Se faltarem, o produto parece incompleto.

| Feature | Porque é esperada | Complexidade | Notas |
|---------|-------------------|--------------|-------|
| Cadastro de clientes, produtos e tabelas de preço | Base para qualquer faturação | Baixa | Deve suportar diferentes tipos de produto (matéria-prima, semiacabado, acabado). |
| Emissão de faturas e notas de crédito | Núcleo de conformidade comercial e financeira | Média | Incluir numeração, estado (rascunho/final), e trilha de auditoria. |
| Gestão de stock por armazém/localização | Essencial para saber disponibilidade real | Média | Inventário em tempo real com movimentos de entrada/saída/ajuste. |
| Custeio de stock e COGS automático | Evita divergência entre stock e contabilidade | Média | Priorizar inventário perpétuo com lançamentos automáticos. |
| Reposição mínima e alertas de ruptura | Reduz paragens por falta de material | Média | Regras min/max por item e armazém. |
| Compras ligadas ao stock | Fluxo operacional mínimo de fábrica | Média | Pedido de compra -> receção -> atualização de stock e custo. |
| Rastreabilidade por lote/serial (onde aplicável) | Expectativa em produção com controlo de qualidade | Média | Começar por lotes em itens críticos; serial em segunda vaga se necessário. |
| Relatórios operacionais básicos | Necessário para decisão diária | Baixa | Vendas/faturação, rotação de stock, stock parado, margem bruta por item. |

## Diferenciadores

Funcionalidades que aumentam valor percebido e eficiência, mas não são pré-requisito para o arranque.

| Feature | Proposta de valor | Complexidade | Notas |
|---------|-------------------|--------------|-------|
| Margem em tempo real por documento (fatura/encomenda) | Evita vender com margem negativa | Média | Cruza preço de venda com custo atual/último custo. |
| Sugestão de reposição orientada por consumo | Melhora capital de giro | Média | Evoluir de min/max fixo para heurística com histórico. |
| Cockpit operacional único (faturação + stock + produção) | Reduz alternância entre ecrãs e erros | Média | Dashboards por perfil: direção, compras, chão de fábrica. |
| Reservas inteligentes de stock por prioridade de cliente/pedido | Menos conflito entre vendas e produção | Alta | Regra clara de prioridade e override manual auditável. |
| Apontamento de produção simplificado por tablet | Adoção no chão de fábrica com baixa fricção | Média | Preparar terreno para a fase de produção sem sobrecarregar MVP. |
| KPIs de eficiência fabril conectados ao impacto financeiro | Liga operação à rentabilidade | Alta | Ex.: OEE simplificado + custo por ordem. |

## Anti-Features

Funcionalidades para evitar no início porque aumentam risco, prazo e custo sem retorno proporcional.

| Anti-Feature | Porque evitar | O que fazer em vez disso |
|--------------|---------------|---------------------------|
| Motor de customização ilimitada no MVP | Gera dívida técnica e implantações frágeis | Parametrização controlada com catálogo de regras aprovadas. |
| Planeamento avançado APS/MRP com otimização complexa logo de início | Alto esforço de dados mestres e baixa maturidade inicial | MRP básico/reposição por regras simples e revisão humana. |
| Microserviços desde o dia 1 | Complexidade operacional desnecessária para escopo inicial | Modular monolito com fronteiras de domínio claras. |
| Automação total de exceções sem validação humana | Risco financeiro e operacional | Fluxos automáticos com checkpoints de aprovação. |
| BI enterprise completo antes do processo estabilizar | Relatórios sofisticados sobre dados inconsistentes | KPIs operacionais curtos e governança de dados primeiro. |

## Dependências de Features

Cadastro de produtos/clientes -> Faturação  
Cadastro de produtos/armazéns -> Movimentos de stock  
Movimentos de stock + custeio -> Margem por fatura  
Stock fiável + compras -> Reposição sugerida  
Stock fiável + BOM/roteiro -> Produção (fase seguinte)  
Produção apontada -> Custo real de produção -> Margem avançada

## Recomendação de MVP

Priorizar (Fase 1 - faturação + stock):
1. Cadastro mestre (clientes, produtos, armazéns, preços)
2. Faturação completa (fatura, nota de crédito, estados, auditoria)
3. Stock operacional (movimentos, inventário perpétuo, alertas min/max, compras básicas)

Fase 2 (produção):
1. BOM e ordens de produção básicas
2. Consumo de matéria-prima e entrada de produto acabado
3. Apontamento simples de produção e custo real por ordem

Deferir:
- APS avançado e automações complexas: só após 2-3 ciclos mensais com dados confiáveis
- Customizações profundas por cliente interno: apenas após estabilização de processo

## Fontes

- Odoo Manufacturing docs (work orders, BOM, shop floor): https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/manufacturing.html  
- Odoo Invoicing processes: https://www.odoo.com/documentation/15.0/applications/finance/accounting/customer_invoices/overview.html  
- ERPNext Manufacturing docs: https://docs.frappe.io/erpnext/user/manual/en/manufacturing  
- ERPNext Sales Invoice: https://docs.erpnext.com/docs/user/manual/en/sales-invoice  
- ERPNext stock accounting/perpetual inventory: https://docs.erpnext.com/docs/user/manual/en/accounting-of-inventory-stock  
- Industry guidance 2026 (market view, lower confidence than docs):  
  - https://bizowie.com/top-erp-features-every-manufacturer-needs-in-2026  
  - https://www.sabrelimited.com/blogs/manufacturing-erp/  
  - https://www.mrpeasy.com/blog/erp-implementation-mistakes/

## Nível de confiança por bloco

- Table stakes: **HIGH** (consenso entre documentação de ERPs fabris e prática de implementação)
- Diferenciadores: **MEDIUM** (parte suportada por prática de mercado e parte contextual ao projeto)
- Anti-features: **MEDIUM** (baseado em padrões recorrentes de falha em implementação ERP)

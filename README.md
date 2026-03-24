# Quinta Nicy Fabrica

> Sistema de gestão da Quinta Nicy em transição de modelo loja → fábrica.  
> Faturação e stock confiáveis, auditáveis e consistentes em tempo real.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.39-3ECF8E?logo=supabase)](https://supabase.com/)

---

## Visão Geral

O **Quinta Nicy Fabrica** é um ERP em migração brownfield: de um modelo de loja para um modelo de fábrica. O foco imediato é estabilizar **faturação** e **stock** com rastreabilidade e integridade operacional, preparando a base para futura gestão de produção.

**Princípio central:** toda entrada e saída de stock ligada a faturação deve ser confiável, auditável e consistente.

---

## Stack

| Camada      | Tecnologia                     |
|-------------|--------------------------------|
| **Frontend**| React 19, TypeScript, Vite 6   |
| **Backend** | Supabase (auth, DB, storage)   |
| **Testes**  | Vitest, Testing Library        |
| **UI**      | Lucide React, Recharts         |

---

## Começar

### Pré-requisitos

- Node.js >= 18
- npm

### Instalação

```bash
git clone https://github.com/DenylsonDanial/quinta-nicy-fabrica.git
cd quinta-nicy-fabrica
npm install
```

### Variáveis de ambiente

Crie um ficheiro `.env` na raiz com as variáveis do Supabase:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Comandos

| Comando          | Descrição                        |
|------------------|----------------------------------|
| `npm run dev`    | Servidor de desenvolvimento      |
| `npm run build`  | Build de produção                |
| `npm run preview`| Pré-visualizar build             |
| `npm run test`   | Testes em modo watch             |
| `npm run test:run` | Testes (execução única)        |
| `npm run type-check` | Verificação de tipos (TS)    |

---

## Estrutura do Projeto

```
quinta-nicy-fabrica/
├── src/                    # Código-fonte da aplicação
│   ├── admin/              # Módulo admin (usuários, configurações)
│   ├── auth/               # Autenticação e autorização
│   ├── core/               # Serviços partilhados, rotas, layout
│   ├── customers/          # Clientes e fidelização
│   ├── products/           # Produtos, compras, stock
│   └── sales/              # Vendas e pedidos
├── .planning/              # Planeamento e roadmap (GSD)
│   ├── ROADMAP.md          # Fases e critérios de sucesso
│   ├── REQUIREMENTS.md     # Requisitos e rastreabilidade
│   ├── phases/             # Planos e summaries por fase
│   └── codebase/           # Mapeamento e convenções
├── vite.config.ts
└── package.json
```

---

## Roadmap

| Fase | Nome                               | Estado |
|------|------------------------------------|--------|
| 1    | Faturação e Compliance de Compras  | ✅ Completa |
| 1.1  | Limpeza de funcionalidades legadas | ✅ Completa |
| 2    | Integridade e Segurança Operacional| ✅ Completa |
| 3    | Stock Integrado a Compras          | 🔜 Próxima |
| 4    | Lotes, Ajustes e Auditoria de Stock| Planeada |
| 5    | Base de Dados para Produção        | Planeada |

Ver detalhes em [.planning/ROADMAP.md](.planning/ROADMAP.md).

---

## Licença

Projeto privado — Quinta Nicy.

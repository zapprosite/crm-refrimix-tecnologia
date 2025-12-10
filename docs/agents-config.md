# AntiGravity Agents Configuration - CRM Refrimix Tecnologia

## Estrutura de Agents para o Repositório

Este arquivo documenta os agents customizados para o CRM Refrimix usando Google AntiGravity IDE.

---

## Agent 1: QA-E2E-Validator
**Propósito:** Validar e corrigir testes E2E (Playwright)
**Modo:** Agent-driven (autonomia total para testes)
**Responsabilidades:**
- Rodar `npx playwright test` e analisar falhas
- Usar Browser Sub-Agent para testar manualmente cada fluxo falhando
- Identificar se é bug de código ou bug de teste
- Corrigir selectors, waits ou asserções
- Re-rodar até 100% green

**Restrições:**
- Nunca marcar teste como `.skip`
- Nunca usar `test.flaky()`
- Sempre investigar erro raiz antes de "contornar"

**Tools permitidas:**
- Terminal (auto-execute: turbo)
- Browser Sub-Agent (interação manual)
- Editor (editar specs e código)

---

## Agent 2: Code-Quality-Auditor
**Propósito:** Validar qualidade de código (ESLint, TypeScript, padrões)
**Modo:** Agent-assisted (propõe, você revisa)
**Responsabilidades:**
- Rodar `npm run lint`
- Encontrar erros de tipo TypeScript
- Sugerir refatorações em hooks (useTransactions, useTasks, useAuth)
- Remover `any` types abusivos
- Validar tratamento de erros (não swallowing exceptions)

**Restrições:**
- Nunca desabilitar regras ESLint sem justificativa
- Nunca usar `@ts-ignore` sem documentação
- Code style: seguir prettier + eslint config existente

**Tools permitidas:**
- Terminal (auto-execute: auto com revisor)
- Editor (editar código)

---

## Agent 3: Finance-Feature-Debugger
**Propósito:** Debugar e corrigir fluxo de Financeiro
**Modo:** Agent-driven com checkpoint reviews
**Responsabilidades:**
- Investigar testes falhando em `finance.spec.ts`
- Revisar hooks de transações (CPF/CNPJ, receita, despesa)
- Validar lógica de cálculo de saldo
- Confirmar integração Supabase (queries, permissões)
- Testes: unidade → integração → E2E

**Fluxos críticos:**
1. Adicionar despesa com CPF ✅
2. Adicionar receita com CNPJ ✅
3. Alternar entidade (CPF ↔ CNPJ) ✅
4. Deletar transação ✅
5. Filtrar por entidade ✅

**Tools permitidas:**
- Terminal (npm test, playwright test)
- Browser Sub-Agent
- Editor

---

## Agent 4: Tasks-Feature-Debugger
**Propósito:** Debugar e corrigir fluxo de Tarefas
**Modo:** Agent-driven com checkpoint reviews
**Responsabilidades:**
- Investigar teste falhando em `e2e-full-app.spec.ts` (Tasks CRUD)
- Revisar hook `useTasks`
- Validar CRUD: Create → Read → Update → Delete
- Confirmar integração com dashboard e sidebar
- Testes: unidade → integração → E2E

**Fluxos críticos:**
1. Criar tarefa com título e descrição
2. Listar tarefas no dashboard
3. Editar tarefa existente
4. Marcar como concluída
5. Deletar tarefa

**Tools permitidas:**
- Terminal
- Browser Sub-Agent
- Editor

---

## Agent 5: Test-Pyramid-Architect
**Propósito:** Estruturar e documentar pirâmide de testes
**Modo:** Agent-assisted
**Responsabilidades:**
- Criar plano de testes (unit / integration / E2E)
- Criar `tests/unit/` com testes de hooks
- Criar `tests/integration/` com testes de componentes
- Documentar em `docs/testing-strategy.md` (pt-BR)
- Gerar relatório de cobertura

**Estrutura a gerar:**
```
tests/
├── unit/
│   ├── hooks/
│   │   ├── useAuth.test.ts
│   │   ├── useLeads.test.ts
│   │   ├── useTasks.test.ts
│   │   └── useTransactions.test.ts
│   └── utils/
│       └── calculations.test.ts
├── integration/
│   ├── components/
│   │   ├── Dashboard.test.tsx
│   │   ├── Leads.test.tsx
│   │   ├── Tasks.test.tsx
│   │   └── Finance.test.tsx
│   └── api/
│       └── supabase.test.ts
└── e2e/
    ├── e2e-full-app.spec.ts (refatorado)
    ├── finance.spec.ts
    ├── dashboard.spec.ts
    └── supabase.spec.ts
```

---

## Regras Globais (Global Rules)

Aplicam-se a TODOS os agents:

### Code Style
- **Linguagem:** TypeScript strict mode
- **Formatter:** Prettier (prettier config existente)
- **Linter:** ESLint (eslintrc existente)
- **Git:** Commits descritivos em pt-BR

### Testing Standards
- **Unit:** Jest com React Testing Library
- **Integration:** Playwright com user interactions
- **E2E:** Playwright com happy paths
- **Coverage:** Mínimo 70% para código crítico (Auth, Finance, Tasks)

### No Masking
- Nenhum `.skip`, `.todo`, `.flaky` em testes
- Nenhum `test.pending`
- Nenhum `// TODO: fix this later`
- Todo teste deve ser **executável e verificável**

### Error Handling
- Sempre logar erros (console.error ou logger)
- Nunca engolir exceções (`catch` vazio)
- Supabase errors: tratar por status code
- UI errors: mostrar toast/mensagem ao usuário

---

## Workflow: Hardening Completo

### Semana 1: Diagnóstico
1. **QA-E2E-Validator** inicia:
   - Roda testes, coleta screenshots dos fails
   - Mapeia bugs vs test issues
   
2. **Code-Quality-Auditor** inicia em paralelo:
   - Roda lint/typescript
   - Identifica anti-patterns

### Semana 2: Correção
3. **Finance-Feature-Debugger** começa:
   - Corrige finance.spec.ts
   - Testes: unit → integration → E2E
   
4. **Tasks-Feature-Debugger** começa (paralelo):
   - Corrige e2e tasks test
   - Mesma progressão

### Semana 3: Estrutura
5. **Test-Pyramid-Architect** executa:
   - Cria tests/unit/
   - Cria tests/integration/
   - Documenta estratégia

### Semana 4: Validação
6. Todos agents validam:
   ```bash
   npm run lint    # ✅ Deve passar
   npm test        # ✅ Deve passar
   npx playwright test  # ✅ Deve passar, 0 skips
   ```

---

## Como Usar no AntiGravity

### Opção 1: Via UI (Recomendado)
1. Abra o workspace do CRM Refrimix
2. Click em **Settings** → **Customizations** → **Rules**
3. Click **+ Workspace** 
4. Crie uma rule para cada Agent acima com nome e comportamento
5. Defina restrições em "Code Execution" (Terminal: Turbo/Auto)

### Opção 2: Via Prompt Direto
Cole este prompt no Agent Manager:

```text
I want to set up a multi-agent workflow for testing this CRM Refrimix project.

Create these agents (in order):

1. **QA-E2E-Validator** (Agent-driven)
   - Run playwright tests and fix failures
   - Use browser preview to validate manually
   - NO skipped tests allowed

2. **Code-Quality-Auditor** (Agent-assisted)
   - Run npm run lint and fix TypeScript errors
   - Refactor critical hooks

3. **Finance-Feature-Debugger** (Agent-driven)
   - Fix finance.spec.ts tests
   - Validate Finance CRUD flows

4. **Tasks-Feature-Debugger** (Agent-driven)
   - Fix Tasks CRUD E2E tests
   - Validate Tasks flows

5. **Test-Pyramid-Architect** (Agent-assisted)
   - Create tests/unit/, tests/integration/ structure
   - Document testing strategy

Start with agent 1 (QA-E2E-Validator).
```

---

## Acceptance Criteria (Final)

- ✅ `npm run lint` → Zero errors
- ✅ `npm test` → All unit/integration passing
- ✅ `npx playwright test` → All E2E passing, 0 skipped
- ✅ Browser Sub-Agent pode executar todos fluxos manualmente
- ✅ `docs/testing-strategy.md` criado e documentado
- ✅ Commits com histórico de correções

---

## Próximos Passos

1. **Hoje:** Configure os agents acima no AntiGravity
2. **Amanhã:** Inicie QA-E2E-Validator e colete diagnóstico
3. **Dia seguinte:** Code-Quality-Auditor + Finance/Tasks debuggers em paralelo
4. **Final:** Test-Pyramid-Architect estrutura tudo

---

**Documento versionado:** v1.0 - 09/Dec/2025
**Responsável:** User (você) + AntiGravity Agents
**Última atualização:** 2025-12-09 20:01 BRT
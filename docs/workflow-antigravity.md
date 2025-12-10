# AntiGravity Workflow Executável: CRM Refrimix Test Hardening
## Script para iniciar automaticamente todos os agents em sequência

### PASSO 1: Configure as Agents (Via UI)

**Acesso:** AntiGravity → Agent Manager → Settings → Customizations → Rules

---

## AGENT 1: QA-E2E-Validator (Inicie PRIMEIRO)

**Nome da Rule:** `Testing - E2E Validation`
**Modo:** Agent-driven
**Autonomy:** Always Proceed (para testes, pode rodar sozinho)
**Terminal Access:** Turbo (pode rodar CLI sem pedir)

**Prompt para Agent Manager:**

```
Task: Diagnose and fix all failing E2E tests in this CRM Refrimix project.

Current status:
- 5 total Playwright tests
- 3 passing (Auth, Navigation, Leads CRUD)
- 2 failing (Tasks CRUD, Finance CRUD)

Your mission:

Phase 1: Diagnosis (Use Browser Sub-Agent)
1. Run the full app locally (npm run dev)
2. Manually test Tasks CRUD flow using browser preview:
   - Create a task with title and description
   - Verify it appears in dashboard
   - Edit the task
   - Delete it
   - Screenshot each step
3. Manually test Finance CRUD flow:
   - Add an expense with CPF
   - Add income with CNPJ
   - Switch between CPF and CNPJ entities
   - Delete a transaction
   - Filter transactions
   - Screenshot each step

For each manual test, determine:
- Does the feature actually work in the app?
- Is the test looking for the right elements (correct selectors)?
- Are waits/timeouts sufficient?

Create an ARTIFACT with findings.

Phase 2: Root Cause Analysis
For EACH failing test, answer:
- What is the exact error? (assertion, timeout, element not found?)
- Is it an APP BUG (code logic) or TEST BUG (selector/wait)?
- List specific file/function that needs fixing

Phase 3: Fix Implementation
- If app bug: Edit the source code (hooks, components)
- If test bug: Edit tests/e2e/e2e-full-app.spec.ts (selectors/waits/assertions)
- DO NOT mark tests as .skip or .flaky
- Fix the ROOT CAUSE

Phase 4: Verification
- Run: npx playwright test e2e-full-app.spec.ts -g "Tasks CRUD"
- Run: npx playwright test e2e-full-app.spec.ts -g "Finance CRUD"
- Run full suite: npx playwright test e2e-full-app.spec.ts
- Verify ALL 5 tests pass with NO skips

Expected output: All 5 ✅ Passed, Total time ~20-30s
```

**Espere:** QA-E2E-Validator completar e gerar artifact com diagnóstico

---

## AGENT 2: Code-Quality-Auditor (Inicie DEPOIS)

**Nome da Rule:** `Code Quality - Lint & TypeScript`
**Modo:** Agent-assisted
**Autonomy:** Request Review (você aprova mudanças)
**Terminal Access:** Auto (pede permissão para comandos)

**Prompt para Agent Manager:**

```
Task: Audit and fix code quality issues in CRM Refrimix.

After the QA-E2E-Validator agent finishes, run this quality pass:

Phase 1: Lint Audit
1. Run: npm run lint
2. Fix ALL errors:
   - No unused variables
   - No implicit 'any' types
   - No console.log without purpose
   - Follow prettier formatting

Phase 2: TypeScript Strict Check
1. Review hooks for type safety:
   - src/hooks/useAuth.ts
   - src/hooks/useLeads.ts
   - src/hooks/useTasks.ts
   - src/hooks/useTransactions.ts
2. Find and fix:
   - Missing type annotations
   - 'any' types (replace with proper types)
   - Unsafe type assertions

Phase 3: Error Handling Review
In Finance and Tasks flows, ensure:
- No silent catches (all errors logged or thrown)
- Supabase errors have proper handling
- User-facing errors show toasts/messages

Phase 4: Verification
- Run: npm run lint
- Expect: Zero errors
- Create ARTIFACT with all fixes applied

Expected output: npm run lint passes with 0 errors
```

**Espere:** Code-Quality-Auditor completar

---

## AGENT 3 & 4: Feature Debuggers (PARALELO)

### AGENT 3: Finance-Feature-Debugger

**Nome da Rule:** `Feature - Finance Debugging`
**Modo:** Agent-driven
**Autonomy:** Always Proceed
**Terminal Access:** Turbo

**Prompt:**

```
Task: Fix Finance CRUD test until 100% passing.

The test "Finance CRUD (Happy Path)" is failing. Your goal:
- Fix until npx playwright test e2e-full-app.spec.ts -g "Finance CRUD" passes
- All 5 Finance flows working:
  1. Add expense with CPF
  2. Add income with CNPJ
  3. Switch entity (CPF ↔ CNPJ)
  4. Delete transaction
  5. Filter by entity

What you'll do:
1. Run the failing test and capture exact error
2. Investigate:
   - Is Finance page loading? (check component)
   - Do form inputs work? (check hooks)
   - Is data saving to Supabase? (check useTransactions hook)
   - Is saldo calculation correct? (check math logic)
3. Fix app code OR test code (never skip)
4. Re-test each flow manually with browser preview
5. Verify with: npx playwright test e2e-full-app.spec.ts

Do not proceed to next feature until this passes.
```

### AGENT 4: Tasks-Feature-Debugger

**Nome da Rule:** `Feature - Tasks Debugging`
**Modo:** Agent-driven
**Autonomy:** Always Proceed
**Terminal Access:** Turbo

**Prompt:**

```
Task: Fix Tasks CRUD test until 100% passing.

The test "Tasks CRUD (Happy Path)" is failing. Your goal:
- Fix until npx playwright test e2e-full-app.spec.ts -g "Tasks CRUD" passes
- All 5 Tasks flows working:
  1. Create task with title and description
  2. View task in dashboard
  3. Edit task
  4. Mark as complete
  5. Delete task

What you'll do:
1. Run the failing test and capture exact error
2. Investigate:
   - Is Tasks page loading? (check component)
   - Do form inputs work? (check useTasks hook)
   - Is data saving? (check Supabase integration)
   - Is dashboard updating? (check real-time)
3. Fix app code OR test code (never skip)
4. Re-test manually with browser preview
5. Verify with: npx playwright test e2e-full-app.spec.ts

Do not proceed until this passes.
```

**Executar em PARALELO:** Ambos podem rodar ao mesmo tempo

---

## AGENT 5: Test-Pyramid-Architect (DEPOIS QUE 3 & 4 PASSAREM)

**Nome da Rule:** `Testing - Pyramid Structure`
**Modo:** Agent-assisted
**Autonomy:** Request Review
**Terminal Access:** Auto

**Prompt:**

```
Task: Create and document the test pyramid structure.

After Finance and Tasks debuggers finish successfully, build the test structure:

Phase 1: Create Directory Structure
mkdir -p tests/unit/hooks tests/unit/utils tests/integration/components tests/integration/api

Phase 2: Unit Tests (Hooks)
Create tests/unit/hooks/:
- useAuth.test.ts (login, logout, getCurrentUser)
- useLeads.test.ts (CRUD operations)
- useTasks.test.ts (CRUD operations)
- useTransactions.test.ts (add, delete, filter, saldo calculation)

Each test:
- Mock Supabase
- Test happy path + error cases
- No E2E, just logic

Phase 3: Integration Tests (Components)
Create tests/integration/components/:
- Dashboard.test.tsx (rendering, data loading)
- Leads.test.tsx (component + hook integration)
- Tasks.test.tsx (component + hook integration)
- Finance.test.tsx (component + hook integration)

Phase 4: Documentation
Create docs/testing-strategy.md (pt-BR) with:
- Pyramid structure diagram
- Each layer explained
- How to run tests
- Coverage targets (70% min)

Phase 5: Run All Tests
npm test           # Should pass
npx playwright test # Should pass

Expected output:
- All unit tests passing
- All integration tests passing
- All E2E tests passing (from previous agents)
- Testing strategy documented
```

---

## EXECUTION CHECKLIST

### Dia 1: Preparação
- [ ] Leia o arquivo `agents-config.md` acima
- [ ] Abra AntiGravity → Workspace: CRM Refrimix
- [ ] Vá para Settings → Customizations → Rules

### Dia 2: Agent 1 (QA-E2E-Validator)
- [ ] Crie a rule "Testing - E2E Validation" com settings acima
- [ ] Copie o Prompt de Agent 1 no Agent Manager
- [ ] Clique "Start Task"
- [ ] Monitore a execução
- [ ] Quando terminar, revise o ARTIFACT gerado

### Dia 3: Agent 2 (Code-Quality-Auditor)
- [ ] Crie a rule "Code Quality - Lint & TypeScript"
- [ ] Copie o Prompt de Agent 2
- [ ] Clique "Start Task"
- [ ] Aprove as mudanças sugeridas
- [ ] Verif: `npm run lint` passa

### Dia 4: Agents 3 & 4 (Paralelo)
- [ ] Crie ambas rules: "Feature - Finance Debugging" e "Feature - Tasks Debugging"
- [ ] Copie prompts para ambos agents
- [ ] Clique "Start Task" em ambos SIMULTANEAMENTE
- [ ] Monitore em abas separadas
- [ ] Quando ambos passarem, execute: `npx playwright test e2e-full-app.spec.ts`

### Dia 5: Agent 5 (Test-Pyramid-Architect)
- [ ] Crie rule "Testing - Pyramid Structure"
- [ ] Copie o Prompt
- [ ] Clique "Start Task"
- [ ] Revise estrutura, aprove documentação

### Final: Validação Total
```bash
npm run lint                              # ✅ 0 errors
npm test                                  # ✅ All passing
npx playwright test e2e-full-app.spec.ts # ✅ All passing, 0 skipped
```

---

## Troubleshooting

**Se um agent travar:**
- Clique "Stop Task"
- Revise o error no ARTIFACT
- Refine o prompt com mais detalhes
- Re-inicie

**Se um teste ainda falhar após agent fixes:**
- Manualmente teste no Browser Sub-Agent
- Reporte exato o que está faltando
- Re-rode o agent com contexto adicional

**Se conflitos entre agents:**
- Execute sequencialmente (1 → 2 → 3&4 → 5)
- Não deixe dois agents editarem mesmo arquivo simultaneously

---

**Status:** Ready to Deploy
**Last Updated:** 2025-12-09 20:01 BRT
**Teste este workflow e reporte resultados aqui!**

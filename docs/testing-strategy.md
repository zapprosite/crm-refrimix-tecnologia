# Estratégia de Testes - CRM Refrimix Tecnologia

Este documento define a estratégia para garantir a qualidade e estabilidade do CRM, migrando de uma abordagem 100% E2E para uma **Pirâmide de Testes** equilibrada.

## 1. Visão Geral (Target)

Objetivamos a seguinte distribuição de cobertura:

- **60-70% Testes Unitários**: Rápidos, isolados, focados na lógica de negócios e utilitários.
- **20-30% Testes de Integração**: Focados na interação entre componentes (Formulários, Páginas) e o comportamento do usuário.
- **10% Testes E2E (End-to-End)**: Fluxos críticos completos que validam que o sistema funciona como um todo no navegador.

## 2. Análise Atual

- **Cobertura Existente**: Apenas E2E (`tests/e2e/e2e-full-app.spec.ts`) usando Playwright.
- **Problemas**: 
  - Testes E2E são lentos e propensos a "flakiness" (intermitência), especialmente ao testar validações de formulário e detalhes de UI.
  - Falta de infraestrutura para testar hooks (`useLeads`, `useTransactions`) isoladamente.
  - Dependências de teste unitário (`vitest`, `testing-library`) ausentes no `package.json`.

## 3. Plano de Testes Detalhado

### 3.1. Testes Unitários (Unit)
**Ferramentas**: `vitest`, `@testing-library/react-hooks` (ou nativo do RTL), `vi-fetch` ou mocks manuais do Supabase.

**Escopo**:
- **Hooks Customizados** (`src/hooks/*.ts`):
  - `useLeads.ts`: Validar adição, atualização e cálculo de KPIs (simulando respostas do Supabase).
  - `useTransactions.ts`: Validar cálculos de saldo e adição de transações.
  - `useTasks.ts`, `useQuotes.ts`, `useInventory.ts`: Testar CRUD básico e lógica de estado.
- **Utilitários** (`src/lib/*.ts`):
  - Mascaradores (`maskCPF`, `maskPhone`, `maskCEP`) em `src/lib/masks.ts` (se existir) ou `utils.ts`.
  - Formatadores de data e moeda.

**O que Mockar**: 
- Cliente do Supabase (`supabase-js`): Devemos criar um mock reutilizável para que o teste unitário não faça chamadas de rede.

### 3.2. Testes de Integração (Integration)
**Ferramentas**: `vitest`, `@testing-library/react`, `@testing-library/user-event`.

**Escopo**:
- **Formulários Críticos**:
  - `LeadForm.tsx`: Validar regras de preenchimento (Obrigatórios, CPF, Email), validação de CEP (mockar viaCEP) e chamada da prop `onSubmit`.
  - `Login.tsx`: Validar interação de email/senha e feedback de erro.
- **Componentes Complexos**:
  - Tabelas com filtros (se houver lógica complexa no front).

**Estratégia**:
- Renderizar o componente isolado.
- Interagir como usuário (clicar, digitar).
- Validar se as funções de callback corretas foram chamadas ou se mensagens de erro apareceram na tela.
- **NÃO** fazer chamadas reais à API (mockar hooks ou services).

### 3.3. Testes E2E (Playwright)
**Ferramentas**: Playwright (já configurado).

**Refatoração**:
- Reduzir o `e2e-full-app.spec.ts` para focar apenas no **Caminho Feliz** (Happy Path) de cada módulo.
- **Remover** testes de validação de formulário (agora cobertos por Integração).
- **Remover** testes repetitivos de CRUD excessivos se a unidade garante a lógica.
- **Cenários Mantidos**:
  1. **Auth**: Login com sucesso e redirecionamento.
  2. **Leads**: Criar um Lead e verificar Toast de sucesso.
  3. **Tasks**: Criar uma Tarefa simples.
  4. **Finance**: Adicionar uma Transação.
  5. **Smoke Test**: Navegação pelas 10 abas para garantir que nada quebrou (Tela Branca).

---

## 4. Plano de Implementação

1.  **Instalação de Dependências**:
    - `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`.
2.  **Configuração**:
    - Criar `vitest.config.ts`.
    - Criar `tests/setup.ts` para mocks globais (Supabase).
3.  **Implementação Unitária**:
    - Criar `tests/unit/hooks/useLeads.test.ts`.
    - Criar `tests/unit/utils.test.ts`.
4.  **Implementação de Integração**:
    - Criar `tests/integration/components/LeadForm.test.tsx`.
5.  **Refatoração E2E**:
    - Limpar `tests/e2e/e2e-full-app.spec.ts`.
    - Remover `.skip`, adicionar esperas explícitas onde necessário, e remover redundâncias.

## 5. Critérios de Aceite

- [ ] `npm test` executa testes unitários e de integração com 100% de sucesso.
- [ ] `npx playwright test` executa a suite E2E reduzida com 100% de sucesso (Zero Skips).
- [ ] Documentação técnica atualizada.

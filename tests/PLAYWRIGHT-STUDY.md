
# Playwright Study Report

## 1. Estado Atual dos Testes

| Spec | Status | Cobertura |
|------|--------|-----------|
| `auth.spec.ts` | ✅ Passando | Login e redirecionamento de não-autenticado. |
| `chatbot-agent.spec.ts` | ✅ Passando | Navegação e criação básica via chat. |
| `schedule.spec.ts` | ⚠️ Básico | Apenas navegação. CRUD inexistente. |
| `collaborators.spec.ts` | ⚠️ Básico | Apenas navegação. |
| `quotes.spec.ts` | ⚠️ Básico | Apenas navegação. |
| `leads.spec.ts` | ❌ Timeout | Tenta criar Lead, espera Toast. |
| `tasks.spec.ts` | ❌ Timeout | Tenta criar Tarefa com colaborador. |
| `finance.spec.ts` | ❌ Timeout | Tenta criar Transação. |
| `inventory.spec.ts` | ❌ Timeout | Tenta criar Item. |

## 2. Causas Prováveis dos Timeouts

1.  **Dependência de Dados nos Selects**:
    *   Em `Tasks`, o teste depende de colaboradores existirem. O mock retorna um array, mas o componente UI pode demorar para popular o Select ou usar uma chave diferente.
2.  **Waits em Toasts Instáveis**:
    *   Os testes confiam exclusivamente em `expect(page.getByText('...')).toBeVisible()`. Se a API falhar silenciosamente ou o texto do toast for ligeiramente diferente, o teste espera 30s e falha.
3.  **Mocks Simplistas**:
    *   `fixtures.ts` retorna `[]` para todos os GETs por padrão. Telas que esperam configuração inicial (ex: categorias financeiras, status de leads) podem quebrar ou não renderizar o formulário corretamente.
4.  **Seletores Frágeis**:
    *   Uso de `getByLabel` pode falhar se o `label` não estiver associado corretamente ao `input` via `id`/`for`, ou se houver formatação CSS escondendo o label real.

## 3. Melhorias de Arquitetura

*   **Page Objects em Português**: Padronizar a API de testes para facilitar leitura (ex: `leadsPage.criarLead(...)`).
*   **Fixtures Inteligentes**: Manter o login autenticado global ou reusável para não logar em todo teste (embora mocks sejam rápidos, setup repetitivo polui).
*   **Wait For Response**: Em operações de escrita (POST/PUT), esperar explicitamente a resposta da API (200/201) *antes* ou *em paralelo* à verificação do Toast. Isso garante que o backend "respondeu".
*   **Data Test IDs**: Forçar uso de `data-testid` em elementos críticos que não têm papeis semânticos claros.

## 4. Plano de Refatoração

1.  **Infra**: Atualizar `playwright.config.ts` com timeouts racionais.
2.  **Page Objects**: Implementar métodos `criar...`, `editar...`, `excluir...` em todos os POs.
3.  **Refatorar Specs**:
    *   Injetar dados de mock necessários para cada cenário (ex: categorias para finanças).
    *   Usar `Promise.all([waitForResponse, click])` para robustez.
4.  **Expandir Cobertura**: Adicionar testes de Edição e Exclusão para todos os módulos.

---
description: Como rodar os testes E2E com Playwright
---

# Testes E2E

## Pré-requisitos

1. Instalar browsers do Playwright (uma vez):
```bash
npx playwright install chromium
```

## Executar Testes

// turbo

2. Rodar todos os testes:
```bash
npx playwright test
```

3. Rodar com interface gráfica:
```bash
npx playwright test --ui
```

4. Rodar teste específico:
```bash
npx playwright test tests/e2e/finance.spec.ts
```

5. Rodar em modo headed (ver o navegador):
```bash
npx playwright test --headed
```

## Ver Relatório

Após os testes, abra o relatório HTML:
```bash
npx playwright show-report
```

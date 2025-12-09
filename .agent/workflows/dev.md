---
description: Como executar o projeto em modo de desenvolvimento
---

# Desenvolvimento Local

// turbo-all

## Passos

1. Instalar dependências (se ainda não instalou):
```bash
npm install --legacy-peer-deps
```

2. Iniciar o servidor de desenvolvimento:
```bash
npm run dev
```

3. O CRM estará disponível em `http://localhost:5173`

## Notas

- Se a porta 5173 estiver ocupada, o Vite vai usar a próxima disponível
- Hot reload está ativado por padrão
- Erros de TypeScript aparecem no terminal

---
description: Como criar build de produção e fazer deploy
---

# Deploy

## Build de Produção

// turbo

1. Gerar build otimizado:
```bash
npm run build
```

2. Testar build localmente:
```bash
npm run preview
```

## Deploy no Netlify

O projeto já está configurado para Netlify (`netlify.toml`).

### Via CLI

1. Instalar Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login:
```bash
netlify login
```

3. Deploy:
```bash
netlify deploy --prod
```

### Via Git

1. Conectar repositório ao Netlify
2. Configurar:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Adicionar variáveis de ambiente no painel Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Verificação Pós-Deploy

- [ ] Login funcionando
- [ ] Dados carregando do Supabase
- [ ] Transações CPF/CNPJ salvando
- [ ] PDF de orçamento gerando

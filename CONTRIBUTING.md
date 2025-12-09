# Contribuindo para o CRM Refrimix

Obrigado por considerar contribuir! Este guia vai te ajudar a começar.

## 🚀 Setup do Ambiente

### Pré-requisitos
- Node.js 18+
- npm ou pnpm
- Conta no Supabase (ou usar o projeto existente)

### Instalação

```bash
# Clonar repositório
git clone <repo-url>
cd crm-refrimix

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais Supabase

# Iniciar dev server
npm run dev
```

## 📝 Convenções de Código

### Commits
Usamos commits semânticos:

```
feat: adiciona novo relatório de vendas
fix: corrige cálculo de saldo CPF
docs: atualiza README com instruções
style: formata código com prettier
refactor: simplifica lógica de importação CSV
test: adiciona testes para Finance
chore: atualiza dependências
```

### TypeScript
- Use tipos explícitos, evite `any`
- Defina interfaces em `AppContext.tsx` ou arquivos `.d.ts`

### React
- Componentes funcionais com hooks
- Props tipadas com interface
- Estado global via `useApp()`

## 🧪 Testes

Antes de abrir PR:

```bash
# Lint
npm run lint

# Build sem erros
npm run build

# Testes E2E (se Playwright instalado)
npx playwright test
```

## 📁 Estrutura de PRs

1. **Título claro**: `feat: adiciona filtro por período no financeiro`
2. **Descrição**: O que, por que, como testar
3. **Screenshots**: Se houver mudanças visuais
4. **Testes**: Novos ou atualizados

## 🐛 Reportando Bugs

Use o template:

```markdown
**Descrição**
O que aconteceu vs. o que deveria acontecer

**Passos para Reproduzir**
1. Vá para...
2. Clique em...
3. Veja o erro

**Ambiente**
- OS: Windows 11
- Browser: Chrome 120
- Node: 18.x

**Screenshots**
Se aplicável
```

## 💡 Sugerindo Features

Abra uma issue com:
- Problema que resolve
- Proposta de solução
- Alternativas consideradas

## 📚 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Playwright](https://playwright.dev/docs/intro)

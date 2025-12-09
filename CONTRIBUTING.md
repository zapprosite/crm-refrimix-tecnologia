# Contribuindo para o CRM Refrimix

Obrigado por considerar contribuir para o CRM Refrimix! Este documento fornece diretrizes para garantir que o desenvolvimento seja consistente e de alta qualidade.

## 🚀 Como Começar

1.  **Fork** o repositório no GitHub.
2.  **Clone** o seu fork para sua máquina local.
3.  Crie uma **Branch** para sua feature ou correção: `git checkout -b feat/minha-feature`.

## 🛠️ Padrões de Desenvolvimento

Para manter a base de código limpa e sustentável, seguimos regras estritas.

### 🤖 Desenvolvimento com IA (Agents)
Se você está usando Agentes de IA (como Cline, Bolt, etc) para contribuir, **LEIA OBRIGATORIAMENTE** o arquivo [AGENTS.md](AGENTS.md). Ele contém regras anti-alucinação vitais para este projeto.

### Estilo de Código & Linting
- **TypeScript Strict**: Tipagem forte é obrigatória. Evite `any`.
- **Componentes**: Use componentes funcionais e hooks.
- **UI**: Utilize os componentes do `shadcn/ui` em `src/components/ui` sempre que possível para manter a consistência visual.
- **Ícones**: Use `lucide-react`.

### Estrutura de Pastas
- `src/components/ui`: Componentes base (botões, inputs, etc).
- `src/pages`: Páginas da aplicação (rotas).
- `src/context`: Gerenciamento de estado global.
- `src/hooks`: Hooks customizados (lógica de negócio).
- `src/types`: Definições de tipos compartilhados.
- `src/lib`: Utilitários e configurações (Supabase, utils).

## 🧪 Testes

Garantimos a qualidade através de testes automatizados. Antes de enviar seu PR:

1.  Rode o lint: `npm run lint`
2.  Verifique o build: `npm run build`
3.  Se implementou nova lógica, adicione testes em `tests/`.

## 📝 Processo de Pull Request

1.  Garanta que seu código segue os padrões acima.
2.  Teste suas alterações localmente.
3.  Abra um PR para a branch `main`.
4.  Descreva claramente o que foi alterado e o motivo.
5.  Anexe screenshots se houver mudanças visuais.

## 🐛 Reportando Bugs

Use a aba [Issues](https://github.com/zapprosite/crm-refrimix-tecnologia/issues) do GitHub para reportar problemas. Inclua:
- Passos para reproduzir
- Comportamento esperado vs real
- Logs ou screenshots do erro

Obrigado por ajudar a tornar o CRM Refrimix melhor! 🚀

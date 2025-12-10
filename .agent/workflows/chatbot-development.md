---
description: Como desenvolver e debugar o chatbot "Cérebro Refrimix"
---

# Workflow: Desenvolvimento do Chatbot Agent

## 1. Entender a Arquitetura Atual

```bash
# Arquivos principais:
# - src/lib/ai/agent.ts         → AIManager com system prompt
# - src/lib/ai/tool-registry.ts → Implementação das tools
# - src/lib/ai/tools-schema.ts  → Schema OpenAI das tools
# - src/lib/ai/providers/       → Providers (Ollama, OpenAI, etc)
# - src/components/AIChatbot.tsx → UI do chatbot
```

## 2. Testar o Chatbot

// turbo
```bash
npm run dev
```

1. Abra http://localhost:5173
2. Faça login
3. Clique no botão azul flutuante (FAB)
4. Teste comandos:
   - "vá para leads" → deve navegar
   - "crie lead João" → deve criar
   - "quanto faturamos?" → deve mostrar KPIs

## 3. Se Tools Não Executam

**Problema comum**: Modelo responde em texto ao invés de usar tool_calls.

**Soluções**:
1. Fortalecer system prompt em `agent.ts`
2. Usar modelo com melhor function calling (gemini-1.5-flash, gpt-3.5-turbo)
3. Adicionar exemplos explícitos no prompt

## 4. Adicionar Nova Tool

1. Adicionar schema em `tools-schema.ts`:
```typescript
{
    type: 'function',
    function: {
        name: 'minha_nova_tool',
        description: 'O que ela faz',
        parameters: { type: 'object', properties: {...}, required: [...] }
    }
}
```

2. Implementar em `tool-registry.ts`:
```typescript
this.register('minha_nova_tool', async (args) => {
    // Executar lógica real (Supabase, etc)
    return JSON.stringify({ resultado });
});
```

3. Se precisar de contexto React (useNavigate, etc), registrar via `registerToolAction` no `AIChatbot.tsx`

## 5. Conectar ao Supabase Real

Em `tool-registry.ts`, importe e use o client Supabase:
```typescript
import { supabase } from '@/lib/supabase';

this.register('search_leads', async (args) => {
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .ilike('name', `%${args.query}%`);
    return JSON.stringify({ results: data || [], error: error?.message });
});
```

## 6. Verificar Build

// turbo
```bash
npm run build
```

## 7. Rodar Testes E2E

// turbo
```bash
npx playwright test crm-e2e --reporter=line
```

## 8. Próximos Passos (Backlog)

Marque como [x] quando completar:

- [ ] Conectar todas tools ao Supabase real
- [ ] Adicionar tool `create_task`
- [ ] Adicionar tool `add_expense` / `add_income`
- [ ] Implementar streaming de respostas
- [ ] Adicionar indicador de "pensando..."
- [ ] Persistir histórico no Supabase (não só localStorage)

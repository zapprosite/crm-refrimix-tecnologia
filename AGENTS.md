# AGENTS.md - Boas Práticas para LLM Agents

## Anti-Alucinação: Regras Fundamentais

### 1. Verificação Antes de Agir

```markdown
SEMPRE antes de editar um arquivo:
1. VIEW o arquivo completo ou a seção relevante
2. CONFIRME que o código que você quer modificar EXISTE
3. COPIE exatamente o texto que será substituído
4. NUNCA assuma estrutura de código sem verificar
```

### 2. Edições Incrementais

```markdown
RUIM: Reescrever 200 linhas de uma vez
BOM: Fazer 3-5 edições pequenas e verificar build entre elas

Ao modificar arquivos:
- Máximo 30 linhas por edit quando possível
- Verificar build/lint após cada edição significativa
- Se uma edição falhar, VIEW o arquivo novamente
```

### 3. Tratamento de Erros de Lint

```markdown
Quando receber erros de lint:
1. PARAR e analisar o erro
2. VIEW as linhas específicas mencionadas
3. Corrigir o erro ANTES de continuar
4. NUNCA ignorar erros de compilação

Se o erro persistir após 2 tentativas:
- VIEW o arquivo completo
- Considerar reescrever a seção inteira
```

### 4. Contexto e Estado

```markdown
MANTER consciência de:
- Qual arquivo está sendo editado
- Quais edições já foram feitas na sessão
- Estado atual do build (passou/falhou)
- Última ação que funcionou

EVITAR:
- Editar o mesmo arquivo em paralelo
- Assumir que edições anteriores foram aplicadas
- Ignorar feedback de lint/build
```

### 5. Comunicação com Usuário

```markdown
QUANDO comunicar:
- Após completar uma tarefa significativa
- Quando encontrar um bloqueio
- Para pedir aprovação em mudanças grandes

COMO comunicar:
- Ser conciso e direto
- Mostrar o que foi feito, não o que vai fazer
- Incluir passos de verificação para o usuário
```

---

## Padrões de Código para Evitar Bugs

### TypeScript

```typescript
// SEMPRE tipar retornos de função
async function fetchData(): Promise<Data | null> { ... }

// SEMPRE verificar null/undefined
if (data && data.length > 0) { ... }

// NUNCA usar 'any' sem necessidade
// RUIM: const x: any = ...
// BOM: const x: unknown = ...
```

### React

```typescript
// SEMPRE tratar estados de loading/error
if (loading) return <Spinner />;
if (error) return <ErrorMessage />;

// EVITAR efeitos colaterais não tratados
useEffect(() => {
  let cancelled = false;
  fetchData().then(data => {
    if (!cancelled) setData(data);
  });
  return () => { cancelled = true; };
}, []);
```

### Supabase

```typescript
// SEMPRE verificar erro E dados
const { data, error } = await supabase.from('table').select();
if (error) throw error;
if (!data || data.length === 0) {
  // Tratar caso vazio
}
```

---

## Checklist Antes de Finalizar

- [ ] Build passa sem erros
- [ ] Lint passa sem erros
- [ ] Funcionalidade testada manualmente
- [ ] Código revisado para edge cases
- [ ] Documentação atualizada se necessário
- [ ] Commits com mensagens claras

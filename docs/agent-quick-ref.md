# 🧠 CÉREBRO REFRIMIX - AGENTIC ARCHITECTURE QUICK REFERENCE

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER CHAT INTERFACE                      │
│                  "Cérebro Refrimix" Widget                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ User Message
           ┌───────────────────────────┐
           │   INTENT CLASSIFIER       │
           │  (LLM Router)             │
           └───────────┬───────────────┘
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
    NAVIGATE      CREATE/UPDATE    QUERY/REPORT
        │              │              │
        ↓              ↓              ↓
    ┌─────────────────────────────────────┐
    │    TOOL REGISTRY (25+ Tools)        │
    │  ├─ Navigation Tools (4)            │
    │  ├─ Leads Tools (6)                 │
    │  ├─ Inventory Tools (6)             │
    │  ├─ Tasks Tools (6)                 │
    │  ├─ Finance Tools (6)               │
    │  └─ Analytics Tools (5)             │
    └──────────────┬──────────────────────┘
                   │
                   ↓
    ┌──────────────────────────────┐
    │ TOOL EXECUTOR                │
    │ ├─ Validate Parameters       │
    │ ├─ Check Permissions         │
    │ ├─ Execute Supabase Query    │
    │ ├─ Handle Errors             │
    │ └─ Log Execution             │
    └──────────┬───────────────────┘
               │
               ↓
    ┌──────────────────────────────┐
    │ MULTI-PROVIDER AI ROUTER     │
    │ ├─ OpenAI                    │
    │ ├─ Ollama (Local)            │
    │ ├─ Google Gemini             │
    │ ├─ Anthropic Claude          │
    │ └─ Perplexity                │
    └──────────┬───────────────────┘
               │
               ↓
    ┌──────────────────────────────┐
    │ RESPONSE FORMATTER           │
    │ ├─ Format Results            │
    │ ├─ Add Suggestions           │
    │ ├─ Handle Errors             │
    │ └─ Provide Next Steps        │
    └──────────┬───────────────────┘
               │
               ↓
    ┌──────────────────────────────┐
    │ CHAT HISTORY & PERSISTENCE   │
    │ ├─ Store in localStorage     │
    │ ├─ Preserve Context          │
    │ ├─ Enable Recovery           │
    │ └─ Audit Trail               │
    └──────────┬───────────────────┘
               │
               ↓
         ┌──────────────┐
         │ User Response│
         └──────────────┘
```

---

## 🛠️ Tool Registry Structure (25+ Tools)

### Category 1: NAVIGATION (4 tools)
```
✓ navigate_to_page(page)
  → Navegar para: leads, inventory, tasks, finance, dashboard
  
✓ open_settings()
  → Abre painel de configurações do chatbot
  
✓ close_chatbot()
  → Fecha o widget do chatbot
  
✓ refresh_current_page()
  → Recarrega dados da página atual
```

### Category 2: LEADS MANAGEMENT (6 tools)
```
✓ create_lead(name, email, phone, company, status)
  → Exemplo: "Crie um lead para João da Silva"
  → Executa: INSERT into leads
  
✓ fetch_leads(filters)
  → Exemplo: "Mostra meus leads ativos"
  → Executa: SELECT * FROM leads WHERE ...
  
✓ update_lead(id, fields)
  → Exemplo: "Mude o lead João para 'em conversação'"
  → Executa: UPDATE leads SET ...
  
✓ delete_lead(id)
  → Exemplo: "Delete o lead José"
  → Executa: DELETE FROM leads WHERE id = ...
  
✓ search_lead_by_name(query)
  → Exemplo: "Procure leads que começam com 'Silva'"
  → Executa: SELECT * FROM leads WHERE name LIKE ...
  
✓ change_lead_status(id, new_status)
  → Exemplo: "Marque João como 'lead qualificado'"
  → Executa: UPDATE leads SET status = ...
```

### Category 3: INVENTORY MANAGEMENT (6 tools)
```
✓ create_inventory_item(name, sku, qty, price, category)
  → Exemplo: "Cadastre 50 unidades do compressor X"
  → Executa: INSERT into inventory
  
✓ fetch_inventory(filters)
  → Exemplo: "Mostra itens abaixo de 10 unidades"
  → Executa: SELECT * FROM inventory WHERE qty < 10
  
✓ update_inventory(id, fields)
  → Exemplo: "Atualize o preço do item 5 para R$ 500"
  → Executa: UPDATE inventory SET price = ...
  
✓ delete_inventory(id)
  → Exemplo: "Delete o item descontinuado"
  → Executa: DELETE FROM inventory WHERE id = ...
  
✓ adjust_quantity(id, change)
  → Exemplo: "Adicione 20 unidades ao item 3"
  → Executa: UPDATE inventory SET qty = qty + 20
  
✓ check_stock_level(id)
  → Exemplo: "Quanto temos do compressor ABC?"
  → Executa: SELECT qty FROM inventory WHERE id = ...
```

### Category 4: TASKS MANAGEMENT (6 tools)
```
✓ create_task(title, description, assigned_to, due_date, priority)
  → Exemplo: "Crie uma tarefa para João revisar o contrato até 15/12"
  → Executa: INSERT into tasks
  
✓ fetch_tasks(filters)
  → Exemplo: "Quais tarefas estão pendentes?"
  → Executa: SELECT * FROM tasks WHERE status = 'pending'
  
✓ update_task(id, fields)
  → Exemplo: "Mude a prioridade da tarefa 5 para alta"
  → Executa: UPDATE tasks SET priority = 'high'
  
✓ mark_task_complete(id)
  → Exemplo: "Marque a tarefa 3 como completa"
  → Executa: UPDATE tasks SET status = 'completed'
  
✓ delete_task(id)
  → Exemplo: "Delete a tarefa 7"
  → Executa: DELETE FROM tasks WHERE id = ...
  
✓ get_my_tasks()
  → Exemplo: "Mostre minhas tarefas"
  → Executa: SELECT * FROM tasks WHERE assigned_to = current_user
```

### Category 5: FINANCE MANAGEMENT (6 tools)
```
✓ add_expense(amount, description, category, entity_type, entity_id)
  → Exemplo: "Registre uma despesa de R$ 500 com material"
  → Executa: INSERT into transactions (type='expense')
  
✓ add_income(amount, description, source, entity_type, entity_id)
  → Exemplo: "Registre uma receita de R$ 2000 de um cliente"
  → Executa: INSERT into transactions (type='income')
  
✓ fetch_transactions(filters)
  → Exemplo: "Mostra minhas transações de dezembro"
  → Executa: SELECT * FROM transactions WHERE ...
  
✓ get_total_revenue(period)
  → Exemplo: "Quanto ganhei esse mês?"
  → Executa: SUM(amount) FROM transactions WHERE type='income'
  
✓ get_total_expenses(period)
  → Exemplo: "Quanto gastei essa semana?"
  → Executa: SUM(amount) FROM transactions WHERE type='expense'
  
✓ delete_transaction(id)
  → Exemplo: "Delete a transação 123"
  → Executa: DELETE FROM transactions WHERE id = ...
```

### Category 6: ANALYTICS & REPORTING (5 tools)
```
✓ get_dashboard_metrics()
  → Retorna: total revenue, expenses, leads, tasks
  → Para: "Como está meu negócio?"
  
✓ get_revenue_by_month(months)
  → Retorna: receita por mês (últimos N meses)
  → Para: "Mostra receita de 2025"
  
✓ get_conversion_rate()
  → Retorna: leads → customers
  → Para: "Qual é minha taxa de conversão?"
  
✓ get_inventory_status()
  → Retorna: total items, items low stock, total value
  → Para: "Como está meu estoque?"
  
✓ get_task_completion_rate()
  → Retorna: % tarefas completas vs total
  → Para: "Como está meu progresso nas tarefas?"
```

---

## 🔄 Agent Decision Flow (ReAct Pattern)

```
User: "Crie um lead para João e mostre meus outros leads"
    ↓
[LLM] Analisa mensagem
    ├─ Intent: MULTI_STEP
    ├─ Tools needed: create_lead, fetch_leads
    ├─ Parameters: 
    │   └─ create_lead: name="João"
    │   └─ fetch_leads: filters={}
    └─ Confidence: 95%
    ↓
[Permission Check] 
    ├─ Usuário pode criar lead? ✓ SIM
    └─ Usuário pode ver leads? ✓ SIM
    ↓
[Tool Executor - Passo 1: create_lead]
    ├─ Valida parâmetros ✓
    ├─ Executa Supabase: INSERT
    ├─ Retorna: Lead criado (ID: 789)
    └─ Log: create_lead | success | 234ms
    ↓
[Tool Executor - Passo 2: fetch_leads]
    ├─ Valida parâmetros ✓
    ├─ Executa Supabase: SELECT
    ├─ Retorna: [João (novo), Maria, Silva]
    └─ Log: fetch_leads | success | 145ms
    ↓
[Response Formatter]
    ├─ Lead criado: "João (novo)"
    ├─ Total leads: 3
    ├─ Sugestões: 
    │   └─ "Quer adicionar email/telefone do João?"
    │   └─ "Quer converter algum lead para cliente?"
    └─ Tone: Profissional + Helpful
    ↓
User sees:
"✓ Criei o lead para João com sucesso!
 
 Você tem 3 leads ativos:
 1. João (novo)
 2. Maria (em conversação)
 3. Silva (qualificado)
 
 Quer adicionar mais informações ao João ou converter alguém para cliente?"
```

---

## 🛡️ Error Handling Strategy

```
Tool Execution Failed?
    ↓
[1] IDENTIFY ERROR
├─ Parameter validation error
├─ Supabase query error
├─ Permission denied
├─ Data not found
└─ Timeout/Network error
    ↓
[2] CATEGORIZE
├─ User Error → "Você informou um ID inválido"
├─ System Error → "Problema na base de dados, tente novamente"
├─ Permission → "Você não tem acesso a isso"
└─ Not Found → "Não encontrei o registro"
    ↓
[3] PROVIDE RECOVERY PATH
├─ For "not found": "Quer procurar por nome?"
├─ For "invalid param": "Tente com ID valido ou nome"
├─ For "permission": "Contate um admin"
└─ For "system": "Retry em 30s"
    ↓
[4] LOG FOR DEBUGGING
├─ user_id, tool_name, error_type
├─ parameters (sanitized)
├─ timestamp, duration
└─ recovery_offered
```

---

## 📋 File Structure

```
src/
├── lib/agent/
│   ├── types.ts
│   │   └─ Tool, ToolSchema, ToolResult, ToolContext
│   │
│   ├── tool-registry.ts
│   │   └─ Define todos os 25+ tools com schemas
│   │
│   ├── tool-executor.ts
│   │   └─ Execute tools safe, validate, error handle
│   │
│   ├── ai-router.ts
│   │   └─ Route para OpenAI, Ollama, Gemini, etc
│   │
│   ├── permission-checker.ts
│   │   └─ Valida se user pode usar tool
│   │
│   ├── error-handler.ts
│   │   └─ Padroniza erros, gera sugestões
│   │
│   └── logger.ts
│       └─ Log execução de tools
│
├── hooks/
│   ├── useAgentChat.ts
│   │   └─ State management do chat
│   │
│   ├── useToolExecution.ts
│   │   └─ Execute tools com loading states
│   │
│   └── useAIProvider.ts
│       └─ Switch entre providers
│
├── services/agent/
│   ├── leads-tools.ts
│   │   └─ Bind create_lead, fetch_leads, etc
│   │
│   ├── inventory-tools.ts
│   │   └─ Bind inventory operations
│   │
│   ├── tasks-tools.ts
│   │   └─ Bind task operations
│   │
│   └── finance-tools.ts
│       └─ Bind finance operations
│
└── components/
    ├── ChatInterface.tsx
    │   └─ Input + messages + settings
    │
    ├── ToolStatusIndicator.tsx
    │   └─ Show tool executing
    │
    └── AgentSettings.tsx
        └─ Select provider + configure
```

---

## ⚡ Quick Start Example

```typescript
// User types: "Crie um lead para João da Silva"

// 1. System classifies intent
const intent = "CREATE_LEAD";

// 2. Extracts parameters
const params = {
  name: "João da Silva",
  email: null,
  phone: null,
  company: null,
  status: "novo"
};

// 3. Routes to tool
const tool = toolRegistry.get("create_lead");

// 4. Validates
if (!user.hasPermission("create_lead")) throw PermissionError;
if (!params.name) throw ValidationError;

// 5. Executes
const result = await tool.execute(params, context);
// → { success: true, data: { id: 789, ... } }

// 6. Formats response
const response = formatToolResult(result, intent);
// → "✓ Criei o lead para João da Silva!"

// 7. Logs
logToolExecution({
  tool: "create_lead",
  status: "success",
  duration: 234,
  userId: user.id
});

// 8. Stores in history
addMessageToHistory({
  role: "user",
  content: "Crie um lead para João da Silva"
});
addMessageToHistory({
  role: "assistant",
  content: response,
  toolUsed: "create_lead",
  toolResult: result
});
```

---

## 🎯 Success Metrics

- ✓ All 25+ tools executable
- ✓ < 2s response time
- ✓ 99% success rate
- ✓ Smart error recovery
- ✓ Multi-provider support
- ✓ Audit trail complete
- ✓ Zero data loss
- ✓ User satisfaction > 4/5

---

**Ready to build the ENTERPRISE agent system?**

Use the full prompt at: agent-refrimix-prompt.md

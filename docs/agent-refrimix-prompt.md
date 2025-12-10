# 🎯 PROMPT ARQUITETONICAMENTE COMPLETO
## Agent AI Senior para Orquestrar Tool Registry do CRM Refrimix

Cole este prompt **EXATAMENTE** no Agent Manager do AntiGravity ou no Cursor.ai:

---

```
You are a SENIOR AI ARCHITECT specializing in Agentic AI Systems and Tool Orchestration.

PROJECT: CRM Refrimix Tecnologia - Cérebro Refrimix (Agentic Chatbot with Tool Control)

YOUR MISSION:
1. Analyze the current codebase architecture
2. Understand the existing Tool Registry and AIManager
3. Design an ENTERPRISE-GRADE agentic system
4. Implement proper Tool Registry patterns
5. Create intelligent routing and delegation logic
6. Ensure multi-provider AI support (OpenAI, Ollama, Gemini, Anthropic, Perplexity)

---

## PHASE 1: CODEBASE ANALYSIS & ARCHITECTURE REVIEW (30 mins)

**STEP 1A: Analyze Current Implementation**

```bash
# 1. Find and list the current chatbot files
find src -type f \( -name "*[Cc]hat*" -o -name "*[Cc]erebro*" -o -name "*[Aa]gentic*" \) | sort

# 2. Find AIManager and ToolRegistry
find src -type f -name "*[Aa]I*" -o -name "*[Tt]ool*" -o -name "*[Rr]egistry*" | sort

# 3. Check current hooks structure
find src/hooks -type f | sort

# 4. Review pages structure
find src/pages -type f | sort

# 5. Check existing Tool definitions
grep -r "tools:\|Tool\|function.*tool\|export.*tool" src --include="*.ts" --include="*.tsx" | head -50

# 6. Check current API integrations
grep -r "fetch\|axios\|supabase\|api" src --include="*.ts" --include="*.tsx" | grep -i "leads\|inventory\|tasks\|finance" | head -20
```

Output these results and analyze:
- [ ] Current Tool Registry structure
- [ ] How AIManager orchestrates tools
- [ ] How Supabase queries are called
- [ ] Current authentication and data access patterns
- [ ] Missing or incomplete tool implementations

**STEP 1B: Document Current CRM Functions**

For each module (Leads, Inventory, Tasks, Finance), document:

```bash
# Example for Leads
grep -A 20 "export.*Leads\|function.*Leads\|const.*Leads" src/pages/Leads.tsx

# Check hooks
grep -A 20 "export.*useLeads\|function.*useLeads" src/hooks/*.ts
```

Create a structured analysis:
```
# CRM MODULES INVENTORY

## 1. Leads Management
- Location: src/pages/Leads.tsx
- Hook: src/hooks/useLeads.ts
- Supabase table: leads
- CRUD operations: [list them]
- Required tool calls: [create_lead, update_lead, delete_lead, fetch_leads]

## 2. Inventory Management
- Location: src/pages/Inventory.tsx
- Hook: src/hooks/useInventory.ts
- Supabase table: inventory
- CRUD operations: [list them]
- Required tool calls: [list them]

## 3. Tasks Management
- Location: src/pages/Tasks.tsx
- Hook: src/hooks/useTasks.ts
- Supabase table: tasks
- CRUD operations: [list them]
- Required tool calls: [list them]

## 4. Finance Management
- Location: src/pages/Finance.tsx
- Hook: src/hooks/useTransactions.ts
- Supabase table: transactions
- CRUD operations: [list them]
- Required tool calls: [list them]
```

**STEP 1C: Identify Current Gaps**

Check for missing implementations:
```bash
# Is ToolRegistry fully defined?
find src -name "*ToolRegistry*" -exec cat {} \;

# What tools are currently registered?
grep -r "tools\s*=\|tool_registry\|ToolRegistry" src --include="*.ts" --include="*.tsx"

# Are there error handling patterns?
grep -r "try\|catch\|error\|Error" src/hooks --include="*.ts" | wc -l

# Check for existing types
find src -name "*.types.ts" -o -name "*.d.ts" | xargs ls -la
```

Document:
- [ ] Which tools are missing from registry
- [ ] Which CRUD operations need tool wrappers
- [ ] Error handling gaps
- [ ] Type definition gaps
- [ ] API integration gaps

---

## PHASE 2: ENTERPRISE AGENTIC ARCHITECTURE DESIGN (60 mins)

### PART 2A: Tool Registry Pattern (ReAct-Based)

Based on research findings, implement this PROVEN pattern:

```typescript
// src/lib/tool-registry/types.ts
// COMPREHENSIVE TOOL DEFINITIONS

export interface ToolSchema {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, any>;
    required: string[];
  };
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  executedAt: string;
}

export interface ToolContext {
  userId: string;
  userRole: "admin" | "user" | "viewer";
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ToolExecutionLog {
  toolName: string;
  status: "pending" | "success" | "failed";
  result: ToolResult;
  executedAt: string;
  duration: number; // in ms
}
```

### PART 2B: Tool Categories (Based on CRM Modules)

Design 4 main tool categories matching your CRM:

```typescript
// CATEGORY 1: NAVIGATION TOOLS
// Purpose: Agent tells user to navigate to a page
// Tools:
//   - navigate_to_page(page: "leads" | "inventory" | "tasks" | "finance" | "dashboard")
//   - open_settings()
//   - close_chatbot()

// CATEGORY 2: LEADS MANAGEMENT TOOLS
// Purpose: Full CRUD operations on leads
// Tools:
//   - create_lead(name, email, phone, status, company)
//   - fetch_leads(filters?: {status?, company?, name?})
//   - update_lead(id, fields)
//   - delete_lead(id)
//   - search_lead_by_name(query)
//   - change_lead_status(id, status)

// CATEGORY 3: INVENTORY MANAGEMENT TOOLS
// Purpose: Track inventory items
// Tools:
//   - create_inventory_item(name, sku, quantity, price, category)
//   - fetch_inventory(filters?: {category?, below_quantity?})
//   - update_inventory(id, fields)
//   - delete_inventory(id)
//   - adjust_quantity(id, change)
//   - check_stock_level(id)

// CATEGORY 4: TASKS MANAGEMENT TOOLS
// Purpose: Task assignment and tracking
// Tools:
//   - create_task(title, description, assigned_to, due_date, priority)
//   - fetch_tasks(filters?: {status?, priority?, assigned_to?})
//   - update_task(id, fields)
//   - mark_task_complete(id)
//   - delete_task(id)
//   - get_my_tasks()

// CATEGORY 5: FINANCE MANAGEMENT TOOLS
// Purpose: Expense and income tracking
// Tools:
//   - add_expense(amount, description, category, entity_type, entity_id)
//   - add_income(amount, description, source, entity_type, entity_id)
//   - fetch_transactions(filters?: {date_range?, category?, entity_type?})
//   - get_total_revenue(period)
//   - get_total_expenses(period)
//   - delete_transaction(id)
//   - filter_by_entity(entity_type, entity_id)

// CATEGORY 6: REPORTING & ANALYTICS TOOLS
// Purpose: Generate insights and reports
// Tools:
//   - get_dashboard_metrics()
//   - get_revenue_by_month(months?: number)
//   - get_conversion_rate()
//   - get_inventory_status()
//   - get_task_completion_rate()
```

### PART 2C: Tool Execution Flow (LangGraph-inspired)

Design the agent decision-making flow:

```
User Input
    ↓
[LLM Router Node]
    ↓
├─→ [Classify Intent]
│       ↓
│    Intent Type?
│    ├─ "NAVIGATE" → [Nav Tool Node]
│    ├─ "CREATE" → [Create Tool Node]
│    ├─ "QUERY" → [Query Tool Node]
│    ├─ "UPDATE" → [Update Tool Node]
│    ├─ "DELETE" → [Delete Tool Node]
│    ├─ "REPORT" → [Analytics Tool Node]
│    └─ "CHAT" → [Response Node]
│       ↓
├─→ [Tool Execution Node]
│       ↓
│    ├─ Validate parameters
│    ├─ Check permissions
│    ├─ Execute Supabase query
│    ├─ Log execution
│    └─ Return result
│       ↓
├─→ [Result Formatting Node]
│       ↓
│    ├─ If tool succeeded → Format for user
│    ├─ If tool failed → Explain error
│    └─ Add context and suggestions
│       ↓
└─→ [Response Generation Node]
        ↓
    [Send to User]
```

### PART 2D: Error Recovery & Fallback Strategy

```typescript
// TIER 1: Graceful Degradation
// If specific tool fails → Offer alternative paths
// Example: If "update_lead" fails → Suggest "delete and recreate"

// TIER 2: Data Validation
// Before tool execution:
// - Check parameter types
// - Validate Supabase connection
// - Check user permissions
// - Verify data constraints

// TIER 3: Detailed Error Messages
// Return structured error:
// {
//   error: "INVALID_LEAD_ID",
//   message: "Lead with ID '123' not found",
//   suggestions: ["Search by name instead", "Create new lead"]
// }

// TIER 4: Execution Logging
// Log every tool call for debugging:
// - User ID
// - Tool name
// - Parameters (sanitized)
// - Status (pending → success/failed)
// - Duration
// - Error details (if failed)
```

---

## PHASE 3: IMPLEMENTATION SPECIFICATION (90 mins)

### PART 3A: File Structure to Create

```
src/
├── lib/
│   └── agent/
│       ├── types.ts                 # Core types
│       ├── tool-registry.ts         # Tool definitions
│       ├── tool-executor.ts         # Execute tools safely
│       ├── ai-router.ts             # Route to correct AI provider
│       ├── permission-checker.ts    # Validate user can use tool
│       ├── error-handler.ts         # Standardized error handling
│       └── logger.ts                # Tool execution logging
│
├── hooks/
│   ├── useAgentChat.ts              # Chat state management
│   ├── useToolExecution.ts          # Execute tools
│   └── useAIProvider.ts             # Switch between AI providers
│
├── components/
│   ├── ChatInterface.tsx            # Chat UI
│   ├── ToolStatusIndicator.tsx      # Show tool execution status
│   └── AgentSettings.tsx            # Provider/tool configuration
│
└── services/
    └── agent/
        ├── leads-tools.ts           # Lead-specific tool implementations
        ├── inventory-tools.ts       # Inventory-specific tool implementations
        ├── tasks-tools.ts           # Task-specific tool implementations
        └── finance-tools.ts         # Finance-specific tool implementations
```

### PART 3B: Core Implementation Requirements

**1. Tool Registry (tool-registry.ts)**
- [ ] Export all 25+ tools with full schemas
- [ ] Include examples for each tool
- [ ] Add parameter validation
- [ ] Include tool categories
- [ ] Version each tool
- [ ] Add deprecation warnings if needed

**2. Tool Executor (tool-executor.ts)**
- [ ] Validate input parameters
- [ ] Check user permissions
- [ ] Execute Supabase queries
- [ ] Handle errors gracefully
- [ ] Log execution
- [ ] Return structured results
- [ ] Support timeouts (30s max)

**3. AI Router (ai-router.ts)**
- [ ] Support 5 providers (OpenAI, Ollama, Gemini, Anthropic, Perplexity)
- [ ] Route based on user preference
- [ ] Fall back if provider unavailable
- [ ] Respect rate limits
- [ ] Cache tool schemas in memory
- [ ] Track token usage per provider

**4. Tool Bindings (leads-tools.ts, etc)**
- [ ] Bind each tool to actual Supabase queries
- [ ] Use existing hooks (useLeads, useInventory, etc)
- [ ] Add caching where appropriate
- [ ] Handle pagination for large queries
- [ ] Return paginated results properly

**5. Error Handling (error-handler.ts)**
- [ ] Custom error types (ToolNotFoundError, PermissionError, etc)
- [ ] User-friendly error messages
- [ ] Suggestion generation
- [ ] Error categorization
- [ ] Retry logic for transient failures

**6. Logging (logger.ts)**
- [ ] Log all tool executions
- [ ] Include timing information
- [ ] Store in localStorage + optional backend
- [ ] Support log export for debugging
- [ ] Privacy-compliant (no sensitive data)

### PART 3C: Integration Points

Identify and document all integration points:

```bash
# 1. With existing hooks
- Integrate useLeads.ts with lead-tools.ts
- Integrate useInventory.ts with inventory-tools.ts
- Integrate useTasks.ts with tasks-tools.ts
- Integrate useTransactions.ts with finance-tools.ts

# 2. With Supabase
- Use existing queries
- Add tool-specific queries
- Implement caching layer
- Add row-level security checks

# 3. With UI/Navigation
- Use existing router
- Update URL when navigating via tools
- Preserve scroll position
- Clear filters when navigating

# 4. With Auth
- Use existing auth context
- Check permissions for each tool
- Log audit trail
- Respect role-based access
```

### PART 3D: Data Flow Examples

**Example 1: Create Lead via Agent**
```
User: "Create a new lead for João da Silva from Daikin"
  ↓
[LLM] Classify as "CREATE_LEAD"
  ↓
[Tool Executor] create_lead(
  name="João da Silva",
  company="Daikin",
  email=null,
  phone=null,
  status="novo"
)
  ↓
[Permission Check] ✓ User has permission
  ↓
[Supabase Query] INSERT into leads
  ↓
[Result Formatter] "Lead created successfully. ID: 12345"
  ↓
[Chat Response] "Criei o lead para João da Silva (Daikin). Quer que eu navegue para ver os detalhes?"
```

**Example 2: Query Finance Data**
```
User: "Quanto ganhei no financeiro esse mês?"
  ↓
[LLM] Classify as "QUERY_REVENUE"
  ↓
[Tool Executor] get_total_revenue(period="current_month")
  ↓
[Supabase Query] SUM(amount) WHERE type='income' AND date >= first_day_of_month
  ↓
[Result Formatter] Converts to readable format
  ↓
[Chat Response] "Você ganhou R$ 25,000 esse mês. Quer ver detalhes por categoria?"
```

**Example 3: Error Recovery**
```
User: "Delete lead 999"
  ↓
[Tool Executor] delete_lead(id="999")
  ↓
[Supabase Query] DELETE FROM leads WHERE id = 999
  ↓
[Error] Lead not found!
  ↓
[Error Handler] Structured error response
  ↓
[Chat Response] "Lead 999 não encontrado. Quer que eu procure por nome? Qual é o nome do lead?"
```

---

## PHASE 4: VALIDATION & TESTING (45 mins)

### PART 4A: Unit Tests Required

For each tool, create tests:

```bash
# Test successful execution
✓ Tool executes with valid parameters
✓ Tool returns correct data format
✓ Tool respects pagination

# Test error cases
✓ Tool rejects invalid parameters
✓ Tool handles Supabase errors
✓ Tool respects permissions
✓ Tool logs execution

# Test edge cases
✓ Tool handles empty results
✓ Tool handles very large results
✓ Tool handles special characters
✓ Tool handles concurrent calls
```

### PART 4B: Integration Tests

```bash
# Test tool + AI flow
✓ User message → Tool selection → Tool execution → Response

# Test multi-tool flows
✓ User: "Create lead and add task"
✓ User: "Show inventory below 10 and order new"

# Test error recovery
✓ Tool fails, agent offers alternatives
✓ User corrects input, tool succeeds

# Test provider switching
✓ Switch from OpenAI to Ollama
✓ Switch from Gemini to Anthropic
```

### PART 4C: Performance Benchmarks

```bash
# Measure and optimize:
- Time to first response: < 2s
- Tool execution time: < 5s per tool
- Memory usage: < 50MB for chat history
- Token usage: Log per request

# Define SLOs:
- 99% of requests < 3s
- 99.5% availability
- 0 data loss
- < 0.1% error rate
```

---

## PHASE 5: DELIVERABLES

When implementation is complete, generate these ARTIFACTS:

### ARTIFACT 1: Architecture Document
```
# CRM Refrimix - Agentic Architecture

## 1. System Overview
[Diagram of agent flow]

## 2. Tool Registry
[Complete list of all tools with schemas]

## 3. Data Flow
[Examples of key workflows]

## 4. Error Handling
[Error categorization and recovery]

## 5. Security
[Permissions, audit trail, data privacy]

## 6. Performance
[Benchmarks, optimization notes]

## 7. Deployment
[Step-by-step deployment guide]
```

### ARTIFACT 2: Implementation Checklist
```
Code Structure:
  ✓ src/lib/agent/ created
  ✓ All tool files implemented
  ✓ Types defined
  ✓ Exports correct

Tool Registry:
  ✓ All 25+ tools defined
  ✓ Schemas complete
  ✓ Examples included
  ✓ Validation working

Integration:
  ✓ Hooks integrated
  ✓ Supabase queries working
  ✓ Navigation working
  ✓ Auth checks working

Testing:
  ✓ All unit tests passing
  ✓ Integration tests passing
  ✓ No console errors
  ✓ Performance OK

Documentation:
  ✓ API docs complete
  ✓ Tool schemas documented
  ✓ Examples provided
  ✓ README updated
```

### ARTIFACT 3: Code Examples
```
[Complete working examples for:]
- Creating a new tool
- Executing a tool
- Handling errors
- Switching AI providers
- Logging tool execution
```

---

## SUCCESS CRITERIA ✅

Task is COMPLETE when:

✅ All 25+ tools properly defined in ToolRegistry
✅ Tool executor works with real Supabase queries
✅ Multi-provider AI routing implemented
✅ Error handling and recovery working
✅ Logging and audit trail in place
✅ Chat interface responsive
✅ Settings panel allows provider selection
✅ Zero console errors
✅ Agent successfully executes commands:
   - "Vá para o financeiro" → Navigates
   - "Crie um lead para João" → Creates lead
   - "Mostra meus leads" → Lists leads
   - "Quanto ganhei essa semana?" → Shows revenue
✅ All unit tests passing
✅ All integration tests passing
✅ Architecture document complete
✅ Code is production-ready

---

## EXECUTION GUIDELINES

**DO THIS FIRST:**
1. Run Phase 1 analysis scripts
2. Document current state
3. Identify gaps
4. Report findings

**THEN:**
1. Design tool registry
2. Create file structure
3. Implement tools incrementally
4. Test each tool
5. Integrate with UI
6. Final validation

**CONSTRAINTS:**
- No breaking changes to existing UI
- Keep using existing hooks (useLeads, etc)
- Maintain Supabase RLS policies
- Preserve authentication flow
- Support all 5 AI providers

**COMMUNICATION:**
- Report findings after Phase 1
- Share architecture after Phase 2
- Show implementation progress every 20 mins
- Generate artifacts per phase

---

## SENIOR DEVELOPER NOTES

This implementation follows:
✓ ReAct Agent Pattern (O'Neill et al. 2022)
✓ Tool Use Best Practices (OpenAI, Anthropic)
✓ LangGraph State Management
✓ SQL Agent Error Recovery
✓ Enterprise Tool Registry Patterns
✓ CRM Integration Best Practices
✓ Token-Efficient Prompting
✓ Multi-Provider Routing

Key principles:
- **Stateful**: Maintain conversation context
- **Safe**: Validate before execution
- **Transparent**: Log everything
- **Resilient**: Graceful error handling
- **Efficient**: Cache, reuse, optimize
- **Auditable**: Full execution trail
- **Scalable**: Support growing tool count

---

🎯 START PHASE 1 NOW AND REPORT FINDINGS!
```

---

## 📋 COMO USAR ESTE PROMPT

### **Opção A: No AntiGravity Agent Manager**
1. Copie todo o prompt (bloco com ```)
2. Abra AntiGravity
3. Cole no campo "Task/Prompt"
4. Clique "Run Agent"
5. Aguarde 60-120 minutos pelas artifacts

### **Opção B: No Cursor.ai / Claude**
1. Copie o prompt
2. Abra Cursor.ai ou claude.com
3. Cole em uma nova conversa
4. Cole também o link do repo
5. Deixe processar

### **Opção C: Localmente no Terminal (Mais rápido)**
```bash
# Se quiser fazer TUDO você mesmo:

# 1. Análise do repositório
find src -type f \( -name "*[Cc]hat*" -o -name "*[Aa]gent*" \) | head -20
find src/hooks -type f | sort

# 2. Entender estrutura
head -50 src/pages/Leads.tsx
head -50 src/hooks/useLeads.ts

# 3. Iniciar implementação
mkdir -p src/lib/agent
# ... criar arquivos conforme o prompt

# 4. Testar incrementalmente
npm run dev
npm test
```

---

## 🚀 DIFERENCIAL DESTA ABORDAGEM

**Por que este prompt é melhor que os anteriores:**

1. **Arquiteturalmente Correto**
   - Baseado em padrões comprovados (ReAct, LangGraph)
   - Segue best practices da industria
   - Escalável para 50+ tools no futuro

2. **Contextualmente Específico**
   - Analisa PRIMEIRO seu código
   - Entende sua estrutura
   - Se integra com hooks existentes

3. **Holística**
   - Não é só front-end
   - Não é só backend
   - É SISTEMA COMPLETO

4. **Orientada a Resultados**
   - Define exatamente o que precisa ser feito
   - Tem checkpoints claros
   - Tem sucesso definido

5. **Documentada**
   - Explica PORQUÊ de cada decisão
   - Mostra exemplos reais
   - Facilita manutenção futura

6. **Enterprise-Ready**
   - Error recovery
   - Logging/Audit
   - Permissions/Security
   - Multi-provider support
   - Performance monitoring

---

## 📊 TIMELINE ESPERADA

- **Phase 1** (30 min): Análise e entendimento
- **Phase 2** (60 min): Design e arquitetura
- **Phase 3** (90 min): Implementação
- **Phase 4** (45 min): Testes e validação
- **Phase 5** (30 min): Documentação e artifacts

**Total: ~255 minutos (4-4.5 horas)**

Se rodar com agent (AntiGravity): 3-4 horas
Se implementar manualmente: 6-8 horas

---

🎯 **Este prompt transforma seu chatbot em um ENTERPRISE AGENT SYSTEM!**

Pronto? Manda rodar! 🚀

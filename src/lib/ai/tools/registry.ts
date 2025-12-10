
import {
    NavigateSchema, GetUserInfoSchema,
    AddLeadSchema, ListLeadsSchema, UpdateLeadStatusSchema, GetLeadDetailsSchema,
    AddTaskSchema, ListTasksSchema, UpdateTaskStatusSchema,
    AddTransactionSchema, ListTransactionsSchema, GetFinancialKpisSchema,
    CheckInventorySchema, UpdateStockQuantitySchema, AddInventoryItemSchema,
    ListCollaboratorsSchema, AddCollaboratorSchema,
    ListQuotesSchema, ListScheduleSchema
} from './schemas';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

type ToolDefinition = {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: object;
    };
};

// Helper to convert Zod schema to OpenAI Function format
function createTool(name: string, description: string, schema: z.ZodType<any>): ToolDefinition {
    return {
        type: 'function',
        function: {
            name,
            description,
            // @ts-ignore - Zod 4 compatibility issue with zod-to-json-schema
            parameters: zodToJsonSchema(schema),
        },
    };
}

export const CRM_TOOLS: ToolDefinition[] = [
    // SYSTEM
    createTool('navigate', 'Navega para uma rota específica do sistema (/leads, /tasks, /finance, /inventory, /schedule, /quotes, /settings)', NavigateSchema),
    createTool('get_user_info', 'Retorna informações do usuário atual logado (ID, email)', GetUserInfoSchema),

    // LEADS
    createTool('add_lead', 'Adiciona/Cadastra um novo lead no CRM', AddLeadSchema),
    createTool('list_leads', 'Lista leads com filtros de status ou busca', ListLeadsSchema),
    createTool('update_lead_status', 'Atualiza o status de um lead existente (Novo -> Em Negociação -> ...)', UpdateLeadStatusSchema),
    createTool('get_lead_details', 'Busca detalhes completos de um lead por ID ou nome', GetLeadDetailsSchema),

    // TASKS
    createTool('add_task', 'Cria uma nova tarefa para um colaborador', AddTaskSchema),
    createTool('list_tasks', 'Lista tarefas pendentes ou concluídas', ListTasksSchema),
    createTool('update_task_status', 'Atualiza status de tarefa', UpdateTaskStatusSchema),

    // FINANCE
    createTool('add_transaction', 'Registra receita ou despesa financeira', AddTransactionSchema),
    createTool('list_transactions', 'Lista transações financeiras recentes', ListTransactionsSchema),
    createTool('get_financial_kpis', 'Calcula KPIs financeiros (Receita, Despesa, Saldo)', GetFinancialKpisSchema),

    // INVENTORY
    createTool('check_inventory', 'Verifica estoque de produtos', CheckInventorySchema),
    createTool('update_stock_quantity', 'Atualiza quantidade de estoque (entrada/saída)', UpdateStockQuantitySchema),
    createTool('add_inventory_item', 'Cadastra novo produto no estoque', AddInventoryItemSchema),

    // OTHERS
    createTool('list_collaborators', 'Lista membros da equipe/colaboradores', ListCollaboratorsSchema),
    createTool('add_collaborator', 'Adiciona novo colaborador', AddCollaboratorSchema),
    createTool('list_quotes', 'Lista orçamentos salvos', ListQuotesSchema),
    createTool('list_schedule', 'Lista agendamentos do calendário', ListScheduleSchema),
];

// ============================================
// CONTEXT-AWARE TOOL SELECTION FOR LLAMA3.1:8b
// ============================================

// Group tools by domain for efficient context selection
export const TOOL_SETS = {
    SYSTEM: ['navigate', 'get_user_info'], // Always available
    LEADS: ['add_lead', 'list_leads', 'update_lead_status', 'get_lead_details'],
    TASKS: ['add_task', 'list_tasks', 'update_task_status'],
    FINANCE: ['add_transaction', 'list_transactions', 'get_financial_kpis'],
    INVENTORY: ['check_inventory', 'update_stock_quantity', 'add_inventory_item'],
    TEAM: ['list_collaborators', 'add_collaborator'],
    SCHEDULE: ['list_schedule', 'list_quotes'],
};

// Select relevant tools based on context (max 7 for Llama3.1:8b)
export function getRelevantTools(context: {
    currentPath?: string;
    userIntent?: string;
}): ToolDefinition[] {
    const selectedNames = new Set(TOOL_SETS.SYSTEM);

    const { currentPath = '', userIntent = '' } = context;
    const intentLower = userIntent.toLowerCase();

    // Add tools based on current page
    if (currentPath.includes('/leads')) {
        TOOL_SETS.LEADS.forEach(t => selectedNames.add(t));
    }
    if (currentPath.includes('/tasks')) {
        TOOL_SETS.TASKS.forEach(t => selectedNames.add(t));
    }
    if (currentPath.includes('/finance')) {
        TOOL_SETS.FINANCE.forEach(t => selectedNames.add(t));
    }
    if (currentPath.includes('/inventory')) {
        TOOL_SETS.INVENTORY.forEach(t => selectedNames.add(t));
    }

    // Add tools based on user intent keywords
    if (intentLower.match(/lead|cliente|prospect/)) {
        TOOL_SETS.LEADS.forEach(t => selectedNames.add(t));
    }
    if (intentLower.match(/tarefa|task|pendente|agenda/)) {
        TOOL_SETS.TASKS.forEach(t => selectedNames.add(t));
    }
    if (intentLower.match(/financ|receita|despesa|saldo|kpi/)) {
        TOOL_SETS.FINANCE.forEach(t => selectedNames.add(t));
    }
    if (intentLower.match(/estoque|inventory|produto|item/)) {
        TOOL_SETS.INVENTORY.forEach(t => selectedNames.add(t));
    }
    if (intentLower.match(/equipe|colaborador|team/)) {
        TOOL_SETS.TEAM.forEach(t => selectedNames.add(t));
    }

    // Limit to max 7 tools for Llama3.1:8b context efficiency
    const filteredTools = CRM_TOOLS.filter(t => selectedNames.has(t.function.name));
    return filteredTools.slice(0, 7);
}


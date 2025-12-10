
import { z } from 'zod';

// ==========================================
// SYSTEM TOOLS
// ==========================================
export const NavigateSchema = z.object({
    path: z.string().describe('O caminho para navegar (ex: /leads, /tasks, /finance)'),
});

export const GetUserInfoSchema = z.object({});

// ==========================================
// LEADS TOOLS
// ==========================================
export const AddLeadSchema = z.object({
    name: z.string().min(2).describe('Nome completo do lead'),
    company: z.string().optional().describe('Nome da empresa (opcional)'),
    phone: z.string().optional().describe('Telefone ou WhatsApp'),
    email: z.string().email().optional().describe('Email de contato'),
    status: z.enum(['Novo', 'Em Negociação', 'Proposta', 'Fechado', 'Perdido']).default('Novo').describe('Status inicial do lead'),
});

export const ListLeadsSchema = z.object({
    status: z.string().optional().describe('Filtrar por status exato'),
    search: z.string().optional().describe('Buscar por nome ou empresa'),
    limit: z.number().optional().default(10),
});

export const UpdateLeadStatusSchema = z.object({
    id: z.string().uuid().describe('ID do lead'),
    status: z.string().describe('Novo status do lead'),
});

export const GetLeadDetailsSchema = z.object({
    query: z.string().describe('ID (UUID), nome ou email do lead'),
});

// ==========================================
// TASKS TOOLS
// ==========================================
export const AddTaskSchema = z.object({
    title: z.string().min(3).describe('Título da tarefa'),
    description: z.string().optional().describe('Descrição detalhada'),
    due_date: z.string().optional().describe('Data de vencimento (ISO)'),
    collaborator_name: z.string().optional().describe('Nome do responsável'),
});

export const ListTasksSchema = z.object({
    status: z.string().optional().describe('Filtrar por status (Pendente/Concluída)'),
    limit: z.number().optional().default(10),
});

export const UpdateTaskStatusSchema = z.object({
    id: z.string().uuid().describe('ID da tarefa'),
    status: z.string().describe('Novo status'),
});

// ==========================================
// FINANCE TOOLS
// ==========================================
export const AddTransactionSchema = z.object({
    description: z.string().describe('Descrição da transação'),
    amount: z.union([z.string(), z.number()]).describe('Valor da transação'),
    type: z.enum(['income', 'expense']).describe('Tipo: income (receita) ou expense (despesa)'),
    category: z.string().optional().describe('Categoria financeira'),
    date: z.string().optional().describe('Data da transação (ISO)'),
});

export const ListTransactionsSchema = z.object({
    type: z.enum(['income', 'expense']).optional(),
    limit: z.number().optional().default(10),
});

export const GetFinancialKpisSchema = z.object({});

// ==========================================
// INVENTORY TOOLS
// ==========================================
export const CheckInventorySchema = z.object({
    query: z.string().optional().describe('Nome do produto ou SKU'),
    low_stock_only: z.boolean().optional().describe('Apenas itens com estoque baixo'),
});

export const UpdateStockQuantitySchema = z.object({
    item_id: z.string().uuid().describe('ID do item'),
    quantity: z.number().positive().describe('Quantidade a mover'),
    type: z.enum(['IN', 'OUT']).describe('IN (Entrada) ou OUT (Saída)'),
    reason: z.string().optional().describe('Motivo do ajuste'),
});

export const AddInventoryItemSchema = z.object({
    name: z.string().describe('Nome do produto'),
    sku: z.string().optional().describe('SKU/Código'),
    quantity: z.number().default(0),
    price: z.number().default(0),
    min_quantity: z.number().default(5),
    category_name: z.string().optional(),
});

// ==========================================
// OTHER TOOLS
// ==========================================
export const ListCollaboratorsSchema = z.object({});
export const AddCollaboratorSchema = z.object({
    name: z.string(),
    role: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
});

export const ListQuotesSchema = z.object({
    status: z.string().optional(),
    customer: z.string().optional(),
});

export const ListScheduleSchema = z.object({
    date: z.string().optional().describe('Data específica (ISO)'),
});

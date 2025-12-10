import { supabase } from '../../supabase'; // Assumes direct import or dynamic if needed
import {
    NavigateSchema, GetUserInfoSchema,
    AddLeadSchema, ListLeadsSchema, UpdateLeadStatusSchema, GetLeadDetailsSchema,
    AddTaskSchema, ListTasksSchema,
    AddTransactionSchema, GetFinancialKpisSchema,
    CheckInventorySchema, UpdateStockQuantitySchema,
    // Schemas imported but not yet used (kept for future implementation compliance)
    // ListTransactionsSchema, AddInventoryItemSchema, ListCollaboratorsSchema, AddCollaboratorSchema, ListQuotesSchema, ListScheduleSchema
} from './schemas';

/**
 * Executes a tool by name with given arguments.
 * Uses Zod to parse arguments at runtime.
 */
export async function executeTool(name: string, args: any): Promise<any> {
    const { data: { session } } = await supabase.auth.getSession();

    switch (name) {
        // SYSTEM
        case 'navigate': {
            const { path } = NavigateSchema.parse(args);
            return { action: 'navigate', path };
        }
        case 'get_user_info': {
            GetUserInfoSchema.parse(args);
            return {
                user_id: session?.user?.id,
                email: session?.user?.email
            };
        }

        // LEADS
        case 'add_lead': {
            const params = AddLeadSchema.parse(args);
            const { data, error } = await supabase.from('leads').insert([{
                ...params,
                user_id: session?.user?.id
            }]).select().single();
            if (error) throw new Error(error.message);
            return data;
        }
        case 'list_leads': {
            const { status, search, limit } = ListLeadsSchema.parse(args);
            let query = supabase.from('leads').select('*').limit(limit).order('created_at', { ascending: false });
            if (status) query = query.eq('status', status);
            if (search) query = query.ilike('name', `%${search}%`);
            const { data, error } = await query;
            if (error) throw new Error(error.message);
            return data;
        }
        case 'update_lead_status': {
            const { id, status } = UpdateLeadStatusSchema.parse(args);
            const { error } = await supabase.from('leads').update({ status }).eq('id', id);
            if (error) throw new Error(error.message);
            return { success: true, message: 'Status atualizado' };
        }
        case 'get_lead_details': {
            const { query } = GetLeadDetailsSchema.parse(args);
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);
            let q = supabase.from('leads').select('*');
            if (isUUID) q = q.eq('id', query);
            else q = q.ilike('name', `%${query}%`);

            const { data, error } = await q.limit(1).single();
            if (error) return { message: 'Lead não encontrado' };
            return data;
        }

        // TASKS
        case 'add_task': {
            const params = AddTaskSchema.parse(args);
            const { data, error } = await supabase.from('tasks').insert([{
                ...params,
                status: 'Pendente'
            }]).select().single();
            if (error) throw new Error(error.message);
            return data;
        }
        case 'list_tasks': {
            const { status, limit } = ListTasksSchema.parse(args);
            let query = supabase.from('tasks').select('*').limit(limit);
            if (status) query = query.eq('status', status);
            const { data, error } = await query;
            if (error) throw new Error(error.message);
            return data;
        }

        // FINANCE
        case 'add_transaction': {
            const params = AddTransactionSchema.parse(args);
            const { data, error } = await supabase.from('transactions').insert([{
                description: params.description,
                amount: params.amount,
                type: params.type,
                category: params.category || 'Geral',
                transaction_date: params.date || new Date().toISOString(),
                entity: 'CNPJ'
            }]).select().single();
            if (error) throw new Error(error.message);
            return data;
        }
        case 'get_financial_kpis': {
            GetFinancialKpisSchema.parse(args);
            const { data } = await supabase.from('transactions').select('amount, type');
            const stats = (data || []).reduce((acc, tx) => {
                if (tx.type === 'income') acc.revenue += Number(tx.amount);
                if (tx.type === 'expense') acc.expenses += Number(tx.amount);
                return acc;
            }, { revenue: 0, expenses: 0, balance: 0 });
            stats.balance = stats.revenue - stats.expenses;
            return stats;
        }

        // INVENTORY
        case 'check_inventory': {
            const { query: q, low_stock_only } = CheckInventorySchema.parse(args);
            let query = supabase.from('inventory_items').select('*').limit(20);
            if (q) query = query.ilike('name', `%${q}%`);
            const { data, error } = await query;
            if (error) throw new Error(error.message);
            let res = data || [];
            if (low_stock_only) res = res.filter(i => i.quantity <= i.min_quantity);
            return res;
        }
        case 'update_stock_quantity': {
            const params = UpdateStockQuantitySchema.parse(args);
            // 1. Log movement
            await supabase.from('inventory_movements').insert({
                item_id: params.item_id,
                type: params.type,
                quantity: params.quantity,
                reason: params.reason || 'Bot Update',
                reference_type: 'MANUAL'
            });
            // 2. Get item
            const { data: item } = await supabase.from('inventory_items').select('quantity').eq('id', params.item_id).single();
            if (!item) throw new Error('Item não encontrado');
            // 3. Update
            const newQty = params.type === 'IN' ? item.quantity + params.quantity : item.quantity - params.quantity;
            const { error } = await supabase.from('inventory_items').update({ quantity: newQty }).eq('id', params.item_id);
            if (error) throw new Error(error.message);
            return { success: true, new_quantity: newQty };
        }

        // OTHERS
        case 'list_quotes': {
            return (await supabase.from('quotes').select('*').limit(5)).data;
        }
        case 'list_collaborators': {
            return (await supabase.from('collaborators').select('*').limit(10)).data;
        }
        case 'list_schedule': {
            return (await supabase.from('schedules').select('*').order('start_time').limit(5)).data;
        }

        default:
            throw new Error(`Ferramenta não implementada: ${name}`);
    }
}

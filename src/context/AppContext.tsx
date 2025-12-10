import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { QuoteData } from '@/components/quotes/QuoteDocument';
import { supabase } from '@/lib/supabase';
import { validateSupabaseConnection } from '@/lib/check-db';

// --- Tipos Existentes ---
export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  status: 'Novo' | 'Em Atendimento' | 'Orçamento' | 'Fechado';
  source: string;
  date: string;
  value: number;
  email?: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface Appointment {
  id: string;
  title: string;
  client: string;
  date: string;
  time: string;
  type: string;
  address: string;
}

export interface Equipment {
  id: string;
  leadId: string;
  name: string;
  brand: string;
  model: string;
  serial: string;
  btu: string;
  type: 'Split' | 'Cassette' | 'Piso Teto' | 'Janela' | 'VRF' | 'Chiller' | 'Multi-Split';
  installDate: string;
  frequency: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';
  nextMaintenance: string;
  qrCodeId: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  entity: 'CNPJ' | 'CPF';
}

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  team: string;
  phone: string;
  active: boolean;
}

export interface SavedQuote extends QuoteData {
  id: string;
  createdAt: string;
  totalValue: number;
}

export interface WorkTask {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  collaboratorId: string;
  type: 'Orçamento' | 'Avulsa' | 'Manutenção' | 'Instalação';
  status: 'Pendente' | 'Em Progresso' | 'Concluído' | 'Cancelado';
  quoteId?: string;
}

// --- NOVOS TIPOS: ESTOQUE ---
export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  categoryName?: string; // Join
  description: string;
  unitPrice: number;
  quantity: number;
  minQuantity: number;
  location: string;
  mainSupplierId?: string;
}

export interface InventoryCategory {
  id: string;
  name: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemName?: string; // Join
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  referenceType: string;
  reason: string;
  createdAt: string;
  userId?: string;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  leadTimeDays: number;
}

interface AppContextType {
  // Existing
  leads: Lead[];
  appointments: Appointment[];
  equipments: Equipment[];
  transactions: Transaction[];
  collaborators: Collaborator[];
  tasks: WorkTask[];
  quotes: SavedQuote[];
  loading: boolean;

  // Inventory State
  inventoryItems: InventoryItem[];
  inventoryCategories: InventoryCategory[];
  inventoryMovements: InventoryMovement[];
  suppliers: Supplier[];

  // Existing Actions
  addLead: (lead: Omit<Lead, 'id' | 'date'>) => Promise<void>;
  updateLeadStatus: (id: string, status: string) => Promise<void>;
  updateLeadStatusByName: (name: string, status: string) => Promise<boolean>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  addEquipment: (equipment: Omit<Equipment, 'id' | 'qrCodeId'>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<boolean>;
  updateTransactionEntity: (id: string, entity: 'CNPJ' | 'CPF') => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  importTransactions: (csvText: string) => void;
  addCollaborator: (collab: Omit<Collaborator, 'id' | 'active'>) => Promise<void>;
  updateCollaborator: (id: string, data: Partial<Collaborator>) => Promise<void>;
  deleteCollaborator: (id: string) => Promise<void>;
  addTask: (task: Omit<WorkTask, 'id' | 'status'>) => Promise<void>;
  updateTaskStatus: (id: string, status: WorkTask['status']) => Promise<void>;
  moveTask: (id: string, newDate: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  saveQuote: (quote: Omit<SavedQuote, 'id' | 'createdAt'>) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  exportLeadsToCSV: () => void;

  // Inventory Actions
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateInventoryStock: (itemId: string, quantity: number, type: 'IN' | 'OUT' | 'ADJUSTMENT', reason: string) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;

  kpis: {
    totalRevenue: number;
    newLeads: number;
    conversionRate: number;
    scheduledServices: number;
    activeContracts: number;
    financial: {
      balanceTotal: number;
      balanceCNPJ: number;
      balanceCPF: number;
    };
    inventory: {
      totalValue: number;
      lowStockCount: number;
    }
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Existing State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);

  // Inventory State
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryCategories, setInventoryCategories] = useState<InventoryCategory[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [loading, setLoading] = useState(true);

  // --- Fetch Data ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // Run Connection Check once
      await validateSupabaseConnection();

      const { data: leadsData } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (leadsData) setLeads(leadsData.map(l => ({ ...l, date: l.created_at })));

      const { data: schedData } = await supabase.from('schedules').select('*');
      if (schedData) setAppointments(schedData.map(s => ({ id: s.id, title: s.title, client: s.client_name, date: s.scheduled_date, time: s.scheduled_time, type: s.service_type, address: s.address })));

      const { data: equipData } = await supabase.from('equipments').select('*');
      if (equipData) setEquipments(equipData.map(e => ({ id: e.id, leadId: e.lead_id, name: e.name, brand: e.brand, model: e.model, serial: e.serial, btu: e.btu, type: e.type, installDate: e.install_date, frequency: e.frequency, nextMaintenance: e.next_maintenance, qrCodeId: e.qr_code_id })));

      const { data: transData } = await supabase.from('transactions').select('*');
      if (transData) setTransactions(transData.map(t => ({ id: t.id, date: t.transaction_date, description: t.description, amount: t.amount, type: t.type, category: t.category, entity: t.entity })));

      const { data: tasksData } = await supabase.from('tasks').select('*');
      if (tasksData) setTasks(tasksData.map(t => ({ id: t.id, title: t.title, description: t.description, date: t.due_date, startTime: t.start_time, endTime: t.end_time, collaboratorId: t.collaborator_name, type: t.type as any, status: t.status as any, quoteId: t.quote_id })));

      const { data: collabData } = await supabase.from('collaborators').select('*');
      if (collabData) setCollaborators(collabData);

      const { data: quotesData } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
      if (quotesData) setQuotes(quotesData.map(q => ({ ...q.data, id: q.id, createdAt: q.created_at, totalValue: q.total_value })));

      // --- INVENTORY FETCH ---
      const { data: catData } = await supabase.from('inventory_categories').select('*');
      if (catData) setInventoryCategories(catData);

      const { data: supData } = await supabase.from('inventory_suppliers').select('*');
      if (supData) setSuppliers(supData.map(s => ({ id: s.id, name: s.name, cnpj: s.cnpj, email: s.email, phone: s.phone, leadTimeDays: s.lead_time_days })));

      const { data: itemData } = await supabase.from('inventory_items').select('*, inventory_categories(name)');
      if (itemData) setInventoryItems(itemData.map(i => ({
        id: i.id, sku: i.sku, name: i.name, categoryId: i.category_id, categoryName: i.inventory_categories?.name,
        description: i.description, unitPrice: i.unit_price, quantity: i.quantity, minQuantity: i.min_quantity, location: i.location, mainSupplierId: i.main_supplier_id
      })));

      const { data: movData } = await supabase.from('inventory_movements').select('*, inventory_items(name)').order('created_at', { ascending: false });
      if (movData) setInventoryMovements(movData.map(m => ({
        id: m.id, itemId: m.item_id, itemName: m.inventory_items?.name, type: m.type, quantity: m.quantity, referenceType: m.reference_type, reason: m.reason, createdAt: m.created_at, userId: m.user_id
      })));

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Existing Actions (IMPLEMENTED) ---
  const addLead = async (leadData: Omit<Lead, 'id' | 'date'>) => {
    try {
      const { data, error } = await supabase.from('leads').insert([{
        name: leadData.name,
        company: leadData.company,
        phone: leadData.phone,
        email: leadData.email,
        document: leadData.document,
        address: leadData.address,
        city: leadData.city,
        state: leadData.state,
        source: leadData.source,
        status: leadData.status,
        value: leadData.value
      }]).select();
      if (error) throw error;
      if (data) {
        setLeads(prev => [{ ...data[0], date: data[0].created_at }, ...prev]);
        toast.success('Lead adicionado!');
      }
    } catch (error: any) {
      toast.error(`Erro ao adicionar lead: ${error.message}`);
    }
  };

  const updateLeadStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('leads').update({ status }).eq('id', id);
      if (error) throw error;
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: status as Lead['status'] } : l));
      toast.success('Status atualizado!');
    } catch (error: any) {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    }
  };

  const updateLeadStatusByName = async (name: string, status: string) => {
    const lead = leads.find(l => l.name.toLowerCase() === name.toLowerCase());
    if (lead) {
      await updateLeadStatus(lead.id, status);
      return true;
    }
    return false;
  };

  const addAppointment = async (apptData: Omit<Appointment, 'id'>) => {
    try {
      const { data, error } = await supabase.from('schedules').insert([{
        title: apptData.title,
        client_name: apptData.client,
        scheduled_date: apptData.date,
        scheduled_time: apptData.time,
        service_type: apptData.type,
        address: apptData.address
      }]).select();
      if (error) throw error;
      if (data) {
        setAppointments(prev => [...prev, { id: data[0].id, ...apptData }]);
        toast.success('Agendamento criado!');
      }
    } catch (error: any) {
      toast.error(`Erro ao criar agendamento: ${error.message}`);
    }
  };

  const addEquipment = async (eqData: Omit<Equipment, 'id' | 'qrCodeId'>) => {
    const qrCodeId = `EQ-${Date.now()}`;
    try {
      const { data, error } = await supabase.from('equipments').insert([{
        lead_id: eqData.leadId,
        name: eqData.name,
        brand: eqData.brand,
        model: eqData.model,
        serial: eqData.serial,
        btu: eqData.btu,
        type: eqData.type,
        install_date: eqData.installDate,
        frequency: eqData.frequency,
        next_maintenance: eqData.nextMaintenance,
        qr_code_id: qrCodeId
      }]).select();
      if (error) throw error;
      if (data) {
        setEquipments(prev => [...prev, { ...eqData, id: data[0].id, qrCodeId }]);
        toast.success('Equipamento cadastrado!');
      }
    } catch (error: any) {
      toast.error(`Erro ao cadastrar equipamento: ${error.message}`);
    }
  };

  const deleteEquipment = async (id: string) => {
    try {
      const { error } = await supabase.from('equipments').delete().eq('id', id);
      if (error) throw error;
      setEquipments(prev => prev.filter(e => e.id !== id));
      toast.success('Equipamento removido!');
    } catch (error: any) {
      toast.error(`Erro ao remover equipamento: ${error.message}`);
    }
  };

  const addTransaction = async (txData: Omit<Transaction, 'id'>) => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado para adicionar transações.');
        return false;
      }

      const { data, error } = await supabase.from('transactions').insert([{
        description: txData.description,
        amount: txData.amount,
        transaction_date: txData.date,
        category: txData.category,
        type: txData.type,
        entity: txData.entity
      }]).select();

      if (error) throw error;

      if (data && data.length > 0) {
        setTransactions(prev => [...prev, {
          id: data[0].id,
          date: data[0].transaction_date,
          description: data[0].description,
          amount: data[0].amount,
          type: data[0].type,
          category: data[0].category,
          entity: data[0].entity
        }]);
        toast.success('Transação adicionada!');
        // Return true to indicate success
        return true;
      } else {
        throw new Error('Erro ao salvar: Nenhum dado retornado. Verifique permissões.');
      }
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast.error(`Erro ao adicionar transação: ${error.message}`);
      // Return false to indicate failure
      return false;
    }
  };

  const updateTransactionEntity = async (id: string, entity: 'CNPJ' | 'CPF') => {
    try {
      const { error } = await supabase.from('transactions').update({ entity }).eq('id', id);
      if (error) throw error;
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, entity } : t));
      toast.success(`Entidade alterada para ${entity}!`);
    } catch (error: any) {
      toast.error(`Erro ao atualizar entidade: ${error.message}`);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transação excluída!');
    } catch (error: any) {
      toast.error(`Erro ao excluir transação: ${error.message}`);
    }
  };

  const importTransactions = (csvText: string) => {
    try {
      const lines = csvText.split('\n').filter(l => l.trim());
      if (lines.length < 2) {
        toast.error('CSV vazio ou inválido');
        return;
      }
      const imported: Omit<Transaction, 'id'>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(';');
        if (cols.length >= 3) {
          const amount = parseFloat(cols[1].replace(',', '.').replace(/[^\d.-]/g, ''));
          imported.push({
            date: cols[0] || new Date().toISOString().split('T')[0],
            description: cols[2] || 'Importado',
            amount: isNaN(amount) ? 0 : amount,
            type: amount < 0 ? 'expense' : 'income',
            category: 'Importação',
            entity: 'CNPJ'
          });
        }
      }
      imported.forEach(tx => addTransaction(tx));
      toast.success(`${imported.length} transações importadas!`);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      toast.error('Erro ao importar CSV');
    }
  };

  const addCollaborator = async (collab: Omit<Collaborator, 'id' | 'active'>) => {
    try {
      const { data, error } = await supabase.from('collaborators').insert([{
        name: collab.name,
        role: collab.role,
        team: collab.team,
        phone: collab.phone,
        active: true
      }]).select();
      if (error) throw error;
      if (data) {
        setCollaborators(prev => [...prev, { ...data[0], active: true }]);
        toast.success('Colaborador adicionado!');
      }
    } catch (error: any) {
      toast.error(`Erro ao adicionar colaborador: ${error.message}`);
    }
  };

  const updateCollaborator = async (id: string, data: Partial<Collaborator>) => {
    try {
      const { error } = await supabase.from('collaborators').update(data).eq('id', id);
      if (error) throw error;
      setCollaborators(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
      toast.success('Colaborador atualizado!');
    } catch (error: any) {
      toast.error(`Erro ao atualizar colaborador: ${error.message}`);
    }
  };

  const deleteCollaborator = async (id: string) => {
    try {
      const { error } = await supabase.from('collaborators').delete().eq('id', id);
      if (error) throw error;
      setCollaborators(prev => prev.filter(c => c.id !== id));
      toast.success('Colaborador removido!');
    } catch (error: any) {
      toast.error(`Erro ao remover colaborador: ${error.message}`);
    }
  };

  const addTask = async (task: Omit<WorkTask, 'id' | 'status'>) => {
    try {
      const { data, error } = await supabase.from('tasks').insert([{
        title: task.title,
        description: task.description,
        due_date: task.date,
        start_time: task.startTime,
        end_time: task.endTime,
        collaborator_name: task.collaboratorId,
        type: task.type,
        status: 'Pendente',
        quote_id: task.quoteId
      }]).select();
      if (error) throw error;
      if (data) {
        setTasks(prev => [...prev, { ...task, id: data[0].id, status: 'Pendente' }]);
        toast.success('Tarefa criada!');
      }
    } catch (error: any) {
      toast.error(`Erro ao criar tarefa: ${error.message}`);
    }
  };

  const updateTaskStatus = async (id: string, status: WorkTask['status']) => {
    try {
      const { error } = await supabase.from('tasks').update({ status }).eq('id', id);
      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      toast.success('Status da tarefa atualizado!');
    } catch (error: any) {
      toast.error(`Erro ao atualizar tarefa: ${error.message}`);
    }
  };

  const moveTask = async (id: string, newDate: string) => {
    try {
      const { error } = await supabase.from('tasks').update({ due_date: newDate }).eq('id', id);
      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === id ? { ...t, date: newDate } : t));
      toast.success('Tarefa movida!');
    } catch (error: any) {
      toast.error(`Erro ao mover tarefa: ${error.message}`);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Tarefa excluída!');
    } catch (error: any) {
      toast.error(`Erro ao excluir tarefa: ${error.message}`);
    }
  };


  // --- QUOTES ACTIONS (IMPLEMENTED) ---
  const saveQuote = async (quote: Omit<SavedQuote, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('quotes').insert([{
        quote_number: quote.quoteNumber,
        client_name: quote.clientName,
        total_value: quote.totalValue,
        data: quote // Save full JSON structure
      }]).select();

      if (error) throw error;

      if (data) {
        const newQuote: SavedQuote = {
          ...quote,
          id: data[0].id,
          createdAt: data[0].created_at,
          totalValue: data[0].total_value
        };
        setQuotes(prev => [newQuote, ...prev]);
        toast.success("Orçamento salvo com sucesso!");
      }
    } catch (error: any) {
      console.error("Error saving quote:", error);
      toast.error(`Erro ao salvar orçamento: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      const { error } = await supabase.from('quotes').delete().eq('id', id);
      if (error) throw error;
      setQuotes(prev => prev.filter(q => q.id !== id));
      toast.success("Orçamento excluído.");
    } catch (error) {
      console.error("Error deleting quote:", error);
      toast.error("Erro ao excluir orçamento.");
    }
  };

  const exportLeadsToCSV = () => { /* ... */ };

  // --- INVENTORY ACTIONS ---

  const addInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
    const { data, error } = await supabase.from('inventory_items').insert([{
      sku: item.sku, name: item.name, category_id: item.categoryId, description: item.description,
      unit_price: item.unitPrice, quantity: item.quantity, min_quantity: item.minQuantity, location: item.location, main_supplier_id: item.mainSupplierId
    }]).select('*, inventory_categories(name)');

    if (!error && data) {
      setInventoryItems(prev => [...prev, {
        id: data[0].id, sku: data[0].sku, name: data[0].name, categoryId: data[0].category_id, categoryName: data[0].inventory_categories?.name,
        description: data[0].description, unitPrice: data[0].unit_price, quantity: data[0].quantity, minQuantity: data[0].min_quantity, location: data[0].location, mainSupplierId: data[0].main_supplier_id
      }]);
      toast.success('Item adicionado ao estoque!');
    } else {
      console.error(error);
      toast.error('Erro ao adicionar item. Verifique o SKU.');
    }
  };

  const updateInventoryStock = async (itemId: string, quantity: number, type: 'IN' | 'OUT' | 'ADJUSTMENT', reason: string) => {
    const { error: movError } = await supabase.from('inventory_movements').insert([{
      item_id: itemId, type, quantity, reference_type: 'MANUAL', reason
    }]);

    if (movError) {
      toast.error('Erro ao registrar movimentação.');
      return;
    }

    const currentItem = inventoryItems.find(i => i.id === itemId);
    if (!currentItem) return;

    let newQuantity = currentItem.quantity;
    if (type === 'IN') newQuantity += quantity;
    if (type === 'OUT') newQuantity -= quantity;

    const { error: updateError } = await supabase.from('inventory_items').update({ quantity: newQuantity }).eq('id', itemId);

    if (!updateError) {
      setInventoryItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i));
      const { data: movData } = await supabase.from('inventory_movements').select('*, inventory_items(name)').order('created_at', { ascending: false }).limit(50);
      if (movData) setInventoryMovements(movData.map(m => ({
        id: m.id, itemId: m.item_id, itemName: m.inventory_items?.name, type: m.type, quantity: m.quantity, referenceType: m.reference_type, reason: m.reason, createdAt: m.created_at, userId: m.user_id
      })));
      toast.success('Estoque atualizado!');
    }
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    const { data, error } = await supabase.from('inventory_suppliers').insert([{
      name: supplier.name, cnpj: supplier.cnpj, email: supplier.email, phone: supplier.phone, lead_time_days: supplier.leadTimeDays
    }]).select();

    if (!error && data) {
      setSuppliers(prev => [...prev, { id: data[0].id, name: data[0].name, cnpj: data[0].cnpj, email: data[0].email, phone: data[0].phone, leadTimeDays: data[0].lead_time_days }]);
      toast.success('Fornecedor cadastrado!');
    }
  };

  // KPIs
  const balanceTotal = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const balanceCNPJ = transactions.filter(t => t.entity === 'CNPJ').reduce((acc, curr) => acc + curr.amount, 0);
  const balanceCPF = transactions.filter(t => t.entity === 'CPF').reduce((acc, curr) => acc + curr.amount, 0);
  const totalRevenue = leads.filter(l => l.status === 'Fechado').reduce((acc, curr) => acc + (curr.value || 0), 0);
  const conversionRate = leads.length > 0 ? ((leads.filter(l => l.status === 'Fechado').length / leads.length) * 100).toFixed(1) : 0;

  const invTotalValue = inventoryItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const lowStockCount = inventoryItems.filter(item => item.quantity <= item.minQuantity).length;

  const kpis = {
    totalRevenue,
    newLeads: leads.length,
    conversionRate: Number(conversionRate),
    scheduledServices: appointments.length,
    activeContracts: equipments.length,
    financial: { balanceTotal, balanceCNPJ, balanceCPF },
    inventory: { totalValue: invTotalValue, lowStockCount }
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      leads, appointments, equipments, transactions, collaborators, tasks, quotes, loading,
      inventoryItems, inventoryCategories, inventoryMovements, suppliers,
      addLead, updateLeadStatus, updateLeadStatusByName,
      addAppointment, addEquipment, deleteEquipment,
      addTransaction, updateTransactionEntity, deleteTransaction, importTransactions,
      addCollaborator, updateCollaborator, deleteCollaborator,
      addTask, updateTaskStatus, moveTask, deleteTask,
      saveQuote, deleteQuote,
      exportLeadsToCSV,
      addInventoryItem, updateInventoryStock, addSupplier,
      kpis
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Tipos centralizados para o CRM Refrimix

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
    number?: string;
    city?: string;
    state?: string;
    zip?: string;
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

export interface InventoryItem {
    id: string;
    sku: string;
    name: string;
    categoryId: string;
    categoryName?: string;
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
    itemName?: string;
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

// Quote types
export interface QuoteItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface QuoteData {
    quoteNumber: string;
    clientName: string;
    clientDocument?: string;
    clientPhone?: string;
    clientEmail?: string;
    clientAddress?: string;
    items: QuoteItem[];
    notes?: string;
    validityDays: number;
    paymentCondition: string;
}

export interface SavedQuote extends QuoteData {
    id: string;
    createdAt: string;
    totalValue: number;
}

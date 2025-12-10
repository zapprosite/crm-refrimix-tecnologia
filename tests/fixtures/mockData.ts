// Mock data for Leads
export const MOCK_LEADS = [
    {
        id: 'lead-1',
        user_id: 'test-user-e2e',
        name: 'Maria Silva',
        company: 'Empresa ABC',
        phone: '11999999999',
        email: 'maria@abc.com',
        status: 'Novo',
        source: 'Website',
        value: 5000,
        created_at: new Date().toISOString()
    },
    {
        id: 'lead-2',
        user_id: 'test-user-e2e',
        name: 'João Santos',
        company: 'Tech Corp',
        phone: '11888888888',
        email: 'joao@tech.com',
        status: 'Em Atendimento',
        source: 'Indicação',
        value: 10000,
        created_at: new Date().toISOString()
    }
];

// Mock data for Tasks
export const MOCK_TASKS = [
    {
        id: 'task-1',
        user_id: 'test-user-e2e',
        title: 'Ligar para cliente',
        description: 'Confirmar pedido',
        due_date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '10:00',
        collaborator_name: 'collab-1',
        type: 'Avulsa',
        status: 'Pendente',
        created_at: new Date().toISOString()
    }
];

// Mock data for Collaborators
export const MOCK_COLLABORATORS = [
    {
        id: 'collab-1',
        user_id: 'test-user-e2e',
        name: 'Carlos Técnico',
        role: 'Técnico',
        team: 'Instalação',
        phone: '11777777777',
        active: true
    }
];

// Mock data for Transactions
export const MOCK_TRANSACTIONS = [
    {
        id: 'trans-1',
        user_id: 'test-user-e2e',
        description: 'Venda de serviço',
        amount: 1500,
        transaction_date: new Date().toISOString().split('T')[0],
        type: 'income',
        category: 'Serviços',
        entity: 'CNPJ'
    }
];

// Mock data for Inventory Items
export const MOCK_INVENTORY_ITEMS = [
    {
        id: 'item-1',
        user_id: 'test-user-e2e',
        sku: 'SKU-001',
        name: 'Filtro de Ar',
        category_id: 'cat-1',
        description: 'Filtro padrão',
        unit_price: 50,
        quantity: 100,
        min_quantity: 10,
        location: 'Prateleira A',
        inventory_categories: { name: 'Peças' }
    }
];

// Mock data for Inventory Categories
export const MOCK_INVENTORY_CATEGORIES = [
    { id: 'cat-1', name: 'Peças' },
    { id: 'cat-2', name: 'Ferramentas' }
];

// Mock data for Inventory Suppliers
export const MOCK_INVENTORY_SUPPLIERS = [
    {
        id: 'sup-1',
        name: 'Fornecedor XYZ',
        cnpj: '12345678000199',
        email: 'contato@xyz.com',
        phone: '11666666666',
        lead_time_days: 5
    }
];

// Mock data for Inventory Movements
export const MOCK_INVENTORY_MOVEMENTS = [
    {
        id: 'mov-1',
        item_id: 'item-1',
        type: 'IN',
        quantity: 50,
        reference_type: 'COMPRA',
        reason: 'Reposição',
        created_at: new Date().toISOString(),
        inventory_items: { name: 'Filtro de Ar' }
    }
];

// Mock data for Quotes
export const MOCK_QUOTES = [
    {
        id: 'quote-1',
        quote_number: 'ORC-001',
        client_name: 'Cliente Teste',
        total_value: 3500,
        data: {},
        created_at: new Date().toISOString()
    }
];

// Mock data for Schedules
export const MOCK_SCHEDULES = [
    {
        id: 'sched-1',
        title: 'Visita técnica',
        client_name: 'Cliente ABC',
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '14:00',
        service_type: 'Manutenção',
        address: 'Rua Teste, 123'
    }
];

// Mock data for Equipments
export const MOCK_EQUIPMENTS = [
    {
        id: 'equip-1',
        lead_id: 'lead-1',
        name: 'Split 12000 BTU',
        brand: 'LG',
        model: 'S4-Q12JA3WA',
        serial: 'ABC123',
        btu: '12000',
        type: 'Split',
        install_date: '2024-01-15',
        frequency: 'Trimestral',
        next_maintenance: '2024-04-15',
        qr_code_id: 'EQ-123'
    }
];

import { Page } from '@playwright/test';

// ============================================
// MOCK DATA
// ============================================

export const MOCK_LEADS = [
    { id: 'lead-1', name: 'Maria Silva', company: 'ABC', phone: '11999999999', status: 'Novo', source: 'Web', value: 5000, created_at: new Date().toISOString() }
];

export const MOCK_TASKS = [
    { id: 'task-1', title: 'Tarefa Teste', due_date: new Date().toISOString().split('T')[0], start_time: '09:00', end_time: '10:00', collaborator_name: 'collab-1', type: 'Avulsa', status: 'Pendente' }
];

export const MOCK_COLLABORATORS = [
    { id: 'collab-1', name: 'Carlos Técnico', role: 'Técnico', team: 'Instalação', phone: '11777777777', active: true }
];

export const MOCK_TRANSACTIONS = [
    { id: 'trans-1', description: 'Venda', amount: 1500, transaction_date: new Date().toISOString().split('T')[0], type: 'income', category: 'Serviços', entity: 'CNPJ' }
];

export const MOCK_INVENTORY_ITEMS = [
    { id: 'item-1', sku: 'SKU-001', name: 'Filtro', category_id: 'cat-1', description: 'Filtro padrão', unit_price: 50, quantity: 100, min_quantity: 10, location: 'A', inventory_categories: { name: 'Peças' } }
];

export const MOCK_INVENTORY_CATEGORIES = [{ id: 'cat-1', name: 'Peças' }];
export const MOCK_INVENTORY_SUPPLIERS = [{ id: 'sup-1', name: 'Fornecedor XYZ', cnpj: '12345678000199', email: 'a@b.com', phone: '11666666666', lead_time_days: 5 }];
export const MOCK_INVENTORY_MOVEMENTS = [];
export const MOCK_QUOTES = [];
export const MOCK_SCHEDULES = [];
export const MOCK_EQUIPMENTS = [];

const SUPABASE_URL = 'https://hmankqmekzcmhopxrcpo.supabase.co';

// ============================================
// ISOLATED MOCK FUNCTIONS (One per module)
// ============================================

/**
 * Mock only Leads endpoints - for leads.spec.ts
 */
export async function mockLeadsEndpoints(page: Page) {
    await page.route(`${SUPABASE_URL}/rest/v1/leads*`, async route => {
        const method = route.request().method();
        if (method === 'POST') {
            const body = route.request().postDataJSON();
            await route.fulfill({ status: 201, json: [{ id: `lead-${Date.now()}`, ...body, created_at: new Date().toISOString() }] });
        } else if (method === 'HEAD') {
            await route.fulfill({ status: 200, headers: { 'content-range': '0-0/1' } });
        } else {
            await route.fulfill({ status: 200, json: MOCK_LEADS });
        }
    });
}

/**
 * Mock only Tasks endpoints - for tasks.spec.ts
 */
export async function mockTasksEndpoints(page: Page) {
    await page.route(`${SUPABASE_URL}/rest/v1/tasks*`, async route => {
        const method = route.request().method();
        if (method === 'POST') {
            const body = route.request().postDataJSON();
            await route.fulfill({ status: 201, json: [{ id: `task-${Date.now()}`, status: 'Pendente', ...body }] });
        } else {
            await route.fulfill({ status: 200, json: MOCK_TASKS });
        }
    });
    await page.route(`${SUPABASE_URL}/rest/v1/collaborators*`, async route => {
        await route.fulfill({ status: 200, json: MOCK_COLLABORATORS });
    });
    await page.route(`${SUPABASE_URL}/rest/v1/quotes*`, async route => {
        await route.fulfill({ status: 200, json: MOCK_QUOTES });
    });
}

/**
 * Mock only Finance endpoints - for finance.spec.ts
 */
export async function mockFinanceEndpoints(page: Page) {
    await page.route(`${SUPABASE_URL}/rest/v1/transactions*`, async route => {
        const method = route.request().method();
        if (method === 'POST') {
            const body = route.request().postDataJSON();
            await route.fulfill({ status: 201, json: [{ id: `trans-${Date.now()}`, ...body }] });
        } else {
            await route.fulfill({ status: 200, json: MOCK_TRANSACTIONS });
        }
    });
}

/**
 * Mock only Inventory endpoints - for inventory.spec.ts
 */
export async function mockInventoryEndpoints(page: Page) {
    await page.route(`${SUPABASE_URL}/rest/v1/inventory_items*`, async route => {
        const method = route.request().method();
        if (method === 'POST') {
            const body = route.request().postDataJSON();
            await route.fulfill({ status: 201, json: [{ id: `item-${Date.now()}`, ...body, inventory_categories: { name: 'Peças' } }] });
        } else {
            await route.fulfill({ status: 200, json: MOCK_INVENTORY_ITEMS });
        }
    });
    await page.route(`${SUPABASE_URL}/rest/v1/inventory_categories*`, async route => {
        await route.fulfill({ status: 200, json: MOCK_INVENTORY_CATEGORIES });
    });
    await page.route(`${SUPABASE_URL}/rest/v1/inventory_suppliers*`, async route => {
        await route.fulfill({ status: 200, json: MOCK_INVENTORY_SUPPLIERS });
    });
    await page.route(`${SUPABASE_URL}/rest/v1/inventory_movements*`, async route => {
        await route.fulfill({ status: 200, json: MOCK_INVENTORY_MOVEMENTS });
    });
}

/**
 * Mock ALL endpoints comprehensively - for global beforeEach
 */
export async function mockAllCRUDEndpoints(page: Page) {
    await mockLeadsEndpoints(page);
    await mockTasksEndpoints(page);
    await mockFinanceEndpoints(page);
    await mockInventoryEndpoints(page);

    // Additional tables used by Dashboard
    await page.route(`${SUPABASE_URL}/rest/v1/schedules*`, async route => {
        await route.fulfill({ status: 200, json: MOCK_SCHEDULES });
    });
    await page.route(`${SUPABASE_URL}/rest/v1/equipments*`, async route => {
        await route.fulfill({ status: 200, json: MOCK_EQUIPMENTS });
    });
}

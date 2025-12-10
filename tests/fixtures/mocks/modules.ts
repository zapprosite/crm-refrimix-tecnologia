import { Page } from '@playwright/test';
import { MOCK_LEADS } from './data/mockLeads';
import { MOCK_TASKS } from './data/mockTasks';
import { MOCK_INVENTORY } from './data/mockInventory';
import { MOCK_TRANSACTIONS } from './data/mockTransactions';

export async function mockLeadsOnly(page: Page) {
    await page.route('**/rest/v1/leads*', route => {
        const method = route.request().method();
        if (method === 'POST') {
            route.fulfill({ status: 201, json: [{ id: 999, name: 'Test Lead', status: 'Novo', created_at: new Date().toISOString() }] });
        } else {
            route.fulfill({ status: 200, json: MOCK_LEADS });
        }
    });
}

export async function mockTasksOnly(page: Page) {
    await page.route('**/rest/v1/tasks*', route => {
        const method = route.request().method();
        if (method === 'POST') {
            route.fulfill({ status: 201, json: [{ id: 999, title: 'Test Task', status: 'Pendente', created_at: new Date().toISOString() }] });
        } else {
            route.fulfill({ status: 200, json: MOCK_TASKS });
        }
    });
    // Tasks often load collaborators
    await page.route('**/rest/v1/collaborators*', route => route.fulfill({ status: 200, json: [] }));
}

export async function mockInventoryOnly(page: Page) {
    await page.route('**/rest/v1/inventory_items*', route => {
        const method = route.request().method();
        if (method === 'POST') {
            route.fulfill({ status: 201, json: [{ id: 999, product: 'Test Item', quantity: 10, created_at: new Date().toISOString() }] });
        } else {
            route.fulfill({ status: 200, json: MOCK_INVENTORY });
        }
    });
    await page.route('**/rest/v1/inventory_categories*', route => route.fulfill({ status: 200, json: [{ id: 1, name: 'General' }] }));
    await page.route('**/rest/v1/inventory_suppliers*', route => route.fulfill({ status: 200, json: [] }));
    await page.route('**/rest/v1/inventory_movements*', route => route.fulfill({ status: 200, json: [] }));
}

export async function mockFinanceOnly(page: Page) {
    await page.route('**/rest/v1/transactions*', route => {
        const method = route.request().method();
        if (method === 'POST') {
            route.fulfill({ status: 201, json: [{ id: 999, amount: 100, type: 'expense', created_at: new Date().toISOString() }] });
        } else {
            route.fulfill({ status: 200, json: MOCK_TRANSACTIONS });
        }
    });
}

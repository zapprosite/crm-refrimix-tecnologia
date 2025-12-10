import { test, expect } from '@playwright/test';

const SUPABASE_URL = 'https://hmankqmekzcmhopxrcpo.supabase.co';

test.describe('CRM Refrimix - Inventory E2E', () => {
    const mockUser = {
        id: 'test-user-id',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'williamrodriguesrefrimix@gmail.com',
        email_confirmed_at: '2023-01-01T00:00:00.000Z',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { full_name: 'Test Admin', avatar_url: '' },
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
    };

    const mockSession = {
        access_token: 'fake-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'fake-refresh-token',
        user: mockUser,
    };

    test.beforeEach(async ({ page }) => {
        // --- AUTH MOCKS ---
        await page.route(`${SUPABASE_URL}/auth/v1/token*`, async route => {
            await route.fulfill({ status: 200, json: mockSession });
        });
        await page.route(`${SUPABASE_URL}/auth/v1/user`, async route => {
            await route.fulfill({ status: 200, json: mockUser });
        });
        await page.route(`${SUPABASE_URL}/rest/v1/user_profiles*`, async route => {
            await route.fulfill({ status: 200, json: [{ approval_status: 'approved', id: mockUser.id, email: mockUser.email }] });
        });

        // --- DATA MOCKS ---
        const tables = ['leads', 'tasks', 'transactions', 'quotes', 'schedules', 'equipments', 'collaborators'];
        for (const table of tables) {
            await page.route(`${SUPABASE_URL}/rest/v1/${table}*`, async route => {
                if (route.request().method() === 'GET') await route.fulfill({ status: 200, json: [] });
                else route.continue();
            });
        }

        // Inventory-specific mocks
        await page.route(`${SUPABASE_URL}/rest/v1/inventory_items*`, async route => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 201,
                    json: [{
                        id: 'inv-1',
                        sku: 'TEST-001',
                        name: 'Compressor Teste',
                        quantity: 10,
                        min_quantity: 2,
                        unit_price: 1500,
                        inventory_categories: { name: 'Geral' }
                    }]
                });
            } else {
                await route.fulfill({ status: 200, json: [] });
            }
        });

        await page.route(`${SUPABASE_URL}/rest/v1/inventory_categories*`, async route => {
            await route.fulfill({ status: 200, json: [{ id: 'cat-1', name: 'Geral' }] });
        });

        await page.route(`${SUPABASE_URL}/rest/v1/inventory_suppliers*`, async route => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 201,
                    json: [{ id: 'sup-1', name: 'Fornecedor Teste', cnpj: '12.345.678/0001-00', lead_time_days: 7 }]
                });
            } else {
                await route.fulfill({ status: 200, json: [] });
            }
        });

        await page.route(`${SUPABASE_URL}/rest/v1/inventory_movements*`, async route => {
            await route.fulfill({ status: 200, json: [] });
        });
    });

    test('6. Inventory CRUD (Happy Path)', async ({ page }) => {
        await page.goto('/');
        await page.getByLabel('Email').fill('williamrodriguesrefrimix@gmail.com');
        await page.getByLabel('Senha').fill('123');
        await page.getByRole('button', { name: 'Entrar', exact: true }).click();

        // Navigate to Inventory page
        await page.getByRole('link', { name: 'Estoque' }).click();

        // Wait for page to load
        await expect(page.getByRole('heading', { name: 'Gestão de Estoque' })).toBeVisible();

        // Click button to add new item
        await page.getByRole('button', { name: /Novo Item/i }).click();

        // Wait for dialog to open
        await expect(page.getByRole('dialog')).toBeVisible();

        // Fill required fields using robust test IDs
        await page.getByTestId('inventory-sku-input').fill('TEST-001');
        await page.getByTestId('inventory-name-input').fill('Compressor Teste');

        // Save item
        await page.getByTestId('inventory-save-button').click();

        // Verify success toast
        await expect(page.getByText('Item adicionado ao estoque!')).toBeVisible({ timeout: 10000 });
    });
});

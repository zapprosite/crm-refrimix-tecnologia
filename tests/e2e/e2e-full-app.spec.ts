import { test, expect } from '@playwright/test';

const SUPABASE_URL = 'https://hmankqmekzcmhopxrcpo.supabase.co';

test.describe('CRM Refrimix E2E Full Flow', () => {
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

        // --- DATA MOCKS (Default Empty) ---
        const tables = ['leads', 'tasks', 'transactions', 'inventory_items', 'quotes', 'schedules', 'equipments', 'collaborators'];
        for (const table of tables) {
            await page.route(`${SUPABASE_URL}/rest/v1/${table}*`, async route => {
                if (route.request().method() === 'GET') await route.fulfill({ status: 200, json: [] });
                else route.continue();
            });
        }
    });

    test('1. Authentication Flow', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByText('CRM Refrimix Tecnologia')).toBeVisible();
        await page.getByLabel('Email').fill('williamrodriguesrefrimix@gmail.com');
        await page.getByLabel('Senha').fill('password123');
        await page.getByRole('button', { name: 'Entrar', exact: true }).click();
        await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    });

    test('2. Navigation Check', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel('Email').fill('williamrodriguesrefrimix@gmail.com');
        await page.getByLabel('Senha').fill('password123');
        await page.getByRole('button', { name: 'Entrar', exact: true }).click();
        await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();

        await page.getByRole('link', { name: 'Leads' }).click();
        await expect(page).toHaveURL('/leads');
        await expect(page.getByRole('heading', { name: 'Gestão de Leads' })).toBeVisible();

        await page.getByRole('link', { name: 'Tarefas' }).click();
        await expect(page).toHaveURL('/tasks');
        await expect(page.getByRole('heading', { name: 'Tarefas & Equipes' })).toBeVisible();

        await page.getByRole('link', { name: 'Financeiro' }).click();
        await expect(page).toHaveURL('/finance');
        await expect(page.getByRole('heading', { name: 'Fluxo de Caixa' })).toBeVisible();
    });

    test('3. Leads CRUD (Happy Path)', async ({ page }) => {
        const newLead = { id: 'l1', name: 'Test Lead', status: 'Novo', created_at: new Date().toISOString(), value: 1500 };
        await page.route(`${SUPABASE_URL}/rest/v1/leads*`, async route => {
            if (route.request().method() === 'POST') await route.fulfill({ status: 201, json: [newLead] });
            else await route.fulfill({ status: 200, json: [] });
        });

        await page.route('https://viacep.com.br/ws/*/json/', async route => {
            await route.fulfill({ status: 200, json: { logradouro: 'Rua Teste', localidade: 'São Paulo', uf: 'SP', erro: false } });
        });

        await page.goto('/');
        await page.getByLabel('Email').fill('williamrodriguesrefrimix@gmail.com');
        await page.getByLabel('Senha').fill('123');
        await page.getByRole('button', { name: 'Entrar', exact: true }).click();
        await page.getByRole('link', { name: 'Leads' }).click();
        await expect(page.getByRole('heading', { name: 'Gestão de Leads' })).toBeVisible();

        // Click button to open dialog
        await page.getByRole('button', { name: /Novo Lead/i }).click();

        // Wait for dialog to fully open
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByLabel('Nome Completo')).toBeVisible();

        // Fill ALL Required Fields
        await page.getByLabel('Nome Completo').fill('Test Lead');
        await page.getByLabel('Email').fill('test@example.com');
        await page.getByLabel('WhatsApp / Telefone').fill('(11) 99999-9999');
        await page.getByLabel('CPF / CNPJ').fill('123.456.789-01');
        await page.getByLabel('CEP').fill('01001-000');
        await page.waitForTimeout(300); // Wait for CEP autofill
        await page.getByLabel('Endereço').fill('Rua Teste');
        await page.getByLabel('Número').fill('123');
        await page.getByLabel('Cidade').fill('São Paulo');
        await page.getByLabel('UF').fill('SP');
        await page.getByLabel('Valor Estimado (R$)').fill('1500');

        await page.getByRole('button', { name: 'Salvar Lead' }).click();
        await expect(page.getByText('Lead adicionado!')).toBeVisible({ timeout: 10000 });
    });

    test('4. Tasks CRUD (Happy Path)', async ({ page }) => {
        const newTask = { id: 't1', title: 'Test Task', status: 'Pendente', due_date: new Date().toISOString() };
        await page.route(`${SUPABASE_URL}/rest/v1/tasks*`, async route => {
            if (route.request().method() === 'POST') await route.fulfill({ status: 201, json: [newTask] });
            else await route.fulfill({ status: 200, json: [] });
        });

        // MUST mock collaborators BEFORE navigating
        await page.route(`${SUPABASE_URL}/rest/v1/collaborators*`, async route => {
            await route.fulfill({ status: 200, json: [{ id: 'c1', name: 'Worker 1', role: 'Técnico' }] });
        });

        await page.goto('/');
        await page.getByLabel('Email').fill('williamrodriguesrefrimix@gmail.com');
        await page.getByLabel('Senha').fill('123');
        await page.getByRole('button', { name: 'Entrar', exact: true }).click();
        await page.getByRole('link', { name: 'Tarefas' }).click();

        // Wait for page content to load (the heading is visible)
        await expect(page.getByRole('heading', { name: 'Tarefas & Equipes' })).toBeVisible();

        // The Tasks page defaults to "Quadro Semanal" tab. Click "Nova Tarefa" button.
        await page.getByRole('button', { name: /Nova Tarefa/i }).click();

        // Wait for dialog to open
        await expect(page.getByRole('dialog')).toBeVisible();

        // Use robust Test ID
        await page.getByTestId('task-title-input').fill('Test Task');

        // Select collaborator - click the Responsável trigger via Test ID
        await page.getByTestId('task-collab-trigger').click();
        await page.getByRole('option', { name: /Worker 1/i }).click();

        await page.getByTestId('task-save-button').click();
        await expect(page.getByText('Tarefa criada!')).toBeVisible({ timeout: 10000 });
    });

    test('5. Finance CRUD (Happy Path)', async ({ page }) => {
        const newTx = { id: 'tx1', description: 'Test Income', amount: 1000, type: 'income', transaction_date: new Date().toISOString() };
        await page.route(`${SUPABASE_URL}/rest/v1/transactions*`, async route => {
            if (route.request().method() === 'POST') await route.fulfill({ status: 201, json: [newTx] });
            else await route.fulfill({ status: 200, json: [] });
        });

        await page.goto('/');
        await page.getByLabel('Email').fill('williamrodriguesrefrimix@gmail.com');
        await page.getByLabel('Senha').fill('123');
        await page.getByRole('button', { name: 'Entrar', exact: true }).click();
        await page.getByRole('link', { name: 'Financeiro' }).click();

        // Wait for page to fully load
        await expect(page.getByRole('heading', { name: 'Fluxo de Caixa' })).toBeVisible();

        // Click the button to open dialog
        await page.getByRole('button', { name: /Novo Lançamento/i }).click();

        // Wait for dialog to open
        await expect(page.getByRole('dialog')).toBeVisible();

        // Use robust Test IDs
        await page.getByTestId('finance-desc-input').fill('Test Income');
        await page.getByTestId('finance-amount-input').fill('1000');

        await page.getByTestId('finance-save-button').click();
        await expect(page.getByText('Transação adicionada!')).toBeVisible({ timeout: 10000 });
    });
});

import { test as base, Page, expect } from '@playwright/test';

// ============================================
// CONSTANTS
// ============================================

export const SUPABASE_URL = 'https://hmankqmekzcmhopxrcpo.supabase.co';
export const OLLAMA_URL = 'http://localhost:11434';

// ============================================
// MOCK DATA
// ============================================

export const mockUser = {
    id: 'test-user-e2e',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'williamrodriguesrefrimix@gmail.com',
    email_confirmed_at: '2023-01-01T00:00:00.000Z',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { full_name: 'Test Admin', avatar_url: '' },
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
};

export const mockSession = {
    access_token: 'fake-access-token-e2e',
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'fake-refresh-token-e2e',
    user: mockUser,
};

// ============================================
// AUTH MOCKING
// ============================================

export async function setupAuthMocks(page: Page) {
    // Token exchange (login)
    await page.route(`${SUPABASE_URL}/auth/v1/token*`, async route => {
        await route.fulfill({ status: 200, json: mockSession });
    });

    // Get current user
    await page.route(`${SUPABASE_URL}/auth/v1/user`, async route => {
        await route.fulfill({ status: 200, json: mockUser });
    });

    // Session validation / refresh
    await page.route(`${SUPABASE_URL}/auth/v1/session*`, async route => {
        await route.fulfill({ status: 200, json: mockSession });
    });

    // Logout
    await page.route(`${SUPABASE_URL}/auth/v1/logout`, async route => {
        await route.fulfill({ status: 204 });
    });

    // User profiles (approval check)
    await page.route(`${SUPABASE_URL}/rest/v1/user_profiles*`, async route => {
        await route.fulfill({
            status: 200,
            json: [{ approval_status: 'approved', id: mockUser.id, email: mockUser.email }]
        });
    });
}

// ============================================
// DATA MOCKING
// ============================================

export async function setupEmptyDataMocks(page: Page) {
    const tables = [
        'leads', 'tasks', 'transactions', 'inventory_items',
        'quotes', 'schedules', 'equipments', 'collaborators',
        'inventory_categories', 'inventory_suppliers', 'inventory_movements'
    ];

    for (const table of tables) {
        await page.route(`${SUPABASE_URL}/rest/v1/${table}*`, async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({ status: 200, json: [] });
            } else {
                route.continue();
            }
        });
    }
}

export async function setupViaCEPMock(page: Page) {
    await page.route('https://viacep.com.br/ws/*/json/', async route => {
        await route.fulfill({
            status: 200,
            json: {
                logradouro: 'Rua Teste',
                localidade: 'São Paulo',
                uf: 'SP',
                erro: false
            }
        });
    });
}

// ============================================
// LOGIN HELPER
// ============================================

export async function login(page: Page) {
    await page.goto('/');
    await page.getByLabel('Email').fill('williamrodriguesrefrimix@gmail.com');
    await page.getByLabel('Senha').fill('123');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10000 });
}

// ============================================
// AI RESPONSE MOCKING
// ============================================

interface AIToolCall {
    name: string;
    arguments: Record<string, unknown>;
}

export function createAIResponse(content: string | null, toolCalls?: AIToolCall[]) {
    const message: Record<string, unknown> = {
        role: 'assistant',
        content: content,
    };

    if (toolCalls && toolCalls.length > 0) {
        message.tool_calls = toolCalls.map((tc, i) => ({
            id: `call_${i}`,
            type: 'function',
            function: {
                name: tc.name,
                arguments: JSON.stringify(tc.arguments),
            },
        }));
    }

    return {
        id: 'chatcmpl-mock',
        object: 'chat.completion',
        created: Date.now(),
        model: 'llama3.1:8b-instruct-q5_K_M',
        choices: [{ index: 0, message, finish_reason: toolCalls ? 'tool_calls' : 'stop' }],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
    };
}

export async function setupAIMock(page: Page, responses: Array<{ content: string | null; toolCalls?: AIToolCall[] }>) {
    let callIndex = 0;

    // Mock Ollama OpenAI-compatible endpoint
    await page.route(`${OLLAMA_URL}/v1/chat/completions`, async route => {
        const response = responses[callIndex] || responses[responses.length - 1];
        callIndex++;
        await route.fulfill({
            status: 200,
            json: createAIResponse(response.content, response.toolCalls),
        });
    });

    // Also mock direct OpenAI if used
    await page.route('https://api.openai.com/v1/chat/completions', async route => {
        const response = responses[callIndex] || responses[responses.length - 1];
        callIndex++;
        await route.fulfill({
            status: 200,
            json: createAIResponse(response.content, response.toolCalls),
        });
    });
}

// ============================================
// CHATBOT HELPERS
// ============================================

export async function openChatbot(page: Page) {
    const fabButton = page.locator('button.fixed').first();
    await fabButton.click();
    await expect(page.getByText('Cérebro Refrimix')).toBeVisible({ timeout: 3000 });
}

export async function sendChatMessage(page: Page, message: string) {
    const input = page.locator('input[placeholder="Digite um comando..."]');
    await input.fill(message);
    await input.press('Enter');
}

export async function openChatSettings(page: Page) {
    const settingsBtn = page.locator('[class*="fixed"] button').filter({
        has: page.locator('svg.lucide-settings')
    }).last();
    await settingsBtn.click();
    await expect(page.getByText('Configuração da IA')).toBeVisible({ timeout: 3000 });
}

// ============================================
// TYPE EXTENSION FOR FIXTURES
// ============================================

import { DashboardPage } from '../pages/DashboardPage';
import { LeadsPage } from '../pages/LeadsPage';
import { TasksPage } from '../pages/TasksPage';
import { FinancePage } from '../pages/FinancePage';
import { InventoryPage } from '../pages/InventoryPage';
import { SchedulePage } from '../pages/SchedulePage';
import { ChatbotPage } from '../pages/ChatbotPage';
import { QuotesPage } from '../pages/QuotesPage';
import { CollaboratorsPage } from '../pages/CollaboratorsPage';

type CRMFixtures = {
    dashboardPage: DashboardPage;
    leadsPage: LeadsPage;
    tasksPage: TasksPage;
    financePage: FinancePage;
    inventoryPage: InventoryPage;
    schedulePage: SchedulePage;
    chatbotPage: ChatbotPage;
    quotesPage: QuotesPage;
    collaboratorsPage: CollaboratorsPage;
};

export const test = base.extend<CRMFixtures>({
    dashboardPage: async ({ page }, use) => {
        await use(new DashboardPage(page));
    },
    leadsPage: async ({ page }, use) => {
        await use(new LeadsPage(page));
    },
    tasksPage: async ({ page }, use) => {
        await use(new TasksPage(page));
    },
    financePage: async ({ page }, use) => {
        await use(new FinancePage(page));
    },
    inventoryPage: async ({ page }, use) => {
        await use(new InventoryPage(page));
    },
    schedulePage: async ({ page }, use) => {
        await use(new SchedulePage(page));
    },
    chatbotPage: async ({ page }, use) => {
        await use(new ChatbotPage(page));
    },
    quotesPage: async ({ page }, use) => {
        await use(new QuotesPage(page));
    },
    collaboratorsPage: async ({ page }, use) => {
        await use(new CollaboratorsPage(page));
    },
});

export { expect } from '@playwright/test';

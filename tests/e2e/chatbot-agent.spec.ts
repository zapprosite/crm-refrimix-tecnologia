
import { test, expect, SUPABASE_URL, OLLAMA_URL, setupAuthMocks, setupEmptyDataMocks, setupAIMock, login } from './fixtures';

test.describe('Chatbot Agent', () => {
    test.beforeEach(async ({ page }) => {
        await setupAuthMocks(page);
        await setupEmptyDataMocks(page);
        await page.goto('/');
        await page.evaluate(() => localStorage.removeItem('crm_ai_config'));
        await login(page);
    });

    test('should navigate via chat command', async ({ page, chatbotPage }) => {
        // Mock AI to return navigate tool call
        await setupAIMock(page, [{
            content: null,
            toolCalls: [{ name: 'navigate', arguments: { path: '/leads' } }]
        }, {
            content: 'Navegando para a página de Leads!',
            toolCalls: undefined
        }]);

        await chatbotPage.open();
        await chatbotPage.enviarMensagem('Vá para leads');

        // Wait for navigation
        await expect(page).toHaveURL('/leads', { timeout: 10000 });
    });

    test('should create lead via chat command', async ({ page, chatbotPage }) => {
        // Mock lead creation
        const newLead = { id: 'chat-lead-1', name: 'Lead via Chat', status: 'Novo' };
        await page.route(`${SUPABASE_URL}/rest/v1/leads*`, async route => {
            if (route.request().method() === 'POST') {
                await route.fulfill({ status: 201, json: [newLead] });
            } else {
                await route.fulfill({ status: 200, json: [] });
            }
        });

        // Mock AI to return add_lead tool call
        await setupAIMock(page, [{
            content: null,
            toolCalls: [{
                name: 'add_lead',
                arguments: { name: 'Lead via Chat', phone: '11999999999' }
            }]
        }, {
            content: 'Lead "Lead via Chat" criado com sucesso!',
            toolCalls: undefined
        }]);

        await chatbotPage.open();
        await chatbotPage.enviarMensagem('Crie um lead chamado Lead via Chat');

        // Verify success message in chat
        await expect(page.getByText(/Lead.*criado/i)).toBeVisible({ timeout: 10000 });
    });
});

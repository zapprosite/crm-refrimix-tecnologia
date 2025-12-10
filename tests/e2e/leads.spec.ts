import { test, expect, setupAuthMocks, login } from './fixtures';
import { mockLeadsOnly } from '../fixtures/mocks/modules';

test.describe('Leads CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await setupAuthMocks(page);
    });

    test('should create a new lead successfully', async ({ page, leadsPage }) => {
        // Mock only what's needed
        await mockLeadsOnly(page);

        await login(page);

        // Direct navigation as requested
        await page.goto('/leads');
        const header = page.getByRole('heading', { name: 'Gestão de Leads' }).or(page.locator('text=Leads'));
        await expect(header).toBeVisible({ timeout: 15000 });

        // Interaction
        await page.getByRole('button', { name: 'Novo Lead' }).click();
        await expect(page.getByRole('dialog')).toBeVisible();

        await page.getByLabel('Nome').first().fill('Test Lead');
        await page.getByLabel('Telefone').first().fill('11999999999');

        await page.getByRole('button', { name: /Cadastrar|Salvar/i }).click();

        await expect(page.getByText(/Lead cadastrado|sucesso/i)).toBeVisible({ timeout: 5000 });
    });
});

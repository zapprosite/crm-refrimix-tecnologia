import { test, expect, setupAuthMocks, login } from './fixtures';
import { mockFinanceOnly } from '../fixtures/mocks/modules';

test.describe('Finance CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await setupAuthMocks(page);
    });

    test('should add a new transaction successfully', async ({ page, financePage }) => {
        await mockFinanceOnly(page);

        await login(page);
        await page.goto('/finance');

        const header = page.getByText('Gestão Financeira').or(page.locator('text=Financeiro'));
        await expect(header).toBeVisible({ timeout: 15000 });

        await page.getByRole('button', { name: 'Novo Lançamento' }).click();
        await expect(page.getByRole('dialog')).toBeVisible();

        await page.getByLabel('Descrição').fill('Test Transaction');
        await page.getByLabel('Valor').fill('100');

        await page.getByTestId('finance-save-button').or(page.getByRole('button', { name: 'Salvar' })).click();

        await expect(page.getByText(/Transação adicionada|sucesso/i)).toBeVisible({ timeout: 5000 });
    });
});

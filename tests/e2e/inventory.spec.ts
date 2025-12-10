import { test, expect, setupAuthMocks, login } from './fixtures';
import { mockInventoryOnly } from '../fixtures/mocks/modules';

test.describe('Inventory CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await setupAuthMocks(page);
    });

    test('should create a new inventory item successfully', async ({ page, inventoryPage }) => {
        await mockInventoryOnly(page);

        await login(page);
        await page.goto('/inventory');

        const header = page.getByText('Gestão de Estoque').or(page.locator('text=Estoque'));
        await expect(header).toBeVisible({ timeout: 15000 });

        await page.getByRole('button', { name: 'Novo Item' }).click();
        await expect(page.getByRole('dialog')).toBeVisible();

        await page.getByLabel('Nome do Produto').or(page.getByLabel('Nome')).first().fill('Test Item');
        await page.getByLabel('SKU').fill('SKU-TEST');
        await page.getByLabel('Quantidade').first().fill('50');
        await page.getByLabel('Preço Unitário').or(page.getByLabel('Preço')).first().fill('10');

        await page.getByTestId('inventory-save-button').or(page.getByRole('button', { name: 'Cadastrar Item' })).click();

        await expect(page.getByText(/Item adicionado|sucesso/i)).toBeVisible({ timeout: 5000 });
    });
});

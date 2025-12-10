
import { test, expect, setupAuthMocks, setupEmptyDataMocks, login } from './fixtures';

test.describe('Authentication', () => {
    test.beforeEach(async ({ page }) => {
        await setupAuthMocks(page);
        await setupEmptyDataMocks(page);
    });

    test('should show login page when not authenticated', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('CRM Refrimix Tecnologia')).toBeVisible();
        await expect(page.getByLabel('Email')).toBeVisible();
        await expect(page.getByLabel('Senha')).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
        await login(page);
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10000 });
    });
});

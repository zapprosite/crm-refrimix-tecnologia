
import { test, expect, setupAuthMocks, setupEmptyDataMocks, login } from './fixtures';

test.describe('Quotes CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await setupAuthMocks(page);
        await setupEmptyDataMocks(page);
        await login(page);
    });

    test('should navigate to quotes page', async ({ quotesPage, page }) => {
        await quotesPage.goto();
        await expect(page).toHaveURL('/quotes');
    });
});

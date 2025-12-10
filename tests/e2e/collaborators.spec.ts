
import { test, expect, setupAuthMocks, setupEmptyDataMocks, login } from './fixtures';

test.describe('Collaborators CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await setupAuthMocks(page);
        await setupEmptyDataMocks(page);
        await login(page);
    });

    test('should navigate to collaborators page', async ({ collaboratorsPage, page }) => {
        await collaboratorsPage.goto();
        await expect(page).toHaveURL('/admin-users');
    });
});

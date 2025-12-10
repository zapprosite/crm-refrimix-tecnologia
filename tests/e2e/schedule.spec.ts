
import { test, expect, setupAuthMocks, setupEmptyDataMocks, login } from './fixtures';

test.describe('Schedule CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await setupAuthMocks(page);
        await setupEmptyDataMocks(page);
        await login(page);
    });

    test('should navigate to schedule page', async ({ schedulePage, page }) => {
        await schedulePage.goto();
        // Just navigation test for now as we don't have schedule implementation details
        await expect(page).toHaveURL('/schedule');
    });
});

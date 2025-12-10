import { test, expect, setupAuthMocks, login } from './fixtures';
import { mockAllCRUDEndpoints } from '../fixtures/crudMocks';

test.describe('Debug CRUD', () => {
    test('debug finance page state', async ({ page, financePage }) => {
        // Log ALL network requests
        const requests: string[] = [];
        page.on('request', req => {
            if (req.url().includes('supabase')) {
                requests.push(`[${req.method()}] ${req.url()}`);
            }
        });
        page.on('requestfailed', req => {
            console.log(`[FAILED] ${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
        });

        // Setup mocks BEFORE any navigation
        await setupAuthMocks(page);
        await mockAllCRUDEndpoints(page);

        // Login
        await login(page);

        // Navigate
        await financePage.goto();

        // Wait some time then capture state
        await page.waitForTimeout(3000);

        // Log request summary
        console.log('=== REQUESTS ===');
        requests.forEach(r => console.log(r));

        // Capture HTML
        const html = await page.content();
        const hasLoading = html.includes('Carregando');
        const hasError = html.includes('Erro');
        const hasButton = html.includes('Novo Lançamento');

        console.log('=== PAGE STATE ===');
        console.log(`Has Loading: ${hasLoading}`);
        console.log(`Has Error: ${hasError}`);
        console.log(`Has Button: ${hasButton}`);

        // Take screenshot
        await page.screenshot({ path: 'debug-finance-page.png' });

        // This will fail if button not found
        await expect(page.getByRole('button', { name: 'Novo Lançamento' })).toBeVisible({ timeout: 5000 });
    });
});

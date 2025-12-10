import { test, login, setupAuthMocks, setupEmptyDataMocks } from './fixtures';

test('debug dashboard', async ({ page }) => {
    page.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`));

    await setupAuthMocks(page);
    await setupEmptyDataMocks(page);
    await login(page);

    await page.waitForTimeout(2000);
    const html = await page.content();
    console.log('[HTML CHECK]', html.includes('chatbot-trigger') ? 'FOUND CHATBOT ID' : 'NOT FOUND CHATBOT ID');
    if (!html.includes('chatbot-trigger')) console.log(html);
});

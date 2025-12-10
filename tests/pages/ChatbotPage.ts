
import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class ChatbotPage extends BasePage {
    async open() {
        const fabButton = this.page.getByTestId('chatbot-trigger');
        await fabButton.click();
        await expect(this.page.getByText('Cérebro Refrimix')).toBeVisible({ timeout: 10000 });
    }

    async close() {
        await this.page.locator('[class*="fixed"] button').filter({ has: this.page.locator('svg.lucide-x') }).click();
        await expect(this.page.getByText('Cérebro Refrimix')).not.toBeVisible();
    }

    async enviarMensagem(text: string) {
        const input = this.page.locator('input[placeholder="Digite um comando..."]');
        await input.fill(text);
        await input.press('Enter');

        // Wait for response bubble or API?
        // Let's assume user tests will handle assertion of response
    }
}

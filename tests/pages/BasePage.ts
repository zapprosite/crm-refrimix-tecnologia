
import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async getToast(message: string) {
        return this.page.getByText(message); // Sonner toasts usually appear as text
    }

    async closeDialog() {
        // Close shadcn dialogs usually via 'X' button or clicking outside, or ensuring it's gone
        // We'll assume clicking the Close button if present, or Escape
        await this.page.keyboard.press('Escape');
    }

    async waitForToast(message: string) {
        await expect(this.page.getByText(message)).toBeVisible({ timeout: 10000 });
    }
}


import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class QuotesPage extends BasePage {
    async goto() {
        await this.page.goto('/quotes');
    }
}

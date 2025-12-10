
import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class CollaboratorsPage extends BasePage {
    async goto() {
        await this.page.goto('/admin-users');
    }

    // Add collaborator management methods
}

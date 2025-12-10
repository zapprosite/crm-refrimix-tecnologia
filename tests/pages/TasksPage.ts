
import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export interface TaskData {
    title: string;
    collaboratorName?: string;
}

export class TasksPage extends BasePage {
    async goto() {
        await this.page.goto('/tasks');
    }

    async criarTarefa(data: TaskData) {
        // Use text selector and force click to avoid toast interference
        await this.page.getByText('Nova Tarefa').click({ force: true });
        await expect(this.page.getByRole('dialog')).toBeVisible();

        // Use test-ids if available, fallback to placeholders/labels
        const titleInput = this.page.getByTestId('task-title-input').or(this.page.getByLabel('Título'));
        await titleInput.fill(data.title);

        if (data.collaboratorName) {
            // Open shadcn select
            const trigger = this.page.getByTestId('task-collab-trigger').or(this.page.locator('button[role="combobox"]'));
            await trigger.click();

            // Select option
            await this.page.getByRole('option', { name: data.collaboratorName }).click();
        }

        const responsePromise = this.page.waitForResponse(resp =>
            resp.url().includes('/tasks') && resp.request().method() === 'POST'
        );

        const saveBtn = this.page.getByTestId('task-save-button').or(this.page.getByRole('button', { name: 'Salvar' }));
        await saveBtn.click();

        await responsePromise;
        await this.waitForToast(/Tarefa.*criada/i);
    }
}

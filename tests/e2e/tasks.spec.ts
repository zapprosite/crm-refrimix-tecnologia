import { test, expect, setupAuthMocks, login } from './fixtures';
import { mockTasksOnly } from '../fixtures/mocks/modules';

test.describe('Tasks CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await setupAuthMocks(page);
    });

    test('should create a new task successfully', async ({ page, tasksPage }) => {
        await mockTasksOnly(page);

        await login(page);
        await page.goto('/tasks');

        const header = page.getByText('Tarefas & Equipes').or(page.locator('text=Tarefas'));
        await expect(header).toBeVisible({ timeout: 15000 });

        await page.getByRole('button', { name: 'Nova Tarefa' }).click();
        await expect(page.getByRole('dialog')).toBeVisible();

        await page.getByTestId('task-title-input').fill('Test Task');
        await page.getByTestId('task-collab-trigger').click();
        await page.getByRole('option').first().click();

        await page.getByTestId('task-save-button').click();

        await expect(page.getByText(/Tarefa criada|sucesso/i)).toBeVisible({ timeout: 5000 });
    });
});

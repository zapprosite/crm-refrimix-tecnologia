
import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export interface ScheduleEventData {
    title: string;
    description?: string;
    date: string;
}

export class SchedulePage extends BasePage {
    async goto() {
        await this.page.goto('/schedule');
    }

    async criarAgendamento(data: ScheduleEventData) {
        // Implement creation logic
        // await this.page.getByRole('button', { name: 'Novo Agendamento' }).click();
        // ...
    }
}


import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class DashboardPage extends BasePage {
    async goto() {
        await this.page.goto('/');
    }

    async navigateTo(section: 'Leads' | 'Tarefas' | 'Financeiro' | 'Estoque' | 'Agenda' | 'Orçamentos' | 'Colaboradores' | 'Configurações') {
        const link = this.page.getByRole('link', { name: section }).first();
        await link.click();
    }
}

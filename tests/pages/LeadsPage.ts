
import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export interface LeadData {
    name: string;
    email?: string;
    phone?: string;
    value?: string;
}

export class LeadsPage extends BasePage {
    async goto() {
        await this.page.goto('/leads');
    }

    async criarLead(data: LeadData) {
        await this.page.getByRole('button', { name: /Novo Lead/i }).click();
        await expect(this.page.getByRole('dialog')).toBeVisible();

        await this.page.getByLabel('Nome Completo').fill(data.name);
        if (data.email) await this.page.getByLabel('Email').fill(data.email);
        if (data.phone) await this.page.getByLabel('WhatsApp / Telefone').fill(data.phone);
        if (data.value) await this.page.getByLabel('Valor Estimado (R$)').fill(data.value);

        // Wait for response AND click
        const responsePromise = this.page.waitForResponse(resp =>
            resp.url().includes('/leads') && resp.request().method() === 'POST'
        );

        await this.page.getByRole('button', { name: 'Salvar Lead' }).click();
        await responsePromise;

        // Wait for Success Toast
        await this.waitForToast(/Lead.*adicionado/i);
    }

    async editarLead(name: string, newData: Partial<LeadData>) {
        // Assume list view
        await this.page.getByText(name).click();
        // Implement edit logic if drawer/modal opens
    }

    async excluirLead(name: string) {
        // Implement delete logic
    }
}

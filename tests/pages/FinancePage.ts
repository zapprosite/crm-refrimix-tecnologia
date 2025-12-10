
import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export interface TransactionData {
    description: string;
    amount: string;
    type: 'income' | 'expense';
}

export class FinancePage extends BasePage {
    async goto() {
        await this.page.goto('/finance');
    }

    async criarTransacaoReceita(data: Omit<TransactionData, 'type'>) {
        await this.criarTransacao({ ...data, type: 'income' });
    }

    async criarTransacaoDespesa(data: Omit<TransactionData, 'type'>) {
        await this.criarTransacao({ ...data, type: 'expense' });
    }

    private async criarTransacao(data: TransactionData) {
        await this.page.getByRole('button', { name: /Novo Lançamento/i }).click();
        await expect(this.page.getByRole('dialog')).toBeVisible();

        const descInput = this.page.getByTestId('finance-desc-input').or(this.page.getByLabel('Descrição'));
        await descInput.fill(data.description);

        const amountInput = this.page.getByTestId('finance-amount-input').or(this.page.getByLabel('Valor'));
        await amountInput.fill(data.amount);

        // Select type if needed (assuming defaults or tabs)
        // If there's a type selector:
        // await this.page.getByLabel('Tipo').click(); ...

        const responsePromise = this.page.waitForResponse(resp =>
            resp.url().includes('/transactions') && resp.request().method() === 'POST'
        );

        const saveBtn = this.page.getByTestId('finance-save-button').or(this.page.getByRole('button', { name: 'Salvar' }));
        await saveBtn.click();

        await responsePromise;
        await this.waitForToast(/Transação.*adicionada/i);
    }
}

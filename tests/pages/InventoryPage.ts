
import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export interface InventoryItemData {
    name: string;
    sku: string;
    quantity: string;
    price: string;
    minQuantity: string;
}

export class InventoryPage extends BasePage {
    async goto() {
        await this.page.goto('/inventory');
    }

    async criarItem(data: InventoryItemData) {
        await this.page.getByRole('button', { name: /Novo Item/i }).click();
        await expect(this.page.getByRole('dialog')).toBeVisible();

        await this.page.getByLabel('Nome do Produto').fill(data.name);
        await this.page.getByLabel('SKU').fill(data.sku);
        await this.page.getByLabel('Quantidade').fill(data.quantity);
        await this.page.getByLabel('Preço Unitário').fill(data.price);
        await this.page.getByLabel('Estoque Mínimo').fill(data.minQuantity);

        const responsePromise = this.page.waitForResponse(resp =>
            resp.url().includes('/inventory_items') && resp.request().method() === 'POST'
        );

        await this.page.getByRole('button', { name: 'Salvar' }).click();

        await responsePromise;
        await this.waitForToast(/Item.*adicionado/i);
    }
}

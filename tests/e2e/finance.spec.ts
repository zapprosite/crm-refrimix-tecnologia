import { test, expect } from '@playwright/test';

test.describe('Financeiro - Gestão CPF/CNPJ', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/finance');
        await expect(page.getByRole('heading', { name: 'Fluxo de Caixa' })).toBeVisible({ timeout: 10000 });
    });

    test('deve adicionar uma despesa com CPF', async ({ page }) => {
        // Clicar em "Novo Lançamento"
        await page.getByRole('button', { name: /Novo Lançamento/i }).click();

        // Aguardar modal abrir
        await expect(page.getByRole('dialog')).toBeVisible();

        // Preencher formulário
        await page.getByLabel('Descrição').fill('Teste Despesa CPF');
        await page.getByLabel('Valor (R$)').fill('150.50');

        // Selecionar Tipo: Despesa
        await page.locator('[data-testid="type-select"]').first().click().catch(() => {
            // Fallback: usar o select por texto
            return page.getByRole('combobox').first().click();
        });
        await page.getByRole('option', { name: /Despesa/i }).click();

        // Selecionar Entidade: CPF
        await page.getByRole('combobox').last().click();
        await page.getByRole('option', { name: /Pessoal \(CPF\)/i }).click();

        // Salvar
        await page.getByRole('button', { name: 'Salvar' }).click();

        // Verificar toast de sucesso
        await expect(page.getByText(/Transação adicionada|Lançamento adicionado/i)).toBeVisible({ timeout: 5000 });

        // Verificar item na tabela
        await expect(page.getByText('Teste Despesa CPF')).toBeVisible();
    });

    test('deve adicionar uma receita com CNPJ', async ({ page }) => {
        await page.getByRole('button', { name: /Novo Lançamento/i }).click();
        await expect(page.getByRole('dialog')).toBeVisible();

        await page.getByLabel('Descrição').fill('Teste Receita CNPJ');
        await page.getByLabel('Valor (R$)').fill('5000');

        // Tipo: Receita (padrão)
        // Entidade: CNPJ (padrão)

        await page.getByRole('button', { name: 'Salvar' }).click();

        await expect(page.getByText(/Transação adicionada|Lançamento adicionado/i)).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Teste Receita CNPJ')).toBeVisible();
    });

    test('deve alternar entidade de CPF para CNPJ', async ({ page }) => {
        // Primeiro adiciona um item
        await page.getByRole('button', { name: /Novo Lançamento/i }).click();
        await page.getByLabel('Descrição').fill('Toggle Entity Test');
        await page.getByLabel('Valor (R$)').fill('100');
        await page.getByRole('combobox').last().click();
        await page.getByRole('option', { name: /Pessoal \(CPF\)/i }).click();
        await page.getByRole('button', { name: 'Salvar' }).click();
        await expect(page.getByText(/Transação adicionada/i)).toBeVisible({ timeout: 5000 });

        // Encontrar o Badge CPF e clicar para alternar
        const row = page.locator('tr', { hasText: 'Toggle Entity Test' });
        const badge = row.locator('span', { hasText: 'CPF' }).first();
        await badge.click();

        // Verificar toast de mudança
        await expect(page.getByText(/Entidade alterada para CNPJ/i)).toBeVisible({ timeout: 5000 });

        // Verificar que agora mostra CNPJ
        await expect(row.locator('span', { hasText: 'CNPJ' })).toBeVisible();
    });

    test('deve excluir uma transação', async ({ page }) => {
        // Adicionar transação primeiro
        await page.getByRole('button', { name: /Novo Lançamento/i }).click();
        await page.getByLabel('Descrição').fill('Delete Me Test');
        await page.getByLabel('Valor (R$)').fill('50');
        await page.getByRole('button', { name: 'Salvar' }).click();
        await expect(page.getByText(/Transação adicionada/i)).toBeVisible({ timeout: 5000 });

        // Localizar a linha e clicar no botão de deletar
        const row = page.locator('tr', { hasText: 'Delete Me Test' });
        await expect(row).toBeVisible();

        // Clicar no botão de deletar (ícone TrendingDown ou trash)
        await row.getByRole('button').click();

        // Verificar toast de exclusão
        await expect(page.getByText(/Transação excluída/i)).toBeVisible({ timeout: 5000 });

        // Verificar que item sumiu
        await expect(page.getByText('Delete Me Test')).not.toBeVisible();
    });

    test('deve filtrar transações por aba CPF/CNPJ', async ({ page }) => {
        // Clicar na aba CPF
        await page.getByRole('tab', { name: 'CPF' }).click();

        // Verificar que a aba está ativa
        await expect(page.getByRole('tab', { name: 'CPF' })).toHaveAttribute('data-state', 'active');

        // Clicar na aba CNPJ
        await page.getByRole('tab', { name: 'CNPJ' }).click();
        await expect(page.getByRole('tab', { name: 'CNPJ' })).toHaveAttribute('data-state', 'active');

        // Voltar para Tudo
        await page.getByRole('tab', { name: 'Tudo' }).click();
        await expect(page.getByRole('tab', { name: 'Tudo' })).toHaveAttribute('data-state', 'active');
    });
});

import { test, expect } from '@playwright/test';

test.describe('Gestão de Leads', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve criar um novo lead com sucesso', async ({ page }) => {
    // Navegar para a página de Leads
    await page.click('a[href="/leads"]');
    await expect(page).toHaveURL('/leads');

    // Abrir o Modal de Novo Lead
    await page.getByRole('button', { name: 'Novo Lead' }).click();

    // Preencher o Formulário
    await page.getByLabel('Nome Completo').fill('Teste Automatizado');
    await page.getByLabel('WhatsApp / Telefone').fill('11999999999'); // Máscara deve formatar para (11) 99999-9999
    await page.getByLabel('Valor Estimado (R$)').fill('5000');

    // Selecionar Status (Opcional, pois já vem com default 'Novo')
    // Mas vamos testar a seleção
    // Nota: Select do Shadcn/Radix UI é um pouco diferente, geralmente clicamos no trigger
    // O label 'Status Inicial' está associado ao trigger.
    // await page.getByLabel('Status Inicial').click();
    // await page.getByRole('option', { name: 'Novo' }).click();

    // Salvar o Lead
    await page.getByRole('button', { name: 'Salvar Lead' }).click();

    // Verificar Feedback Visual (Toast)
    // O toast pode demorar um pouco para aparecer ou desaparecer
    await expect(page.getByText('Lead cadastrado com sucesso!')).toBeVisible();

    // Verificar se o Lead aparece na lista (Tabela)
    // Procuramos uma célula com o nome do lead criado
    await expect(page.getByRole('cell', { name: 'Teste Automatizado' })).toBeVisible();
    
    // Verificar formatação do valor na tabela
    // R$ 5.000,00
    await expect(page.getByRole('cell', { name: 'R$ 5.000,00' })).toBeVisible();
  });
});

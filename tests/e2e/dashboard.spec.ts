import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('deve carregar o dashboard corretamente', async ({ page }) => {
    await page.goto('/');
    
    // Usa seletor mais específico (segundo h1)
    await expect(page.locator('h1').nth(1)).toContainText('Dashboard');
    
    // Verifica se os cards principais estão visíveis
    await expect(page.getByText('Faturamento Total')).toBeVisible();
    await expect(page.getByText('Novos Leads')).toBeVisible();
    await expect(page.getByText('Taxa de Conversão')).toBeVisible();
  });

  test('deve navegar para Agendamentos', async ({ page }) => {
    await page.goto('/');
    
    // Clica no menu Agendamentos
    await page.getByRole('link', { name: 'Agendamentos' }).click();
    
    // Aguarda navegação
    await page.waitForURL('**/agendamentos');
    
    // Verifica se carregou a página (usando texto único da página)
    await expect(page.getByText('Agendamento Técnico')).toBeVisible();
  });
});

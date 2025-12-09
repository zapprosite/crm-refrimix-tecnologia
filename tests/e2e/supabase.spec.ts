import { test, expect } from '@playwright/test';

test.describe('Integração Supabase', () => {
  test('deve conectar ao Supabase sem erros', async ({ page }) => {
    // Escuta erros do console
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    
    // Aguarda um pouco para garantir que tentou conectar
    await page.waitForTimeout(2000);
    
    // Verifica se não teve erro de conexão
    const hasSupabaseError = errors.some(err => 
      err.includes('Supabase') || err.includes('fetch')
    );
    
    expect(hasSupabaseError).toBe(false);
  });
});

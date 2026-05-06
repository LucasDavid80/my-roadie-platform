import { test, expect } from '@playwright/test';

test.describe('E2E Security & Login', () => {
    
    test('deve realizar login com sucesso e acessar dashboard', async ({ page }) => {
        await page.goto('/login');
        
        // Simula login de um Admin (usando e-mail que o mock/backend aceite)
        await page.fill('input[placeholder="E-mail"]', 'admin@roadie.com');
        await page.fill('input[placeholder="Senha"]', '123456');
        
        await page.click('button:has-text("ENTRAR")');
        
        // Verifica redirecionamento
        await expect(page).toHaveURL('/dashboard');
        
        // Verifica se o ícone de Admin (Shield) aparece para o Admin
        const adminIcon = page.locator('a[href="/admin/users"]');
        await expect(adminIcon).toBeVisible();
    });

    test('deve bloquear acesso direto à página de admin para usuários comuns', async ({ page }) => {
        await page.goto('/login');
        
        // Login como Músico Comum (simulado)
        await page.fill('input[placeholder="E-mail"]', 'musico@roadie.com');
        await page.fill('input[placeholder="Senha"]', '123456');
        await page.click('button:has-text("ENTRAR")');
        
        await expect(page).toHaveURL('/dashboard');
        
        // Tenta forçar a URL de Admin
        await page.goto('/admin/users');
        
        // Deve ser redirecionado de volta ao Dashboard pela ProtectedRoute
        await expect(page).toHaveURL('/dashboard');
    });

    test('deve persistir login após o reload da página', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[placeholder="E-mail"]', 'admin@roadie.com');
        await page.fill('input[placeholder="Senha"]', '123456');
        await page.click('button:has-text("ENTRAR")');
        
        await expect(page).toHaveURL('/dashboard');
        
        // Reload
        await page.reload();
        
        // Ainda deve estar na Dashboard (não redirecionado para login)
        await expect(page).toHaveURL('/dashboard');
    });

});

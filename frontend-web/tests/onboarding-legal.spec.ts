import { test, expect } from '@playwright/test';

test.describe('Onboarding Legal - UX Block', () => {
  test('deve forçar o aceite dos termos para um usuário desatualizado e liberar a navegação', async ({ page }) => {
    // Intercepta a chamada para simular um usuário autenticado, mas com termos desatualizados/nulos
    await page.route('**/users/me', async route => {
      const json = {
        id: '123',
        email: 'test@myroadie.com',
        role: 'MUSICIAN',
        supabaseId: 'sub-123',
        isAvailable: true,
        termsAcceptedVersion: null, // Usuário ainda não aceitou os termos
      };
      await route.fulfill({ json });
    });

    await page.route('**/legal/current-version', async route => {
      await route.fulfill({ json: { version: 'v1.0.0', updatedAt: '2026-09-20' } });
    });

    // Moca a requisição de aceite
    let consentCalled = false;
    await page.route('**/users/me/consent', async route => {
      consentCalled = true;
      await route.fulfill({ status: 200, json: { success: true } });
    });

    // Injeta o token e usuário no localStorage para bypassar a tela de login
    await page.addInitScript(() => {
      localStorage.setItem('@MyRoadie:token', 'fake-jwt-token');
      localStorage.setItem('@MyRoadie:user', JSON.stringify({
        id: '123',
        email: 'test@myroadie.com',
        role: 'MUSICIAN',
        supabaseId: 'sub-123',
        isAvailable: true,
        termsAcceptedVersion: null
      }));
    });

    // Navega para a área logada
    await page.goto('/');

    // 1. Valida que o modal de UX Block apareceu
    const modalTitle = page.locator('text=Atualização dos Termos');
    await expect(modalTitle).toBeVisible();

    // Intercepta a PRÓXIMA chamada de /users/me (que acontece no fetchProfile após o aceite)
    // para retornar o estado de sucesso
    await page.route('**/users/me', async route => {
      const json = {
        id: '123',
        email: 'test@myroadie.com',
        role: 'MUSICIAN',
        supabaseId: 'sub-123',
        isAvailable: true,
        termsAcceptedVersion: 'v1.0.0', // Versão aceita
      };
      await route.fulfill({ json });
    });

    // 2. Clica para aceitar
    const btnAccept = page.locator('button', { hasText: 'Li e aceito os termos' });
    await btnAccept.click();

    // 3. Valida que o modal desapareceu após a conclusão
    await expect(modalTitle).not.toBeVisible();
    
    // 4. Confirma que a chamada para o backend foi feita
    expect(consentCalled).toBeTruthy();
  });
});

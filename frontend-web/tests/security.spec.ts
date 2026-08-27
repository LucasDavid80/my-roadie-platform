import { test, expect } from '@playwright/test';

test.describe('E2E Security & Login', () => {
    test.beforeEach(async ({ page }) => {
        let currentUser = {
            id: 'user-admin-1',
            name: 'Admin Roadie',
            email: 'admin@roadie.com',
            role: 'ADMIN' as const,
            supabaseId: 'mock-admin-supabase-id',
            isAvailable: true,
        };

        // Intercepta autenticação por senha do Supabase Auth
        await page.route('**/auth/v1/token*', async (route) => {
            const postData = route.request().postDataJSON() || {};
            const email = postData.email || 'admin@roadie.com';
            const role = email.includes('admin') ? ('ADMIN' as const) : ('MUSICIAN' as const);
            const name = role === 'ADMIN' ? 'Admin Roadie' : 'Músico Roadie';
            const supabaseId = `mock-${role.toLowerCase()}-supabase-id`;

            currentUser = {
                id: `user-${role.toLowerCase()}-1`,
                name,
                email,
                role,
                supabaseId,
                isAvailable: true,
            };

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    access_token: `mock-supabase-jwt-${role.toLowerCase()}`,
                    token_type: 'bearer',
                    expires_in: 3600,
                    expires_at: Math.floor(Date.now() / 1000) + 3600,
                    refresh_token: `mock-refresh-token-${role.toLowerCase()}`,
                    user: {
                        id: supabaseId,
                        aud: 'authenticated',
                        role: 'authenticated',
                        email,
                        email_confirmed_at: '2026-01-01T00:00:00.000Z',
                        phone: '',
                        user_metadata: {
                            name,
                            role,
                        },
                        app_metadata: {
                            provider: 'email',
                            providers: ['email'],
                        },
                        created_at: '2026-01-01T00:00:00.000Z',
                        updated_at: '2026-01-01T00:00:00.000Z',
                    },
                }),
            });
        });

        // Intercepta verificação de usuário Supabase
        await page.route('**/auth/v1/user*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: currentUser.supabaseId,
                    aud: 'authenticated',
                    role: 'authenticated',
                    email: currentUser.email,
                    email_confirmed_at: '2026-01-01T00:00:00.000Z',
                    phone: '',
                    user_metadata: {
                        name: currentUser.name,
                        role: currentUser.role,
                    },
                    app_metadata: {
                        provider: 'email',
                        providers: ['email'],
                    },
                    created_at: '2026-01-01T00:00:00.000Z',
                    updated_at: '2026-01-01T00:00:00.000Z',
                }),
            });
        });

        // Intercepta sincronização de login na API backend (/auth/login)
        await page.route('**/auth/login', async (route) => {
            const postData = route.request().postDataJSON() || {};
            const email = postData.email || currentUser.email;
            const role = email.includes('admin') ? ('ADMIN' as const) : ('MUSICIAN' as const);
            const name = role === 'ADMIN' ? 'Admin Roadie' : 'Músico Roadie';
            const supabaseId = `mock-${role.toLowerCase()}-supabase-id`;

            currentUser = {
                id: `user-${role.toLowerCase()}-1`,
                name,
                email,
                role,
                supabaseId,
                isAvailable: true,
            };

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    access_token: `mock-backend-jwt-${role.toLowerCase()}`,
                    user: currentUser,
                }),
            });
        });

        // Intercepta perfil do usuário atual na API backend (/users/me)
        await page.route('**/users/me', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(currentUser),
            });
        });

        // Intercepta listagem / criação na API backend (/users)
        await page.route('**/users', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([currentUser]),
                });
            } else {
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify(currentUser),
                });
            }
        });
    });
    
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

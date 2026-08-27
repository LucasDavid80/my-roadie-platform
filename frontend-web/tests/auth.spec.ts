import { test, expect } from '@playwright/test';

test.describe('Fluxo de Autenticação MyRoadie', () => {
    test.beforeEach(async ({ page }) => {
        let currentUser = {
            id: 'user-musician-1',
            name: 'Lucas Engenharia',
            email: 'test@myroadie.br',
            role: 'MUSICIAN' as const,
            supabaseId: 'mock-musician-supabase-id',
            isAvailable: true,
        };

        // Intercepta cadastro de novo usuário no Supabase Auth (/auth/v1/signup)
        await page.route('**/auth/v1/signup*', async (route) => {
            const postData = route.request().postDataJSON() || {};
            const email = postData.email || currentUser.email;
            const name = postData.options?.data?.name || postData.data?.name || 'Lucas Engenharia';
            const role = postData.options?.data?.role || postData.data?.role || 'MUSICIAN';
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
                }),
            });
        });

        // Intercepta autenticação por senha do Supabase Auth (/auth/v1/token)
        await page.route('**/auth/v1/token*', async (route) => {
            const postData = route.request().postDataJSON() || {};
            const email = postData.email || currentUser.email;
            const role = email.includes('admin') ? ('ADMIN' as const) : ('MUSICIAN' as const);
            const name = currentUser.name || (role === 'ADMIN' ? 'Admin Roadie' : 'Músico Roadie');
            const supabaseId = currentUser.supabaseId || `mock-${role.toLowerCase()}-supabase-id`;

            currentUser = {
                id: currentUser.id || `user-${role.toLowerCase()}-1`,
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

        // Intercepta verificação de usuário Supabase (/auth/v1/user)
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
            const name = currentUser.name || (role === 'ADMIN' ? 'Admin Roadie' : 'Músico Roadie');
            const supabaseId = currentUser.supabaseId || `mock-${role.toLowerCase()}-supabase-id`;

            currentUser = {
                id: currentUser.id || `user-${role.toLowerCase()}-1`,
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

        // Intercepta criação e listagem na API backend (/users)
        await page.route('**/users', async (route) => {
            if (route.request().method() === 'POST') {
                const postData = route.request().postDataJSON() || {};
                currentUser = {
                    ...currentUser,
                    name: postData.name || currentUser.name,
                    email: postData.email || currentUser.email,
                    role: postData.role || currentUser.role,
                    supabaseId: postData.supabaseId || currentUser.supabaseId,
                };
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify(currentUser),
                });
            } else {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([currentUser]),
                });
            }
        });
    });

    test('deve permitir que um novo músico se cadastre e acesse a dashboard', async ({ page }) => {
        // 1. Acessa a página de Registro
        await page.goto('/register');

        // 2. Preenche os dados de cadastro
        const tempEmail = `test-${Date.now()}@myroadie.br`;

        await page.fill('input[placeholder="Nome Completo"]', 'Lucas Engenharia');
        await page.fill('input[placeholder="E-mail"]', tempEmail);
        await page.fill('input[placeholder="Senha"]', '123456');
        await page.fill('input[placeholder="Confirmar Senha"]', '123456');

        // 3. Clica em Cadastrar
        // O alert() do navegador bloqueia o Playwright, vamos aceitá-lo automaticamente:
        page.on('dialog', dialog => dialog.accept());
        await page.click('button:has-text("CADASTRAR")');

        // 4. Verifica se foi redirecionado para o Login
        await expect(page).toHaveURL('/login');

        // 5. Realiza o Login com a conta recém-criada
        await page.fill('input[placeholder="E-mail"]', tempEmail);
        await page.fill('input[placeholder="Senha"]', '123456');
        await page.click('button:has-text("ENTRAR")');

        // 6. Validação Final: Chegou na Dashboard?
        await expect(page).toHaveURL('/dashboard');

        // Verifica se os StatCards estão visíveis
        const esteMesCard = page.locator('text=Este Mês');
        await expect(esteMesCard).toBeVisible();
    });
});
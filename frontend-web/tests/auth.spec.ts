import { test, expect } from '@playwright/test';

test.describe('Fluxo de Autenticação MyRoadie', () => {

    test('deve permitir que um novo músico se cadastre e acesse a dashboard', async ({ page }) => {
        // 1. Acessa a página de Registro
        await page.goto('http://localhost:3000/register');

        // 2. Preenche os dados de cadastro
        // Nota: Como estamos em memória, use um e-mail novo a cada teste se necessário
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
        await expect(page).toHaveURL('http://localhost:3000/login');

        // 5. Realiza o Login com a conta recém-criada
        await page.fill('input[placeholder="E-mail"]', tempEmail);
        await page.fill('input[placeholder="Senha"]', '123456');
        await page.click('button:has-text("ENTRAR")');

        // 6. Validação Final: Chegou na Dashboard?
        await expect(page).toHaveURL('http://localhost:3000/dashboard');

        // Verifica se os StatCards estão visíveis
        const esteMesCard = page.locator('text=Este Mês');
        await expect(esteMesCard).toBeVisible();
    });
});
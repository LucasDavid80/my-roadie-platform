import { test, expect } from '@playwright/test';

test.describe('Página de Testadores e Distribuição de Builds (/testers)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/testers');
    });

    test('deve carregar a página com header, título principal e badge de versão beta', async ({ page }) => {
        // Valida título da aba e header
        await expect(page).toHaveTitle(/Download MVP \| My Roadie — Programa de Testes/i);
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('header a:has-text("MY ROADIE")')).toBeVisible();
        await expect(page.locator('header span:has-text("Beta Fechado")')).toBeVisible();

        // Valida título principal e mensagem introdutória
        const mainHeading = page.getByRole('heading', { level: 1, name: /área de testadores/i });
        await expect(mainHeading).toBeVisible();
        await expect(page.getByText(/bem-vindo ao programa de testes fechados do/i)).toBeVisible();
        await expect(page.getByText(/esta é uma versão inicial de avaliação/i)).toBeVisible();
    });

    test('deve renderizar o card de download e instruções de instalação do Android (.APK)', async ({ page }) => {
        // Valida título e descrição do card Android
        await expect(page.getByRole('heading', { level: 2, name: /android \(\.apk\)/i })).toBeVisible();
        await expect(page.getByText(/compatível com qualquer smartphone android/i)).toBeVisible();

        // Valida estado do botão de download (link ativo ou botão em preparação)
        const downloadLink = page.locator('a:has-text("Baixar APK do My Roadie")');
        const disabledButton = page.locator('button:has-text("Release em preparação")');

        const isLinkVisible = await downloadLink.isVisible();
        if (isLinkVisible) {
            await expect(downloadLink).toHaveAttribute('download', 'my-roadie-release.apk');
            await expect(page.getByText('Instalação Direta')).toBeVisible();
        } else {
            await expect(disabledButton.first()).toBeVisible();
            await expect(disabledButton.first()).toBeDisabled();
            await expect(page.getByText(/o download do apk ainda não foi configurado neste ambiente/i)).toBeVisible();
        }

        // Valida instruções de instalação
        await expect(page.getByText(/passo a passo de instalação:/i)).toBeVisible();
        await expect(page.getByText(/permitir desta fonte/i)).toBeVisible();
        await expect(page.getByText(/o alerta de "fonte desconhecida" é um procedimento padrão/i)).toBeVisible();

        // Valida rodapé do card Android
        await expect(page.getByText('Formato: APK')).toBeVisible();
    });

    test('deve renderizar o card de download e instruções de Sideload do iOS (.IPA)', async ({ page }) => {
        // Valida título e descrição do card iOS
        await expect(page.getByRole('heading', { level: 2, name: /ios \(\.ipa\)/i })).toBeVisible();
        await expect(page.getByText(/compatível com iphone \(ios 15\.0 ou superior\) via computador/i)).toBeVisible();

        // Valida estado do botão de download (link ativo ou botão em preparação)
        const downloadLink = page.locator('a:has-text("Baixar IPA do My Roadie")');
        const disabledButton = page.locator('button:has-text("Release em preparação")');

        const isLinkVisible = await downloadLink.isVisible();
        if (isLinkVisible) {
            await expect(downloadLink).toHaveAttribute('download', 'my-roadie-release.ipa');
            await expect(page.getByText('Sideload Gratuito', { exact: true })).toBeVisible();
        } else {
            await expect(disabledButton.last()).toBeVisible();
            await expect(disabledButton.last()).toBeDisabled();
            await expect(page.getByText(/o download do ipa ainda não foi configurado neste ambiente/i)).toBeVisible();
        }

        // Valida instruções passo a passo do Sideload
        await expect(page.getByText(/passo a passo do sideload:/i)).toBeVisible();
        await expect(page.getByText(/sideloadly/i)).toBeVisible();
        await expect(page.getByText(/gerenciamento de vpn e dispositivo/i)).toBeVisible();
        await expect(page.getByText(/aviso de validade \(7 dias\):/i)).toBeVisible();

        // Valida rodapé do card iOS
        await expect(page.getByText('Validade: 7 dias (Sideload)')).toBeVisible();
    });

    test('deve renderizar a seção de GitHub Releases com link externo funcional', async ({ page }) => {
        await expect(page.getByText('Área de Releases no GitHub')).toBeVisible();
        await expect(page.getByText(/testadores técnicos e desenvolvedores podem consultar/i)).toBeVisible();

        const githubLink = page.getByRole('link', { name: /ver releases no github/i });
        await expect(githubLink).toBeVisible();
        await expect(githubLink).toHaveAttribute('target', '_blank');
        await expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
        await expect(githubLink).toHaveAttribute('href', /github\.com\/.*releases/i);
    });

    test('deve exibir o rodapé de privacidade e aviso de testadores convidados', async ({ page }) => {
        const footer = page.locator('footer');
        await expect(footer).toBeVisible();
        await expect(footer).toContainText('My Roadie Platform. Acesso exclusivo para testadores convidados.');
    });
});

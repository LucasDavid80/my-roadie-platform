import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TestersPage, { isValidDownloadUrl } from './page';
import fs from 'fs';

// Mock do módulo fs para controlar a existência de arquivos locais
vi.mock('fs', () => ({
    default: {
        existsSync: vi.fn(),
    },
    existsSync: vi.fn(),
}));

describe('TestersPage Component e isValidDownloadUrl (Spec 018 / Task T4.1)', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv };
        delete process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL;
        delete process.env.NEXT_PUBLIC_IPA_DOWNLOAD_URL;
        delete process.env.NEXT_PUBLIC_APP_VERSION;
        delete process.env.NEXT_PUBLIC_GITHUB_RELEASES_URL;

        // Mock padrao de fetch para os testes de fallback (simula resposta offline/sem release)
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            json: async () => null,
        }));
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.unstubAllGlobals();
    });

    describe('Função utilitária: isValidDownloadUrl', () => {
        it('deve retornar true para URLs remotas com protocolo HTTP ou HTTPS', () => {
            expect(isValidDownloadUrl('https://github.com/owner/repo/releases/download/v1.0.0/my-roadie-release.apk')).toBe(true);
            expect(isValidDownloadUrl('http://example.com/downloads/my-roadie-release.apk')).toBe(true);
            expect(isValidDownloadUrl('https://supabase.co/storage/v1/object/public/releases/latest/my-roadie-release.ipa')).toBe(true);
        });

        it('deve retornar false para valores nulos, indefinidos ou strings vazias', () => {
            expect(isValidDownloadUrl(null)).toBe(false);
            expect(isValidDownloadUrl(undefined)).toBe(false);
            expect(isValidDownloadUrl('')).toBe(false);
            expect(isValidDownloadUrl('   ')).toBe(false);
        });

        it('deve validar caminhos estáticos locais existentes no filesystem via fs.existsSync no servidor (SSR)', () => {
            (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
            vi.stubGlobal('window', undefined);

            expect(isValidDownloadUrl('/downloads/my-roadie-release.apk')).toBe(true);
        });

        it('deve retornar false para caminhos estáticos locais inexistentes no filesystem no servidor (SSR)', () => {
            (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);
            vi.stubGlobal('window', undefined);

            expect(isValidDownloadUrl('/downloads/my-roadie-release.apk')).toBe(false);
        });

        it('deve retornar false para strings que não são URLs remotas válidas nem caminhos locais com barra', () => {
            expect(isValidDownloadUrl('invalid-url-without-slash-or-protocol')).toBe(false);
            expect(isValidDownloadUrl('ftp://invalid-protocol.com/file.apk')).toBe(false);
        });
    });

    describe('Cenário 1: Variáveis de ambiente ausentes (Fallback / Indisponível sem 404)', () => {
        beforeEach(() => {
            (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);
        });

        it('deve renderizar o título principal, badges de "Em breve" e botões desabilitados', async () => {
            render(await TestersPage());

            expect(screen.getByRole('heading', { level: 1, name: /área de testadores/i })).toBeInTheDocument();

            // Badges de status indisponível
            const emBreveBadges = screen.getAllByText('Em breve / Aguardando build');
            expect(emBreveBadges).toHaveLength(2);

            // Botões desabilitados com texto "Release em preparação"
            const buttonsDisabled = screen.getAllByRole('button', { name: /release em preparação/i });
            expect(buttonsDisabled).toHaveLength(2);
            buttonsDisabled.forEach((button) => {
                expect(button).toBeDisabled();
                expect(button).toHaveAttribute('aria-disabled', 'true');
            });
        });

        it('deve exibir mensagens de alerta explicando que o download não está configurado neste ambiente', async () => {
            render(await TestersPage());

            expect(screen.getByText(/o download do apk ainda não foi configurado neste ambiente/i)).toBeInTheDocument();
            expect(screen.getByText(/o download do ipa ainda não foi configurado neste ambiente/i)).toBeInTheDocument();
        });

        it('deve renderizar versão padrão "MVP 1.0.0" no header e rodapés dos cards', async () => {
            render(await TestersPage());

            expect(screen.getByText(/beta fechado \(mvp 1\.0\.0\)/i)).toBeInTheDocument();
            expect(screen.getByText(/versão: mvp 1\.0\.0/i)).toBeInTheDocument();
            expect(screen.getByText(/formato: ipa \(mvp 1\.0\.0\)/i)).toBeInTheDocument();
        });

        it('deve renderizar link alternativo padrão para GitHub Releases', async () => {
            render(await TestersPage());

            const releasesLink = screen.getByRole('link', { name: /ver releases no github/i });
            expect(releasesLink).toHaveAttribute('href', 'https://github.com/LucasDavid80/my-roadie-platform/releases');
            expect(releasesLink).toHaveAttribute('target', '_blank');
        });
    });

    describe('Cenário 2: Variáveis de ambiente configuradas com URLs válidas (Download Ativo)', () => {
        const customApkUrl = 'https://github.com/LucasDavid80/my-roadie-platform/releases/download/v1.0.0/my-roadie-release.apk';
        const customIpaUrl = 'https://github.com/LucasDavid80/my-roadie-platform/releases/download/v1.0.0/my-roadie-release.ipa';
        const customVersion = 'v1.0.0-rc1';
        const customReleasesUrl = 'https://github.com/LucasDavid80/my-roadie-platform/releases/tag/v1.0.0-rc1';

        beforeEach(() => {
            process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL = customApkUrl;
            process.env.NEXT_PUBLIC_IPA_DOWNLOAD_URL = customIpaUrl;
            process.env.NEXT_PUBLIC_APP_VERSION = customVersion;
            process.env.NEXT_PUBLIC_GITHUB_RELEASES_URL = customReleasesUrl;
        });

        it('deve exibir badges de status ativo ("Instalação Direta" e "Sideload Gratuito")', async () => {
            render(await TestersPage());

            expect(screen.getByText('Instalação Direta')).toBeInTheDocument();
            expect(screen.getByText('Sideload Gratuito')).toBeInTheDocument();
            expect(screen.queryByText('Em breve / Aguardando build')).not.toBeInTheDocument();
        });

        it('deve renderizar links de download ativos com atributos href e download corretos', async () => {
            render(await TestersPage());

            const apkLink = screen.getByRole('link', { name: /baixar apk do my roadie/i });
            expect(apkLink).toHaveAttribute('href', customApkUrl);
            expect(apkLink).toHaveAttribute('download', 'my-roadie-release.apk');

            const ipaLink = screen.getByRole('link', { name: /baixar ipa do my roadie/i });
            expect(ipaLink).toHaveAttribute('href', customIpaUrl);
            expect(ipaLink).toHaveAttribute('download', 'my-roadie-release.ipa');
        });

        it('deve renderizar a versão dinâmica customizada no header e nos cards', async () => {
            render(await TestersPage());

            expect(screen.getByText(`Beta Fechado (${customVersion})`)).toBeInTheDocument();
            expect(screen.getByText(`Versão: ${customVersion}`)).toBeInTheDocument();
            expect(screen.getByText(`Formato: IPA (${customVersion})`)).toBeInTheDocument();
        });

        it('deve apontar o link de releases para a URL customizada configurada', async () => {
            render(await TestersPage());

            const releasesLink = screen.getByRole('link', { name: /ver releases no github/i });
            expect(releasesLink).toHaveAttribute('href', customReleasesUrl);
        });
    });

    describe('Cenário 3: Cenário híbrido (Apenas APK configurado, IPA indisponível)', () => {
        const customApkUrl = 'https://github.com/LucasDavid80/my-roadie-platform/releases/download/v1.0.0/my-roadie-release.apk';

        beforeEach(() => {
            (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);
            process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL = customApkUrl;
        });

        it('deve renderizar link ativo para Android e botão desabilitado para iOS', async () => {
            render(await TestersPage());

            // Android ativo
            expect(screen.getByText('Instalação Direta')).toBeInTheDocument();
            const apkLink = screen.getByRole('link', { name: /baixar apk do my roadie/i });
            expect(apkLink).toHaveAttribute('href', customApkUrl);

            // iOS indisponível
            expect(screen.queryByText('Sideload Gratuito')).not.toBeInTheDocument();
            expect(screen.getByText('Em breve / Aguardando build')).toBeInTheDocument();
            const ipaButton = screen.getByRole('button', { name: /release em preparação/i });
            expect(ipaButton).toBeDisabled();
            expect(screen.getByText(/o download do ipa ainda não foi configurado neste ambiente/i)).toBeInTheDocument();
        });
    });

    describe('Cenário 4: Instruções de instalação e notas informativas', () => {
        it('deve renderizar as instruções passo a passo para Android e iOS', async () => {
            render(await TestersPage());

            // Instruções Android
            expect(screen.getByText(/passo a passo de instalação:/i)).toBeInTheDocument();
            expect(screen.getByText(/permitir desta fonte/i)).toBeInTheDocument();
            expect(screen.getByText(/fonte desconhecida/i)).toBeInTheDocument();

            // Instruções iOS Sideload
            expect(screen.getByText(/passo a passo do sideload:/i)).toBeInTheDocument();
            expect(screen.getByText(/sideloadly/i)).toBeInTheDocument();
            expect(screen.getByText(/gerenciamento de vpn e dispositivo/i)).toBeInTheDocument();
            expect(screen.getByText(/aviso de validade \(7 dias\):/i)).toBeInTheDocument();
        });
    });

    describe('Cenário 5: Integração com GitHub Releases API (Automação de Versão e Assets)', () => {
        it('deve extrair automaticamente a tag da release e links de download dos assets do GitHub', async () => {
            vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    tag_name: 'v1.1.0',
                    name: 'Release v1.1.0',
                    assets: [
                        {
                            name: 'my-roadie-release.apk',
                            browser_download_url: 'https://github.com/LucasDavid80/my-roadie-platform/releases/download/v1.1.0/my-roadie-release.apk',
                        },
                        {
                            name: 'my-roadie-release.ipa',
                            browser_download_url: 'https://github.com/LucasDavid80/my-roadie-platform/releases/download/v1.1.0/my-roadie-release.ipa',
                        },
                    ],
                }),
            }));

            render(await TestersPage());

            // Verifica que a versão exibida é a tag da release do GitHub
            expect(screen.getByText(/beta fechado \(v1\.1\.0\)/i)).toBeInTheDocument();
            expect(screen.getByText(/versão: v1\.1\.0/i)).toBeInTheDocument();
            expect(screen.getByText(/formato: ipa \(v1\.1\.0\)/i)).toBeInTheDocument();

            // Verifica que os botões de download utilizam os assets retornados da release
            const apkLink = screen.getByRole('link', { name: /baixar apk do my roadie/i });
            expect(apkLink).toHaveAttribute('href', 'https://github.com/LucasDavid80/my-roadie-platform/releases/download/v1.1.0/my-roadie-release.apk');

            const ipaLink = screen.getByRole('link', { name: /baixar ipa do my roadie/i });
            expect(ipaLink).toHaveAttribute('href', 'https://github.com/LucasDavid80/my-roadie-platform/releases/download/v1.1.0/my-roadie-release.ipa');

            // Ambos os status devem estar ativos
            expect(screen.getByText('Instalação Direta')).toBeInTheDocument();
            expect(screen.getByText('Sideload Gratuito')).toBeInTheDocument();
        });

        it('deve recuperar com resiliência via fallback quando a API do GitHub rejeitar com erro de rede', async () => {
            vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
            (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);

            render(await TestersPage());

            // Deve usar fallback padrão "MVP 1.0.0" sem quebrar a tela
            expect(screen.getByText(/beta fechado \(mvp 1\.0\.0\)/i)).toBeInTheDocument();
            expect(screen.getByRole('heading', { level: 1, name: /área de testadores/i })).toBeInTheDocument();
        });
    });
});

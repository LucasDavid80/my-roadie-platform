import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Smartphone, Apple, ShieldAlert, Sparkles, Download, Clock, AlertCircle, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Download MVP | My Roadie — Programa de Testes',
  description: 'Página de distribuição e instruções de instalação do app My Roadie para testadores convidados.',
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Valida se uma URL de download é válida para disponibilização aos testadores.
 * Considera válidas URLs remotas (HTTP/HTTPS) ou caminhos estáticos locais existentes no filesystem.
 */
export function isValidDownloadUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // URLs remotas HTTP ou HTTPS (ex: GitHub Releases, Supabase Storage)
  if (/^https?:\/\/.+/i.test(trimmed)) {
    return true;
  }

  // Caminhos relativos para assets estáticos em public/
  if (trimmed.startsWith('/')) {
    try {
      if (typeof window === 'undefined') {
        const relativePath = trimmed.replace(/^\//, '');
        const directPath = path.join(process.cwd(), 'public', relativePath);
        const nestedPath = path.join(process.cwd(), 'frontend-web', 'public', relativePath);
        return fs.existsSync(directPath) || fs.existsSync(nestedPath);
      }
    } catch {
      return false;
    }
  }

  return false;
}

interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
}

export interface GitHubReleaseData {
  tag_name: string;
  name?: string;
  assets?: GitHubReleaseAsset[];
}

/**
 * Consulta a última release pública publicada no GitHub via ISR (cache de 1 hora no Edge).
 * Retorna null em caso de indisponibilidade ou falha de rede, acionando os fallbacks locais.
 */
export async function getLatestGitHubRelease(): Promise<GitHubReleaseData | null> {
  try {
    const res = await fetch(
      'https://api.github.com/repos/LucasDavid80/my-roadie-platform/releases/latest',
      {
        next: { revalidate: 3600 },
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'my-roadie-platform-testers',
        },
      }
    );
    if (!res.ok) return null;
    return (await res.json()) as GitHubReleaseData;
  } catch {
    return null;
  }
}

export default async function TestersPage() {
  const latestRelease = await getLatestGitHubRelease();

  const releaseApkAsset = latestRelease?.assets?.find((a) =>
    a.name.toLowerCase().endsWith('.apk')
  );
  const releaseIpaAsset = latestRelease?.assets?.find((a) =>
    a.name.toLowerCase().endsWith('.ipa')
  );

  const rawApkUrl =
    process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL ||
    releaseApkAsset?.browser_download_url ||
    '/downloads/my-roadie-release.apk';

  const rawIpaUrl =
    process.env.NEXT_PUBLIC_IPA_DOWNLOAD_URL ||
    releaseIpaAsset?.browser_download_url ||
    '/downloads/my-roadie-release.ipa';

  const appVersion =
    latestRelease?.tag_name ||
    process.env.NEXT_PUBLIC_APP_VERSION ||
    'MVP 1.0.0';

  const githubReleasesUrl =
    process.env.NEXT_PUBLIC_GITHUB_RELEASES_URL ||
    'https://github.com/LucasDavid80/my-roadie-platform/releases';

  const isApkAvailable = isValidDownloadUrl(rawApkUrl);
  const isIpaAvailable = isValidDownloadUrl(rawIpaUrl);

  const apkDownloadUrl = isApkAvailable ? rawApkUrl : undefined;
  const ipaDownloadUrl = isIpaAvailable ? rawIpaUrl : undefined;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      {/* Header simplificado sem links de navegação pública */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12 bg-white border-b border-zinc-100">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/assets/logo.svg" alt="My Roadie Logo" width={36} height={36} className="w-9 h-9" />
          <span className="text-lg font-bold text-black tracking-tight">MY ROADIE</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-50 text-primary text-xs font-semibold rounded-full border border-amber-200/60 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Beta Fechado ({appVersion})
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-black tracking-tight">
            Área de Testadores
          </h1>
          <p className="text-zinc-600 text-base md:text-lg leading-relaxed">
            Bem-vindo ao programa de testes fechados do <strong>My Roadie</strong>. 
            Escolha sua plataforma abaixo para baixar e instalar o aplicativo no seu dispositivo.
          </p>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left text-sm text-amber-900 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Esta é uma versão inicial de avaliação. Seu feedback é fundamental para identificarmos melhorias e correções antes do lançamento público.
            </p>
          </div>
        </div>

        {/* Cards de Plataforma */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Android */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Smartphone className="w-6 h-6" />
                </div>
                {isApkAvailable ? (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                    Instalação Direta
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Em breve / Aguardando build
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">Android (.APK)</h2>
                <p className="text-zinc-600 text-sm mt-1">
                  Compatível com qualquer smartphone Android (versão 8.0 ou superior).
                </p>
              </div>

              {/* Botão de Download ou Estado Indisponível */}
              <div className="pt-2">
                {isApkAvailable ? (
                  <>
                    <a
                      href={apkDownloadUrl}
                      download="my-roadie-release.apk"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 hover:scale-[1.01]"
                    >
                      <Download className="w-5 h-5" />
                      <span>Baixar APK do My Roadie</span>
                    </a>
                    <p className="text-[11px] text-zinc-400 text-center mt-1.5">
                      Arquivo .apk de release oficial para testes
                    </p>
                  </>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-100 text-zinc-400 font-bold rounded-xl border border-zinc-200 cursor-not-allowed"
                    >
                      <Clock className="w-5 h-5 text-zinc-400" />
                      <span>Release em preparação</span>
                    </button>
                    <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-left text-xs text-amber-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p>
                        O download do APK ainda não foi configurado neste ambiente. A versão oficial estará disponível assim que a build for publicada.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Instruções de Instalação e Fontes Desconhecidas */}
              <div className="pt-2 space-y-3">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Passo a passo de instalação:
                </h3>
                <ol className="space-y-2.5 text-xs text-zinc-600">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <span>Toque no botão acima para iniciar o download do arquivo <strong>.apk</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <span>
                      Abra o arquivo baixado. Se o sistema exibir um aviso de segurança, clique em <strong>Configurações</strong> e ative a opção <strong>&quot;Permitir desta fonte&quot;</strong> (ou <em>Fontes desconhecidas</em>).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <span>Confirme a instalação e abra o aplicativo <strong>My Roadie</strong> para começar a testar.</span>
                  </li>
                </ol>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] text-zinc-500 leading-relaxed">
                  💡 <strong>Nota:</strong> O alerta de &quot;fonte desconhecida&quot; é um procedimento padrão do Android para aplicativos instalados fora da Google Play Store durante fases de teste fechado.
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
              <span>Formato: APK</span>
              <span>Versão: {appVersion}</span>
            </div>
          </div>

          {/* Card iOS */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-900">
                  <Apple className="w-6 h-6" />
                </div>
                {isIpaAvailable ? (
                  <span className="px-2.5 py-1 bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-full border border-zinc-200">
                    Sideload Gratuito
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Em breve / Aguardando build
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">iOS (.IPA)</h2>
                <p className="text-zinc-600 text-sm mt-1">
                  Compatível com iPhone (iOS 15.0 ou superior) via computador.
                </p>
              </div>

              {/* Botão de Download ou Estado Indisponível */}
              <div className="pt-2">
                {isIpaAvailable ? (
                  <>
                    <a
                      href={ipaDownloadUrl}
                      download="my-roadie-release.ipa"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-black active:bg-zinc-800 text-white font-bold rounded-xl transition-all shadow-md shadow-zinc-900/20 hover:scale-[1.01]"
                    >
                      <Download className="w-5 h-5" />
                      <span>Baixar IPA do My Roadie</span>
                    </a>
                    <p className="text-[11px] text-zinc-400 text-center mt-1.5">
                      Arquivo .ipa para instalação via Sideloadly / AltStore
                    </p>
                  </>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-100 text-zinc-400 font-bold rounded-xl border border-zinc-200 cursor-not-allowed"
                    >
                      <Clock className="w-5 h-5 text-zinc-400" />
                      <span>Release em preparação</span>
                    </button>
                    <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-left text-xs text-amber-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p>
                        O download do IPA ainda não foi configurado neste ambiente. A versão oficial estará disponível assim que a build for publicada.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Instruções de Sideload */}
              <div className="pt-2 space-y-3">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Passo a passo do Sideload:
                </h3>
                <ol className="space-y-2.5 text-xs text-zinc-600">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <span>Baixe o arquivo <strong>.ipa</strong> acima no seu computador (PC Windows ou Mac).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <span>
                      Conecte o iPhone via cabo ao computador e abra a ferramenta de sideload (recomendado: <strong>Sideloadly</strong> ou <strong>AltStore</strong>).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <span>
                      Arraste o arquivo <strong>.ipa</strong> para a ferramenta, informe seu Apple ID gratuito e clique em <strong>Start</strong> para transferir o app.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      4
                    </span>
                    <span>
                      No iPhone, acesse <strong>Ajustes &gt; Geral &gt; Gerenciamento de VPN e Dispositivo</strong>, toque no seu e-mail do Apple ID e selecione <strong>&quot;Confiar&quot;</strong>.
                    </span>
                  </li>
                </ol>

                {/* Alerta de Expiração de 7 dias */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Aviso de Validade (7 dias):</span>
                  </div>
                  <p>
                    Apps instalados com Apple ID gratuito expiram a cada <strong>7 dias</strong>. Quando expirar, basta refazer a etapa do Sideload no computador ou acessar este link para baixar a versão mais recente.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
              <span>Formato: IPA ({appVersion})</span>
              <span>Validade: 7 dias (Sideload)</span>
            </div>
          </div>
        </div>

        {/* Link Alternativo para Testadores Técnicos (GitHub Releases) */}
        <div className="mt-12 p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-900">Área de Releases no GitHub</span>
              <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] font-semibold rounded-full border border-zinc-200">
                Avançado / Técnico
              </span>
            </div>
            <p className="text-xs text-zinc-500 max-w-xl">
              Testadores técnicos e desenvolvedores podem consultar o histórico completo de builds compilados, notas de versão e baixar assets diretamente pelo repositório oficial.
            </p>
          </div>
          <a
            href={githubReleasesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 text-zinc-800 font-semibold text-xs rounded-xl transition-all border border-zinc-200 shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Ver Releases no GitHub</span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-200 bg-white text-center text-zinc-400 text-sm">
        <p>&copy; 2026 My Roadie Platform. Acesso exclusivo para testadores convidados.</p>
      </footer>
    </div>
  );
}

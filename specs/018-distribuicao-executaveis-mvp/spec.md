# Spec — 018: Hospedagem e Distribuição de Executáveis de Release do MVP

## Objetivo

Resolver a falha de **página 404 (Not Found)** no download dos executáveis mobile (Android `.apk` e iOS `.ipa`) na rota de testadores (`/testers`), estabelecendo uma infraestrutura de distribuição externa estável, confiável e automatizada para os builds de release do MVP do My Roadie.

A spec contempla:
1. **Infraestrutura de Armazenamento de Releases**: Definir e estruturar o armazenamento público externo permanente para os binários compilados (`.apk` e `.ipa`) via **GitHub Releases** (com suporte alternativo/secundário via **Supabase Storage**).
2. **Resiliência e Tratamento na UI (`/testers`)**: Melhorar a página de testadores ([`frontend-web/src/app/testers/page.tsx`](file:///C:/dev/my-roadie-platform/frontend-web/src/app/testers/page.tsx)) para lidar elegantemente com ausência de URLs configuradas, exibindo badges de status, avisos informativos claros e prevenindo links quebrados (404) quando as variáveis de ambiente não estiverem definidas.
3. **Automação de Publicação no CI/CD**: Integrar step de publicação automatizada de release no workflow do GitHub Actions ([`.github/workflows/ci.yml`](file:///C:/dev/my-roadie-platform/.github/workflows/ci.yml)) ao criar tags de versão (ex.: `v*.*.*`), anexando os binários `my-roadie-release.apk` e `my-roadie-release.ipa` diretamente na release.
4. **Padronização de URLs e Variáveis de Ambiente**: Mapear, documentar e configurar as variáveis `NEXT_PUBLIC_APK_DOWNLOAD_URL` e `NEXT_PUBLIC_IPA_DOWNLOAD_URL` no ambiente local e no provedor de deploy (Vercel).
5. **Guia Operacional de Release (Runbook)**: Documentar o passo a passo para gerar novas versões, assinar/empacotar e disponibilizar builds para testers fechados.

---

## Por quê (Justificativa e Contexto)

- **Falha Bloqueante de Acesso para Testers (404 Not Found)**: Ao acessar a rota `/testers` e clicar em "Baixar APK" ou "Baixar IPA", o navegador recebia status 404 porque os arquivos locais (`/downloads/my-roadie-release.apk` e `/downloads/my-roadie-release.ipa`) não existem no repositório nem no deploy estático da Vercel.
- **Binários Não Devem Poluir o Repositório Git**: Arquivos `.apk` e `.ipa` pesam dezenas de megabytes e não devem ser versionados diretamente no Git para não inchar o clone do monorepo nem violar cotas da Vercel.
- **Artefatos do GitHub Actions São Temporários e Privados**: Os artefatos gerados pelo job `mobile-android-build` e `mobile-ios-build` expiram em 7 dias e exigem login prévio no GitHub com permissão no repositório, inviabilizando o download direto por testadores externos.
- **Transparência e Resiliência na Interface**: A interface do usuário não deve apresentar links quebrados. Se uma versão de release ainda não tiver URL configurada no ambiente, a UI deve orientar o usuário em vez de disparar uma navegação que resulta em 404.

---

## Resultados da Inspeção (Fase 0)

### 1. Diagnóstico do Código Atual do Frontend
- Arquivo analisado: [`frontend-web/src/app/testers/page.tsx`](file:///C:/dev/my-roadie-platform/frontend-web/src/app/testers/page.tsx).
- As URLs são lidas nas linhas 16 e 17:
  ```typescript
  const apkDownloadUrl = process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL || '/downloads/my-roadie-release.apk';
  const ipaDownloadUrl = process.env.NEXT_PUBLIC_IPA_DOWNLOAD_URL || '/downloads/my-roadie-release.ipa';
  ```
- Se as variáveis `NEXT_PUBLIC_APK_DOWNLOAD_URL` e `NEXT_PUBLIC_IPA_DOWNLOAD_URL` não existirem no `.env.local` ou na Vercel, o fallback aponta para o diretório `/downloads/` do Next.js.
- No diretório [`frontend-web/public/downloads/`](file:///C:/dev/my-roadie-platform/frontend-web/public/downloads/), existem apenas `.gitkeep` e `README.md`, gerando o erro 404 quando o usuário clica no botão de download.

### 2. Diagnóstico da Geração de Artefatos no CI/CD
- Arquivo analisado: [`.github/workflows/ci.yml`](file:///C:/dev/my-roadie-platform/.github/workflows/ci.yml).
- O job `mobile-android-build` (linhas 292-319) compila `mobile/build/app/outputs/flutter-apk/app-release.apk` e faz upload via `actions/upload-artifact@v4` com nome `my-roadie-android-release-apk`.
- O job `mobile-ios-build` (linhas 320-346) compila o `Runner.app`, empacota em `mobile/my-roadie-release.ipa` e faz upload via `actions/upload-artifact@v4` com nome `my-roadie-ios-release-ipa`.
- Ambos os jobs já injetam `--dart-define=BACKEND_URL` apontando para o backend de produção.

---

## Decisões de Arquitetura & Estratégia de Distribuição

1. **Provedor Primário: GitHub Releases**
   - Criação de releases versionadas (ex.: `v1.0.0-mvp`, `v1.0.1-beta`) diretamente no repositório.
   - O GitHub fornece URLs públicas diretas e estáveis com CDN global:
     `https://github.com/<owner>/<repo>/releases/download/<tag>/my-roadie-release.apk`
     `https://github.com/<owner>/<repo>/releases/download/<tag>/my-roadie-release.ipa`
   - Permite link dinâmico para a versão mais recente via tag fixa ou URL `latest`.

2. **Melhorias de Resiliência na UI (`/testers`)**
   - Se a variável de ambiente não estiver definida e o arquivo local não existir, o botão exibirá estado informativo (ex.: "Release em preparação / Em breve" ou link direto para a página de releases do repositório), evitando que o usuário caia em página 404 em branco.
   - Adicionar aviso de hash SHA256/tamanho aproximado do arquivo quando disponível para maior confiabilidade dos testers.

3. **Publicação Automatizada via Tag no GitHub Actions**
   - Adicionar job condicional `publish-release` em `.github/workflows/ci.yml` acionado quando uma tag `v*` é criada (`on: push: tags: ['v*']`) ou via parâmetro no `workflow_dispatch`.
   - O job coleta os binários gerados em `mobile-android-build` e `mobile-ios-build` e cria automaticamente a Release no GitHub com os arquivos anexados (`softprops/action-gh-release@v2`).

---

## Escopo Detalhado

- **Frontend Web**:
  - Refatorar [`frontend-web/src/app/testers/page.tsx`](file:///C:/dev/my-roadie-platform/frontend-web/src/app/testers/page.tsx) para checar a disponibilidade de download e fornecer feedback amigável caso as URLs não estejam configuradas.
  - Atualizar [`frontend-web/public/downloads/README.md`](file:///C:/dev/my-roadie-platform/frontend-web/public/downloads/README.md) com instruções claras sobre a configuração das variáveis.
- **CI/CD (`ci.yml`)**:
  - Adicionar suporte a triggers de tags de release (`v*`).
  - Adicionar job de publicação de release que anexa `my-roadie-release.apk` e `my-roadie-release.ipa` aos assets do GitHub Release.
- **Documentação e Governança**:
  - Criar `docs/operations/release-runbook.md` com guia passo a passo de como publicar novas versões e configurar a Vercel.
  - Atualizar `backlog.md` e `plan.md` refletindo a Spec 018.

---

## Fora de Escopo

- Envio para a Google Play Store (Google Play Console) ou Apple App Store (App Store Connect / TestFlight oficial pago).
- Criação de instaladores para desktop (Windows/macOS/Linux).
- Cobrança ou monetização de downloads.

---

## Critérios de Sucesso

- [ ] Diagnóstico detalhado e mapeamento de variáveis documentados na Fase 0.
- [ ] Página `/testers` atualizada para tratar de forma resiliente links de download ausentes, eliminando quedas em tela 404.
- [ ] Workflow de CI/CD atualizado para suportar criação e anexo automático de `.apk` e `.ipa` em GitHub Releases ao gerar tags `v*`.
- [ ] Documentação de operação de release criada em `docs/operations/release-runbook.md`.
- [ ] Testes unitários do frontend web atualizados e passando com 100% de sucesso.
- [ ] Testes E2E do Playwright cobrindo a renderização e o comportamento dos botões da rota `/testers`.

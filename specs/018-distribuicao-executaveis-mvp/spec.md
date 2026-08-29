# Spec — 018: Hospedagem e Distribuição de Executáveis de Release do MVP

## Objetivo

Resolver a falha de **página 404 (Not Found)** no download dos executáveis mobile (Android `.apk` e iOS `.ipa`) na rota de testadores (`/testers`), estabelecendo uma infraestrutura de distribuição externa estável, confiável e automatizada para os builds de release do MVP do My Roadie, além de sanear as inconsistências e bugs identificados no pipeline de CI/CD da Spec 017.

A spec contempla:
1. **Infraestrutura de Armazenamento de Releases**: Definir e estruturar o armazenamento público externo permanente para os binários compilados (`.apk` e `.ipa`) via **GitHub Releases** (com suporte alternativo/secundário via **Supabase Storage**).
2. **Saneamento e Correções no Pipeline CI/CD (Spec 017)**:
   - Corrigir a configuração de `base` do `dorny/paths-filter@v3` em [`.github/workflows/ci.yml`](file:///C:/dev/my-roadie-platform/.github/workflows/ci.yml) para que eventos de `push` na branch `main` não gerem diffs vazios e não pulem os deploys de produção.
   - Garantir a injeção estrita da URL do backend através do secret `BACKEND_URL` do repositório (e `inputs.backend_url` no disparo manual) nos steps de compilação mobile (`mobile-android-build` e `mobile-ios-build`), preservando a segurança e isolamento de infraestrutura sem expor URLs hardcoded no workflow.
    - Padronizar a nomenclatura simétrica do arquivo Android para `my-roadie-release.apk` (alinhando com `my-roadie-release.ipa`).
3. **Resiliência e Tratamento na UI (`/testers`)**: Melhorar a página de testadores ([`frontend-web/src/app/testers/page.tsx`](file:///C:/dev/my-roadie-platform/frontend-web/src/app/testers/page.tsx)) para lidar elegantemente com ausência de URLs configuradas, exibindo badges de status, avisos informativos claros e prevenindo links quebrados (404) quando as variáveis de ambiente não estiverem definidas.
4. **Automação de Publicação no CI/CD**: Integrar step de publicação automatizada de release no workflow do GitHub Actions ao criar tags de versão (ex.: `v*.*.*`), anexando os binários `my-roadie-release.apk` e `my-roadie-release.ipa` diretamente na release.
5. **Padronização de URLs e Variáveis de Ambiente**: Mapear, documentar e configurar as variáveis `NEXT_PUBLIC_APK_DOWNLOAD_URL` e `NEXT_PUBLIC_IPA_DOWNLOAD_URL` no ambiente local e no provedor de deploy (Vercel).
6. **Guia Operacional de Release (Runbook)**: Documentar o passo a passo para gerar novas versões, assinar/empacotar e disponibilizar builds para testers fechados.

---

## Por quê (Justificativa e Contexto)

- **Falha Bloqueante de Acesso para Testers (404 Not Found)**: Ao acessar a rota `/testers` e clicar em "Baixar APK" ou "Baixar IPA", o navegador recebia status 404 porque os arquivos locais (`/downloads/my-roadie-release.apk` e `/downloads/my-roadie-release.ipa`) não existem no repositório nem no deploy estático da Vercel.
- **Binários Não Devem Poluir o Repositório Git**: Arquivos `.apk` e `.ipa` pesam dezenas de megabytes e não devem ser versionados diretamente no Git para não inchar o clone do monorepo nem violar cotas da Vercel.
- **Artefatos do GitHub Actions São Temporários e Privados**: Os artefatos gerados pelo job `mobile-android-build` e `mobile-ios-build` expiram em 7 dias e exigem login prévio no GitHub com permissão no repositório, inviabilizando o download direto por testadores externos.
- **Falha no Paths-Filter em Pushes para `main` (Auditoria Spec 017)**: A expressão `base: ${{ github.base_ref || 'main' }}` faz com que, no evento `push` para `main`, o paths-filter compare `main` contra `main` (diff vazio), pulando jobs de build e impedindo o deploy de produção no Render e Vercel.
- **Governança de Segredos em Builds Mobile (Auditoria Spec 017)**: A injeção da URL do backend é parametrizada via `secrets.BACKEND_URL` (e `inputs.backend_url`), exigindo que a secret esteja configurada no repositório GitHub (e no `.secrets` para `act` local) para compilar releases de produção sem expor URLs sensíveis no código do workflow.
- **Transparência e Resiliência na Interface**: A interface do usuário não deve apresentar links quebrados. Se uma versão de release ainda não tiver URL configurada no ambiente, a UI deve orientar o usuário em vez de disparar uma navegação que resulta em 404.

---

## Resultados da Inspeção (Fase 0)

### 1. Relatório da Task T0.1 — Diagnóstico da Rota de Testadores (`frontend-web`)
- **Arquivo analisado:** [`frontend-web/src/app/testers/page.tsx`](file:///C:/dev/my-roadie-platform/frontend-web/src/app/testers/page.tsx).
- **Leitura de Variáveis de Ambiente:**
  ```typescript
  const apkDownloadUrl = process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL || '/downloads/my-roadie-release.apk';
  const ipaDownloadUrl = process.env.NEXT_PUBLIC_IPA_DOWNLOAD_URL || '/downloads/my-roadie-release.ipa';
  ```
- **Comportamento com variáveis configuradas:** Se `NEXT_PUBLIC_APK_DOWNLOAD_URL` e `NEXT_PUBLIC_IPA_DOWNLOAD_URL` apontam para links externos válidos (ex.: GitHub Releases), o download direto funciona normalmente via CDN pública.
- **Comportamento com variáveis ausentes (Causa Raiz do Erro 404):**
  - O fallback utiliza caminhos relativos locais (`/downloads/my-roadie-release.apk` e `/downloads/my-roadie-release.ipa`).
  - No diretório [`frontend-web/public/downloads/`](file:///C:/dev/my-roadie-platform/frontend-web/public/downloads/), existem apenas `.gitkeep` e `README.md` (binários não são versionados no Git).
  - O servidor Next.js/Vercel retorna HTTP 404 (Not Found) a qualquer clique de download.
  - A interface do usuário não valida se a URL é válida nem se o arquivo está disponível, gerando cliques cegos que levam à tela 404.
- **Versão Hardcoded:** O rodapé do card Android exibe `MVP 1.0.0` fixo no JSX (linha 125) sem consultar uma variável de ambiente (ex.: `NEXT_PUBLIC_APP_VERSION`).

### 2. Relatório da Task T0.2 — Diagnóstico dos Jobs de Build Mobile (`.github/workflows/ci.yml`)
- **Arquivo analisado:** [`.github/workflows/ci.yml`](file:///C:/dev/my-roadie-platform/.github/workflows/ci.yml) (linhas 292 a 346).
- **Job `mobile-android-build`:**
  - Compila com: `flutter build apk --release --dart-define=BACKEND_URL=${{ inputs.backend_url || secrets.BACKEND_URL }}`
  - Caminho gerado: `mobile/build/app/outputs/flutter-apk/app-release.apk`.
  - Assimetria de Nomenclatura: O arquivo sai com nome genérico `app-release.apk`, enquanto o frontend e a documentação referenciam `my-roadie-release.apk`.
- **Job `mobile-ios-build`:**
  - Compila com: `flutter build ios --release --no-codesign --dart-define=BACKEND_URL=${{ inputs.backend_url || secrets.BACKEND_URL }}`
  - Empacotamento manual: Cria pasta `Payload/`, copia `Runner.app` e compacta gerando `mobile/my-roadie-release.ipa`.
- **Injeção de `BACKEND_URL`:**
  - A injeção via `${{ inputs.backend_url || secrets.BACKEND_URL }}` utiliza estritamente segredos e inputs, mantendo o pipeline seguro e exigindo a configuração de `BACKEND_URL` no GitHub Secrets e `.secrets` local.
- **Limitações de Distribuição dos Artefatos:**
  - O step `actions/upload-artifact@v4` possui retenção temporária de apenas 7 dias e exige autenticação prévia com permissão no repositório GitHub, impossibilitando a distribuição direta a testadores externos.

### 3. Relatório da Task T0.3 — Auditoria do Pipeline CI/CD da Spec 017
- **Bug no `dorny/paths-filter@v3` (linha 54):**
  - Configuração atual: `base: ${{ github.base_ref || 'main' }}`.
  - Em eventos de `push` para a branch `main`, `github.base_ref` é vazio e o fallback `'main'` faz o action executar `git diff main...HEAD`. Estando na própria `main`, o diff é vazio e todas as flags (`backend`, `frontend`, `mobile`) avaliam para `false`, cancelando lints, testes e deploys de produção.
  - Correção: Ajustar `base` para `${{ github.base_ref }}` para que em pushes o filtro use `github.event.before`.
- **Ausência de Trigger para Tags de Release:**
  - O workflow `ci.yml` escuta apenas `push` em branches (`main`, `master`), `pull_request` e `workflow_dispatch`, não possuindo trigger para tags `v*`.
- **Estratégia de Saneamento Integrada:**
  - Corrigir `paths-filter` e padronizar injeção de `BACKEND_URL` via segredos (`secrets.BACKEND_URL` / `inputs.backend_url`).
  - Renomear APK para `my-roadie-release.apk`.
  - Implementar o job `publish-github-release` para publicar releases públicas e permanentes com os binários anexados.

### 4. Relatório da Task T6.1 — Diagnóstico do `webServer` do Playwright e Testes E2E (`frontend-web`)
- **Arquivos analisados:** [`frontend-web/playwright.config.ts`](file:///C:/dev/my-roadie-platform/frontend-web/playwright.config.ts) e [`frontend-web/tests/testers.spec.ts`](file:///C:/dev/my-roadie-platform/frontend-web/tests/testers.spec.ts).
- **Comportamento do `webServer`:**
  - O Playwright dispara `npm run dev` (`next dev`) e aguarda a disponibilidade do servidor em `http://localhost:3000`.
  - **Cold Boot no Windows (Next.js 16 + React 19):** O tempo de inicialização a frio e a compilação sob demanda da rota `/testers` levam aproximadamente 60 segundos antes de o listener HTTP na porta 3000 estar pronto para aceitar conexões.
  - **Adequação do Timeout:** O `timeout: 120 * 1000` (120s) configurado em `playwright.config.ts` é suficiente para suportar o cold boot sem falhas de timeout.
  - **Visibilidade de Logs:** A configuração `stdout: 'ignore'` suprime o output do compilador Next.js no terminal do Playwright durante o boot; caso ocorra falha silenciosa, a saída de erro é capturada via `stderr: 'pipe'`.
- **Execução da Suíte E2E:**
  - Após o handshake na porta 3000, todos os 5 testes da suíte E2E da rota `/testers` executaram no Chromium com 100% de sucesso (tempo total de execução dos testes: ~9s; tempo total do ciclo com boot: ~1.1 min).

---

## Decisões de Arquitetura & Estratégia de Distribuição

*(Consulte [`docs/distribution/download-urls.md`](file:///C:/dev/my-roadie-platform/docs/distribution/download-urls.md) para a documentação canônica completa)*

1. **Provedor Primário: GitHub Releases**
   - Criação de releases versionadas (ex.: `v1.0.0-mvp`, `v1.0.1-beta`) diretamente no repositório.
   - O GitHub fornece URLs públicas diretas e estáveis com CDN global:
     - Por tag: `https://github.com/<owner>/<repo>/releases/download/<tag>/my-roadie-release.apk`
     - Por tag: `https://github.com/<owner>/<repo>/releases/download/<tag>/my-roadie-release.ipa`
   - Link dinâmico para a versão mais recente via tag fixa ou URL `latest`:
     - `https://github.com/<owner>/<repo>/releases/latest/download/my-roadie-release.apk`
     - `https://github.com/<owner>/<repo>/releases/latest/download/my-roadie-release.ipa`

2. **Provedor Secundário / Alternativo: Supabase Storage**
   - Bucket público (`releases`):
     - Por tag: `https://<project-ref>.supabase.co/storage/v1/object/public/releases/<tag>/my-roadie-release.apk`
     - Por tag: `https://<project-ref>.supabase.co/storage/v1/object/public/releases/<tag>/my-roadie-release.ipa`
     - Alias `latest`: `https://<project-ref>.supabase.co/storage/v1/object/public/releases/latest/my-roadie-release.apk`
     - Alias `latest`: `https://<project-ref>.supabase.co/storage/v1/object/public/releases/latest/my-roadie-release.ipa`

3. **Saneamento do CI/CD**
   - Ajustar `base` no `dorny/paths-filter` para `${{ github.base_ref }}` (permitindo que o push use `github.event.before`).
   - Garantir injeção segura de `BACKEND_URL` via `secrets.BACKEND_URL` e `inputs.backend_url`.
   - Renomear o APK para `my-roadie-release.apk` antes da publicação da release.

4. **Melhorias de Resiliência na UI (`/testers`)**
   - Se a variável de ambiente não estiver definida e o arquivo local não existir, o botão exibirá estado informativo (ex.: "Release em preparação / Em breve" ou link direto para a página de releases do repositório), evitando que o usuário caia em página 404 em branco.
   - Adicionar aviso de versão ativa dinâmica (`NEXT_PUBLIC_APP_VERSION`) e orientações para os testers.

5. **Publicação Automatizada via Tag no GitHub Actions**
   - Adicionar job condicional `publish-release` em `.github/workflows/ci.yml` acionado quando uma tag `v*` é criada (`on: push: tags: ['v*']`) ou via parâmetro no `workflow_dispatch`.
   - O job coleta os binários gerados em `mobile-android-build` e `mobile-ios-build` e cria automaticamente a Release no GitHub com os arquivos anexados (`softprops/action-gh-release@v2`).

---

## Escopo Detalhado

- **CI/CD (`ci.yml`)**:
  - Corrigir `paths-filter` e padronizar injeção de `BACKEND_URL` via segredos.
  - Adicionar suporte a triggers de tags de release (`v*`).
  - Padronizar renomeação do APK para `my-roadie-release.apk`.
  - Adicionar job de publicação de release que anexa `my-roadie-release.apk` e `my-roadie-release.ipa` aos assets do GitHub Release.
- **Frontend Web**:
  - Refatorar [`frontend-web/src/app/testers/page.tsx`](file:///C:/dev/my-roadie-platform/frontend-web/src/app/testers/page.tsx) para checar a disponibilidade de download e fornecer feedback amigável caso as URLs não estejam configuradas.
  - Atualizar [`frontend-web/public/downloads/README.md`](file:///C:/dev/my-roadie-platform/frontend-web/public/downloads/README.md) com instruções claras sobre a configuração das variáveis.
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

- [ ] Diagnóstico detalhado e auditoria da Spec 017 documentados na Fase 0.
- [ ] Pipeline CI/CD saneado: `paths-filter` operacional em pushes na `main`, injeção de `BACKEND_URL` via segredos validada e nomenclatura simétrica dos artefatos mobile.
- [ ] Página `/testers` atualizada para tratar de forma resiliente links de download ausentes, eliminando quedas em tela 404.
- [ ] Workflow de CI/CD atualizado para suportar criação e anexo automático de `.apk` e `.ipa` em GitHub Releases ao gerar tags `v*`.
- [ ] Documentação de operação de release criada em `docs/operations/release-runbook.md`.
- [ ] Testes unitários do frontend web atualizados e passando com 100% de sucesso.
- [ ] Testes E2E do Playwright cobrindo a renderização e o comportamento dos botões da rota `/testers`.

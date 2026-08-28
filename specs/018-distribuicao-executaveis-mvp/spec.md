# Spec — 018: Hospedagem e Distribuição de Executáveis de Release do MVP

## Objetivo

Resolver a falha de **página 404 (Not Found)** no download dos executáveis mobile (Android `.apk` e iOS `.ipa`) na rota de testadores (`/testers`), estabelecendo uma infraestrutura de distribuição externa estável, confiável e automatizada para os builds de release do MVP do My Roadie, além de sanear as inconsistências e bugs identificados no pipeline de CI/CD da Spec 017.

A spec contempla:
1. **Infraestrutura de Armazenamento de Releases**: Definir e estruturar o armazenamento público externo permanente para os binários compilados (`.apk` e `.ipa`) via **GitHub Releases** (com suporte alternativo/secundário via **Supabase Storage**).
2. **Saneamento e Correções no Pipeline CI/CD (Spec 017)**:
   - Corrigir a configuração de `base` do `dorny/paths-filter@v3` em [`.github/workflows/ci.yml`](file:///C:/dev/my-roadie-platform/.github/workflows/ci.yml) para que eventos de `push` na branch `main` não gerem diffs vazios e não pulem os deploys de produção.
   - Adicionar fallback explícito e seguro para a URL do backend de produção (`https://my-roadie-backend.onrender.com`) nos steps de compilação mobile (`mobile-android-build` e `mobile-ios-build`), evitando que o app compile apontando para `localhost` / `10.0.2.2` caso o secret `BACKEND_URL` não esteja definido no repositório.
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
- **Risco de Configuração em Builds Mobile (Auditoria Spec 017)**: A interpolação `${{ inputs.backend_url || secrets.BACKEND_URL }}` sem valor padrão em `ci.yml` faz com que o app mobile seja compilado com URL vazia caso a secret não esteja configurada no GitHub, caindo no fallback `http://10.0.2.2:3000` (Android) / `http://localhost:3000` (iOS).
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

### 2. Diagnóstico da Geração de Artefatos e Workflow CI/CD (Spec 017)
- Arquivo analisado: [`.github/workflows/ci.yml`](file:///C:/dev/my-roadie-platform/.github/workflows/ci.yml).
- **Bug 1 (`paths-filter`)**: Linha 54 possui `base: ${{ github.base_ref || 'main' }}`. Em eventos de `push` para `main`, `github.base_ref` é vazio e o fallback `'main'` faz com que `paths-filter` rode `git diff main...HEAD`, resultando em diff vazio e pulando todos os builds e deploys.
- **Bug 2 (Fallback `BACKEND_URL`)**: Linhas 312 e 334 passam `--dart-define=BACKEND_URL=${{ inputs.backend_url || secrets.BACKEND_URL }}`. Caso o secret do GitHub não esteja configurado, o app compila com string vazia e aponta para `http://10.0.2.2:3000` (Android) / `http://localhost:3000` (iOS).
- **Inconsistência de Nomenclatura**: No job Android, o arquivo gerado é `mobile/build/app/outputs/flutter-apk/app-release.apk`, enquanto no iOS o arquivo é empacotado como `my-roadie-release.ipa`.
- **Limitação de Acesso**: Os artefatos são enviados via `actions/upload-artifact@v4` (expiram em 7 dias e exigem login no GitHub), necessitando de uma publicação pública e permanente em GitHub Releases.

---

## Decisões de Arquitetura & Estratégia de Distribuição

1. **Provedor Primário: GitHub Releases**
   - Criação de releases versionadas (ex.: `v1.0.0-mvp`, `v1.0.1-beta`) diretamente no repositório.
   - O GitHub fornece URLs públicas diretas e estáveis com CDN global:
     `https://github.com/<owner>/<repo>/releases/download/<tag>/my-roadie-release.apk`
     `https://github.com/<owner>/<repo>/releases/download/<tag>/my-roadie-release.ipa`
   - Permite link dinâmico para a versão mais recente via tag fixa ou URL `latest`.

2. **Saneamento do CI/CD**
   - Ajustar `base` no `dorny/paths-filter` para `${{ github.base_ref }}` (permitindo que o push use `github.event.before`).
   - Adicionar fallback seguro `'https://my-roadie-backend.onrender.com'` no `--dart-define=BACKEND_URL`.
   - Renomear o APK para `my-roadie-release.apk` antes da publicação da release.

3. **Melhorias de Resiliência na UI (`/testers`)**
   - Se a variável de ambiente não estiver definida e o arquivo local não existir, o botão exibirá estado informativo (ex.: "Release em preparação / Em breve" ou link direto para a página de releases do repositório), evitando que o usuário caia em página 404 em branco.
   - Adicionar aviso de versão ativa dinâmica (`NEXT_PUBLIC_APP_VERSION`) e orientações para os testers.

4. **Publicação Automatizada via Tag no GitHub Actions**
   - Adicionar job condicional `publish-release` em `.github/workflows/ci.yml` acionado quando uma tag `v*` é criada (`on: push: tags: ['v*']`) ou via parâmetro no `workflow_dispatch`.
   - O job coleta os binários gerados em `mobile-android-build` e `mobile-ios-build` e cria automaticamente a Release no GitHub com os arquivos anexados (`softprops/action-gh-release@v2`).

---

## Escopo Detalhado

- **CI/CD (`ci.yml`)**:
  - Corrigir `paths-filter` e fallback de `BACKEND_URL`.
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
- [ ] Pipeline CI/CD saneado: `paths-filter` operacional em pushes na `main`, fallback de URL de produção ativo e nomenclatura simétrica dos artefatos mobile.
- [ ] Página `/testers` atualizada para tratar de forma resiliente links de download ausentes, eliminando quedas em tela 404.
- [ ] Workflow de CI/CD atualizado para suportar criação e anexo automático de `.apk` e `.ipa` em GitHub Releases ao gerar tags `v*`.
- [ ] Documentação de operação de release criada em `docs/operations/release-runbook.md`.
- [ ] Testes unitários do frontend web atualizados e passando com 100% de sucesso.
- [ ] Testes E2E do Playwright cobrindo a renderização e o comportamento dos botões da rota `/testers`.

# Spec — 017: Pipeline CI/CD Unificado & Modernizado (E2E, Deploy Contínuo, Filtro de Paths & Otimização de Custos)

## Objetivo

Unificar, modernizar e otimizar a infraestrutura de Integração e Entrega Contínua (CI/CD) da My Roadie Platform no GitHub Actions (`.github/workflows/ci.yml`), entregando:

1. **Detecção Inteligente de Caminhos (`dorny/paths-filter`)**: Execução estrita e seletiva de jobs conforme as pastas alteradas (`backend/**`, `frontend-web/**`, `mobile/**`), evitando o consumo desnecessário de minutos de CI (especialmente em runners `macos-latest` e builds Android).
2. **Disparo Manual Sob Demanda (`workflow_dispatch`)**: Permitir que desenvolvedores acionem builds de release avulsos (APK Android e IPA iOS), executem testes ou acionem o pipeline sob demanda pelo painel do GitHub Actions com parâmetros configuráveis.
3. **Completude de Testes Automatizados (E2E Web & Backend)**: Integrar a execução dos testes E2E do Backend (`npm run test:e2e`) e dos testes E2E de Frontend Web (Playwright com browser headless Chromium) antes dos estágios de build e deploy.
4. **Fundação e Gancho Preparatório para E2E Mobile (Spec 018)**: Configurar parâmetro `run_mobile_e2e` no `workflow_dispatch` (com `default: false`), preparando o pipeline para a Spec 018 sem consumir minutos da cota em PRs regulares. No dia a dia, manter a execução rápida da suíte de integração com `flutter test` (< 30s no `ubuntu-latest`).
5. **Padronização de Artefatos de Release**: Publicação automatizada tanto do `.apk` (Android) quanto do `.ipa` (iOS) via `actions/upload-artifact@v4`, ambos apontando para o backend de produção via `--dart-define=BACKEND_URL`, com retenção de 7 dias.
6. **Automação de Continuous Deployment (CD)**: Preservar e consolidar os hooks de deploy do Render (backend) e Vercel (frontend) condicionados ao sucesso dos testes e compilações na branch `main`.
7. **Otimização de Performance e Caching**: Caching multi-camadas (npm para Node 22, Flutter pub cache e Gradle cache para Android SDK).
8. **Saneamento e Sincronização de Documentação Residual da Spec 016**: Corrigir as inconsistências apontadas na auditoria da Spec 016 (inclusão da Spec 016 na listagem temática da Fase 1 do `backlog.md`, documentação técnica do ajuste `"start:prod": "node dist/src/main"` de `backend/package.json`, e documentação da arquitetura de Continuous Deployment no `plan.md` raiz e `specs/016-preparacao-release-mvp/plan.md`).

## Por quê

- **Otimização de Custos e Minutos Gratuitos do GitHub Actions (Crítico)**: Atualmente, qualquer alteração na branch ou em Pull Requests (mesmo um ajuste de documentação ou correção simples no frontend) aciona todos os jobs, incluindo o runner `macos-latest` (que consome 10x minutos da cota do GitHub Actions) e o build do Android. Filtrar jobs por pastas modificadas preserva os minutos de CI e acelera o tempo de feedback nos PRs.
- **Preparação Estruturada para a Spec 018 (E2E Mobile)**: Emuladores Android/iOS em CI levam de 8 a 15 minutos e geram alto consumo de cota. Deixar o gancho condicional no `workflow_dispatch` (desligado por padrão nos PRs) permite que a Spec 018 adicione os cenários de teste mobile sem precisar reabrir a arquitetura do CI/CD.
- **Flexibilidade Operacional com `workflow_dispatch`**: Para gerar uma nova versão para os testers fechados (distribuída via `/testers`), atualmente é necessário abrir um PR ou comitar na `main`. O gatilho manual permite gerar e baixar APKs e IPAs sob demanda a qualquer momento.
- **Segurança de Regressão com Testes E2E no CI**: O backend possui 7 suítes completas de testes E2E (`backend/test/*.e2e-spec.ts`) e o frontend possui suítes Playwright (`frontend-web/tests/`). O pipeline anterior rodava apenas testes unitários (`npm test`), deixando passar eventuais quebras de integração entre módulos ou contratos de rotas.
- **Paridade e Rastreabilidade de Artefatos**: O pipeline gerava o arquivo `.ipa` e publicava nos artefatos do GitHub Actions, mas o `.apk` era compilado sem ser disponibilizado para download nem receber a variável `--dart-define=BACKEND_URL`. Ambos devem ser gerados e disponibilizados de forma simétrica.
- **Fechamento da Fase 1 do Backlog**: Com esta entrega, todos os itens priorizados da Fase 1 (Fundação Sólida, Estabilização, Segurança & CI/CD) são concluídos, deixando a plataforma pronta para novas features de negócio (Fase 2 e Fase 3).

## Resultados da Inspeção (Fase 0)

### 1. Mapeamento de Scripts de Teste, Build e Variáveis de Ambiente — Task T0.1

#### Backend (`backend/package.json`)
- **Scripts de Teste**:
  - `npm test`: `jest` (testes unitários com mock de `jwks-rsa` mapeado em `test/__mocks__/jwks-rsa.js`).
  - `npm run test:e2e`: `jest --config ./test/jest-e2e.json` (7 suítes E2E integradas com Supertest e mock de autenticação).
  - `npm run test:cov`: `jest --coverage` (cobertura com Jest).
- **Scripts de Lint & Formatação**:
  - `npm run lint`: `eslint "{src,apps,libs,test}/**/*.ts" --fix`.
  - `npm run format`: `prettier --write "src/**/*.ts" "test/**/*.ts"`.
- **Scripts de Build & Start**:
  - `postinstall`: `prisma generate` (gera o Prisma Client).
  - `npm run build`: `nest build` (compila para `dist/`).
  - `npm run start:prod`: `node dist/src/main` (execução em produção para o monorepo).
- **Variáveis de Ambiente Necessárias**:
  - `DATABASE_URL`: String de conexão PostgreSQL (Supabase).
  - `JWT_SECRET`: Chave secreta para validação/assinatura de tokens JWT.

#### Frontend Web (`frontend-web/package.json`)
- **Scripts de Teste**:
  - `npm test`: `vitest` (testes unitários e componentes com `@testing-library/react` e `@vitest/coverage-v8`).
  - `npx playwright test`: Testes E2E ponta a ponta configurados em `playwright.config.ts` com browser Chromium.
- **Scripts de Lint**:
  - `npm run lint`: `eslint`.
- **Scripts de Build & Start**:
  - `npm run build`: `next build` (compilação e otimização Next.js App Router).
  - `npm run dev`: `next dev` (servidor de desenvolvimento na porta 3000).
- **Variáveis de Ambiente Necessárias**:
  - `NEXT_PUBLIC_SUPABASE_URL`: URL da instância Supabase.
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima pública do Supabase.

#### Mobile (`mobile/pubspec.yaml`)
- **Comandos de Teste**:
  - `flutter test`: Execução rápida de testes unitários e testes de integração de fluxo sem emulador (`profile_flow_integration_test.dart`).
  - `flutter test integration_test/`: Testes E2E com emulador / dispositivo real (preparado para Spec 018).
- **Comandos de Lint & Análise**:
  - `flutter analyze`: Análise estática com regras de `flutter_lints: ^6.0.0`.
- **Comandos de Build**:
  - Android: `flutter build apk --release --dart-define=BACKEND_URL=...`.
  - iOS: `flutter build ios --release --no-codesign --dart-define=BACKEND_URL=...`.
- **Definições em Tempo de Compilação (`--dart-define`)**:
  - `BACKEND_URL`: URL base do backend de produção (`https://my-roadie-backend.onrender.com`).

### 2. Configuração do Playwright Web (`frontend-web/playwright.config.ts`) — Task T0.2
- **Configuração do Playwright (`frontend-web/playwright.config.ts`)**:
  - `testDir: './tests'`: Focado exclusivamente nas suítes E2E da pasta `tests/`.
  - `baseURL: 'http://localhost:3000'`.
  - `webServer`: Inicializa automaticamente a aplicação com `npm run dev`, aguardando `http://localhost:3000` ficar responsivo (`reuseExistingServer: !process.env.CI`).
  - `projects`: Configurado para `chromium` (`devices['Desktop Chrome']`).
- **Suítes de Testes Inspecionadas (`frontend-web/tests/`)**:
  - `auth.spec.ts`: Testa o fluxo ponta a ponta de registro de novo músico, interceptação e aceite de alertas (`dialog.accept()`), redirecionamento para login, login com sucesso e renderização dos cards na dashboard.
  - `security.spec.ts`: Testa autenticação de administrador com visualização do escudo admin, bloqueio de rota protegida `/admin/users` com redirecionamento de músicos comuns, e persistência de sessão após `page.reload()`.
- **Requisitos Operacionais para CI Linux (`ubuntu-latest`)**:
  - Necessita da instalação prévia do Chromium com dependências do sistema operacional: `npx playwright install --with-deps chromium`.
  - Necessita de variáveis públicas para inicialização do Next.js: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - Execução através do comando `npx playwright test` com output de trace em falhas (`trace: 'on-first-retry'`).

### 3. Workflow Atual, Dependências e Secrets (`.github/workflows/ci.yml`) — Task T0.3
- **Gatilhos Atuais**:
  - `push` e `pull_request` apenas para branches `main` e `master`, com `paths-ignore` restrito a `**.md` e `.gitignore`.
  - Ausência do gatilho sob demanda `workflow_dispatch`.
- **Topologia de Jobs e Dependências (`needs`)**:
  - `frontend-lint` (sem needs) -> `frontend-test` (`needs: frontend-lint`) -> `frontend-build` (`needs: frontend-test`).
  - `backend-lint` (sem needs) -> `backend-test` (`needs: backend-lint`) -> `backend-build` (`needs: backend-test`).
  - `mobile-lint` (sem needs) -> `mobile-test` (`needs: mobile-lint`) -> `mobile-build` (Android) / `mobile-ios-build` (iOS macOS) (`needs: mobile-test`).
  - `deploy-production` (`needs: [frontend-build, backend-build]`, `if: github.ref == 'refs/heads/main' && github.event_name == 'push'`).
- **Mapeamento de Secrets por Job**:
  - `backend-lint`, `backend-test`, `backend-build`: `DATABASE_URL` e `JWT_SECRET`.
  - `frontend-build`: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - `deploy-production`: `RENDER_DEPLOY_HOOK` e `VERCEL_DEPLOY_HOOK`.
- **Pontos Críticos e Gargalos Identificados**:
  1. *Consumo Excessivo de Minutos*: A condição `github.event_name == 'pull_request'` nos lints força a execução do pipeline inteiro em qualquer PR, disparando desnecessariamente compilações Android e o runner `macos-latest` (que consome 10x da cota).
  2. *Gaps de Testes*: Não há execução das 7 suítes E2E do backend (`npm run test:e2e`) nem dos testes Playwright do frontend (`npx playwright test`).
  3. *Assimetria Mobile*: O job Android (`mobile-build`) não injeta `--dart-define=BACKEND_URL` nem disponibiliza o arquivo compilado via `actions/upload-artifact@v4`, enquanto o job iOS já gera `.ipa` e publica artefato.
  4. *Otimização de Cache*: O step Android não utiliza `cache: 'gradle'` no `setup-java`.

### 4. Auditoria de Caching Multi-Camadas e Otimizações de CI — Task T4.3
- **Node.js / npm (`frontend-web` e `backend`)**:
  - Todos os 8 jobs do ecossistema Node (`frontend-lint`, `backend-lint`, `frontend-test`, `frontend-e2e`, `backend-test`, `backend-e2e`, `frontend-build`, `backend-build`) utilizam `actions/setup-node@v4` com parâmetro `cache: 'npm'` e apontamento explícito para `./frontend-web/package-lock.json` e `./backend/package-lock.json`.
  - Garante reuso dos pacotes do npm cache entre execuções, evitando downloads redundantes de dependências nos runners `ubuntu-latest`.
- **Flutter / Dart (`mobile`)**:
  - Todos os 5 jobs Mobile (`mobile-lint`, `mobile-test`, `mobile-e2e-emulator`, `mobile-android-build`, `mobile-ios-build`) utilizam a action oficial `subosito/flutter-action@v2` com `cache: true` no canal `stable`.
  - Mantém em cache o SDK do Flutter e os artefatos do pub cache entre execuções nos runners Linux (`ubuntu-latest`) e macOS (`macos-latest`).
- **Java / Gradle (`mobile/android`)**:
  - O job de compilação Android (`mobile-android-build`) utiliza `actions/setup-java@v4` com `distribution: 'zulu'`, `java-version: '17'` e `cache: 'gradle'`.
  - Mantém em cache os wrappers e dependências do Gradle, reduzindo significativamente o tempo de compilação do arquivo `app-release.apk`.

## Escopo

1. **Gatilhos & Detecção de Mudanças**:
   - Adicionar `workflow_dispatch` com inputs configuráveis:
     - `scope`: seleção de jobs (`auto`, `all`, `backend`, `frontend`, `mobile`).
     - `backend_url`: URL injetada nos builds mobile (default: produção).
     - `run_mobile_e2e`: flag booleana (default: `false`) para habilitar testes pesados em emulador mobile sob demanda.
   - Implementar o job `changes` utilizando a action oficial `dorny/paths-filter@v3`.
   - Mapear caminhos:
     - `backend`: `['backend/**', 'prisma/**', '.github/workflows/ci.yml']`
     - `frontend`: `['frontend-web/**', '.github/workflows/ci.yml']`
     - `mobile`: `['mobile/**', '.github/workflows/ci.yml']`

2. **Estágio de Qualidade & Testes (Lints, Unitários & E2E)**:
   - **Backend**: `backend-lint` -> `backend-test` (unitários) -> `backend-e2e` (`npm run test:e2e`).
   - **Frontend**: `frontend-lint` -> `frontend-test` (vitest) -> `frontend-e2e` (Playwright com Chromium).
   - **Mobile**: `mobile-lint` (`flutter analyze`) -> `mobile-test` (`flutter test` com suíte de integração leve).
   - **Mobile E2E (Emulador)**: Estrutura modular preparada e conectada ao gatilho `run_mobile_e2e` (pronta para plugar os cenários na Spec 018).

3. **Estágio de Compilação & Publicação de Artefatos**:
   - **Backend**: `backend-build` (`nest build`).
   - **Frontend**: `frontend-build` (`next build`).
   - **Mobile Android**: `mobile-android-build` com `--dart-define=BACKEND_URL=https://my-roadie-backend.onrender.com`, Gradle cache e upload de `my-roadie-release.apk`.
   - **Mobile iOS**: `mobile-ios-build` com `--dart-define=BACKEND_URL=https://my-roadie-backend.onrender.com`, empacotamento em `my-roadie-release.ipa` e upload de artefato.

4. **Estágio de Deploy Contínuo (CD)**:
   - `deploy-production` condicionado ao sucesso de `backend-build` e `frontend-build`, disparando os webhooks de deploy da Vercel e Render apenas em pushes/merges na branch `main`.

5. **Sincronização de Documentação & Baseline Residual**:
   - Atualizar `backlog.md` incluindo o item da Spec 016 na seção temática *Fase 1: Estabilização, Segurança & Bugs Críticos*.
   - Atualizar `specs/016-preparacao-release-mvp/plan.md` documentando a justificativa técnica do script `start:prod` e o estágio `deploy-production`.
   - Atualizar a Seção 6 do `plan.md` raiz detalhando a existência e funcionamento do job `deploy-production`.

## Fora de Escopo

- Implementação dos cenários detalhados de testes E2E do app mobile (escopo da Spec 018 — esta spec provê a infraestrutura de CI e o gatilho manual sob demanda).
- Deploy automatizado em lojas oficiais (Google Play Store e Apple App Store) via Fastlane — escopo de fase de lançamento comercial.

## Critérios de Sucesso

- [ ] Gatilho `workflow_dispatch` adicionado com inputs `scope`, `backend_url` e `run_mobile_e2e` (default: `false`).
- [ ] Job `changes` implementado com `dorny/paths-filter@v3`, filtrando com precisão execuções de `backend`, `frontend` e `mobile`.
- [ ] Runners `macos-latest` e builds Android ignorados em PRs que não alteram a pasta `mobile/`.
- [ ] Testes E2E do backend (`npm run test:e2e`) integrados e passando no CI.
- [ ] Testes E2E Playwright do frontend integrados e passando no CI em modo headless.
- [ ] Build Android compilando com URL de produção e publicando o artefato `my-roadie-release.apk`.
- [ ] Build iOS compilando com URL de produção e publicando o artefato `my-roadie-release.ipa`.
- [ ] Hooks de deploy do Render e Vercel preservados para merges na `main`.
- [ ] Inconsistências de documentação identificadas na auditoria da Spec 016 saneadas e sincronizadas.
- [ ] Sintaxe do `.github/workflows/ci.yml` 100% válida e formatada.
- [ ] Baseline (`spec.md`, `plan.md`) e `backlog.md` atualizados refletindo a conclusão da Fase 1.

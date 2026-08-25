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

## Por quê

- **Otimização de Custos e Minutos Gratuitos do GitHub Actions (Crítico)**: Atualmente, qualquer alteração na branch ou em Pull Requests (mesmo um ajuste de documentação ou correção simples no frontend) aciona todos os jobs, incluindo o runner `macos-latest` (que consome 10x minutos da cota do GitHub Actions) e o build do Android. Filtrar jobs por pastas modificadas preserva os minutos de CI e acelera o tempo de feedback nos PRs.
- **Preparação Estruturada para a Spec 018 (E2E Mobile)**: Emuladores Android/iOS em CI levam de 8 a 15 minutos e geram alto consumo de cota. Deixar o gancho condicional no `workflow_dispatch` (desligado por padrão nos PRs) permite que a Spec 018 adicione os cenários de teste mobile sem precisar reabrir a arquitetura do CI/CD.
- **Flexibilidade Operacional com `workflow_dispatch`**: Para gerar uma nova versão para os testers fechados (distribuída via `/testers`), atualmente é necessário abrir um PR ou comitar na `main`. O gatilho manual permite gerar e baixar APKs e IPAs sob demanda a qualquer momento.
- **Segurança de Regressão com Testes E2E no CI**: O backend possui 7 suítes completas de testes E2E (`backend/test/*.e2e-spec.ts`) e o frontend possui suítes Playwright (`frontend-web/tests/`). O pipeline anterior rodava apenas testes unitários (`npm test`), deixando passar eventuais quebras de integração entre módulos ou contratos de rotas.
- **Paridade e Rastreabilidade de Artefatos**: O pipeline gerava o arquivo `.ipa` e publicava nos artefatos do GitHub Actions, mas o `.apk` era compilado sem ser disponibilizado para download nem receber a variável `--dart-define=BACKEND_URL`. Ambos devem ser gerados e disponibilizados de forma simétrica.
- **Fechamento da Fase 1 do Backlog**: Com esta entrega, todos os itens priorizados da Fase 1 (Fundação Sólida, Estabilização, Segurança & CI/CD) são concluídos, deixando a plataforma pronta para novas features de negócio (Fase 2 e Fase 3).

## Resultados da Inspeção (Fase 0)

### 1. Workflow Atual (`.github/workflows/ci.yml`) — Task T0.1
- **Gatilhos**: Apenas `push` e `pull_request` nas branches `main` e `master`. Não possui `workflow_dispatch`.
- **Filtros de execução**: Utiliza expressões `contains(github.event.head_commit.message, '[web]')` e `github.event_name == 'pull_request'`, fazendo com que todo PR execute a suíte inteira, incluindo macOS.
- **Testes Backend**: Executa apenas `npm test` (unitários). Não executa `npm run test:e2e`.
- **Testes Frontend**: Executa apenas `vitest` (`npm test -- --run`). Possui Playwright configurado em `frontend-web/playwright.config.ts` com testes em `frontend-web/tests/`, mas não está plugado no CI.
- **Build Mobile**:
  - Android: Executa `flutter build apk --release` sem `--dart-define=BACKEND_URL` e sem `upload-artifact`.
  - iOS: Executa `flutter build ios --release --no-codesign --dart-define=BACKEND_URL=https://my-roadie-backend.onrender.com`, empacota em `.ipa` e publica via `actions/upload-artifact@v4`.

### 2. Configuração do Playwright Web (`frontend-web/playwright.config.ts`) — Task T0.2
- Configurado com `webServer` (`npm run dev`), porta `3000`, e browser `chromium`.
- Para rodar no CI Linux sem interface gráfica, necessita do step `npx playwright install --with-deps chromium`.

### 3. Variáveis e Secrets de Ambiente — Task T0.3
- Backend: `DATABASE_URL`, `JWT_SECRET`.
- Frontend: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- CD: `RENDER_DEPLOY_HOOK`, `VERCEL_DEPLOY_HOOK`.

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
- [ ] Sintaxe do `.github/workflows/ci.yml` 100% válida e formatada.
- [ ] Baseline (`spec.md`, `plan.md`) e `backlog.md` atualizados refletindo a conclusão da Fase 1.

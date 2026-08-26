# Tasks — 017: Pipeline CI/CD Unificado & Modernizado (E2E, Deploy Contínuo, Filtro de Paths & Otimização de Custos)

## Fase 0 — Diagnóstico & Mapeamento

- [x] T0.1 — Mapear estrutura de scripts de teste, build e variáveis de ambiente em `backend/package.json`, `frontend-web/package.json` e `mobile/pubspec.yaml`.
- [x] T0.2 — Inspecionar `frontend-web/playwright.config.ts` e suítes em `frontend-web/tests/` para garantir execução sem falhas em modo headless no Linux.
- [x] T0.3 — Inspecionar `.github/workflows/ci.yml` mapeando todas as dependências entre jobs (`needs`), secrets e condições atuais.

## Fase 1 — Detecção Inteligente de Paths & Gatilho Manual (`workflow_dispatch`)

- [x] T1.1 — Configurar gatilho `workflow_dispatch` com inputs configuráveis (`scope`, `backend_url` e `run_mobile_e2e`) no cabeçalho do workflow `.github/workflows/ci.yml`.
- [x] T1.2 — Implementar o job `changes` utilizando `dorny/paths-filter@v3` para mapear com precisão alterações em `backend`, `frontend` e `mobile`.
- [x] T1.3 — Atualizar as condições `if` e dependências `needs` de todos os jobs de linting (`frontend-lint`, `backend-lint`, `mobile-lint`) para responder aos outputs de `changes` ou bypass de `workflow_dispatch`.

## Fase 2 — Integração de Testes E2E (Backend, Frontend Playwright & Gancho Mobile)

- [x] T2.1 — Adicionar o job `backend-e2e` executando `npm run test:e2e` condicionado ao sucesso de `backend-test`.
- [x] T2.2 — Adicionar o job `frontend-e2e` instalando Chromium (`npx playwright install --with-deps chromium`) e rodando `npx playwright test` condicionado ao sucesso de `frontend-test`.
- [x] T2.3 — Configurar a estrutura do job/step `mobile-e2e-emulator` condicionado a `github.event.inputs.run_mobile_e2e == 'true'`, deixando o gancho pronto para a Spec 018.
- [ ] T2.4 — Atualizar dependências de `backend-build` e `frontend-build` para exigir a aprovação dos respectivos jobs de E2E.

## Fase 3 — Padronização de Builds Mobile & Publicação de Artefatos

- [ ] T3.1 — Atualizar `mobile-android-build` para injetar `--dart-define=BACKEND_URL` de produção e habilitar `cache: 'gradle'` no `setup-java`.
- [ ] T3.2 — Adicionar step `actions/upload-artifact@v4` no `mobile-android-build` para publicar `app-release.apk` como `my-roadie-android-release-apk` (retenção de 7 dias).
- [ ] T3.3 — Padronizar `mobile-ios-build` garantindo o uso consistente do input de `backend_url` e upload do artefato `my-roadie-ios-release-ipa`.

## Fase 4 — Deploy Contínuo (CD) & Otimização de Performance

- [ ] T4.1 — Refatorar o job `deploy-production` para disparar webhooks do Render e Vercel apenas após o sucesso dos jobs de build aplicáveis quando na branch `main`.
- [ ] T4.2 — Validar caching multi-camadas (npm, Flutter pub e Gradle) em todos os jobs do pipeline.

## Fase 5 — Validação, Sintaxe do Workflow & Documentação

- [ ] T5.1 — Validar a sintaxe e a estrutura do arquivo `.github/workflows/ci.yml`.
- [ ] T5.2 — Executar localmente as suítes de testes (`npm test` no backend, `npm test` no frontend, `flutter test` no mobile).
- [ ] T5.3 — Atualizar `backlog.md`, `spec.md` e `plan.md` raiz com o status de fechamento da Fase 1 do backlog.
- [ ] T5.4 — Sincronizar inconsistências residuais da auditoria da Spec 016 em `backlog.md` (Fase 1), `specs/016-preparacao-release-mvp/plan.md` e `plan.md` raiz.

## Checklist de fechamento da feature

- [ ] `workflow_dispatch` operacional com inputs `scope`, `backend_url` e `run_mobile_e2e`
- [ ] Detecção de mudanças ativa via `dorny/paths-filter@v3` poupando minutos de runner
- [ ] PRs sem alteração em `mobile/` não disparam runners macOS nem Android SDK
- [ ] Testes E2E do backend e Playwright do frontend integrados ao pipeline
- [ ] Gancho preparatório para E2E Mobile da Spec 018 configurado e desligado por padrão
- [ ] Builds de APK (Android) e IPA (iOS) gerados e publicados como artefatos no GitHub Actions
- [ ] Deploys automáticos (Render e Vercel) condicionados ao sucesso dos builds na `main`
- [ ] Inconsistências residuais da auditoria da Spec 016 saneadas e sincronizadas
- [ ] Sintaxe do arquivo de workflow validada
- [ ] Fase 1 do Backlog concluída e documentada nas baselines

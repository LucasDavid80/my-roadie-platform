# Tasks — 018: Hospedagem e Distribuição de Executáveis de Release do MVP

## Fase 0: Mapeamento e Diagnóstico da Base
- [x] T0.1 — Inspecionar o código de [`frontend-web/src/app/testers/page.tsx`](file:///C:/dev/my-roadie-platform/frontend-web/src/app/testers/page.tsx) e validar comportamento com variáveis de ambiente ausentes e presentes.
- [x] T0.2 — Inspecionar os jobs de build mobile em [`.github/workflows/ci.yml`](file:///C:/dev/my-roadie-platform/.github/workflows/ci.yml) e validar nomes e caminhos dos arquivos gerados (`app-release.apk` e `my-roadie-release.ipa`).
- [x] T0.3 — Auditar a Spec 017 (`ci.yml`, paths-filter, injeção de BACKEND_URL e artefatos) e documentar os resultados na seção "Resultados da Inspeção (Fase 0)" de [`specs/018-distribuicao-executaveis-mvp/spec.md`](file:///C:/dev/my-roadie-platform/specs/018-distribuicao-executaveis-mvp/spec.md).

## Fase 1: Padronização de Releases, Correções do CI/CD (Spec 017) e URLs
- [x] T1.1 — Corrigir `base` do `dorny/paths-filter@v3` no [`.github/workflows/ci.yml`](file:///C:/dev/my-roadie-platform/.github/workflows/ci.yml) para evitar diff vazio em pushes para `main`.
- [x] T1.2 — Validar e padronizar injeção segura de `BACKEND_URL` via segredos (`secrets.BACKEND_URL` / `inputs.backend_url`) nos jobs `mobile-android-build` e `mobile-ios-build` do CI/CD.
- [x] T1.3 — Padronizar o nome do artefato Android para `my-roadie-release.apk` (garantindo simetria com `my-roadie-release.ipa`).
- [x] T1.4 — Definir e documentar o padrão canônico das URLs públicas de download para GitHub Releases e Supabase Storage.
- [x] T1.5 — Atualizar o arquivo [`frontend-web/public/downloads/README.md`](file:///C:/dev/my-roadie-platform/frontend-web/public/downloads/README.md) com o guia de variáveis `NEXT_PUBLIC_APK_DOWNLOAD_URL` e `NEXT_PUBLIC_IPA_DOWNLOAD_URL`.
- [x] T1.6 — Adicionar suporte a `NEXT_PUBLIC_APP_VERSION` para exibição dinâmica de versão na UI.

## Fase 2: Resiliência da UI da Página `/testers` (Frontend Web)
- [x] T2.1 — Refatorar [`frontend-web/src/app/testers/page.tsx`](file:///C:/dev/my-roadie-platform/frontend-web/src/app/testers/page.tsx) para verificar se as URLs de download são válidas (iniciam com `http://`, `https://` ou apontam para asset estático existente).
- [x] T2.2 — Adicionar tratamento visual amigável quando a URL de download não estiver configurada no ambiente (exibir alerta informativo e badge "Em breve / Aguardando build" em vez de permitir o clique que gera erro 404).
- [x] T2.3 — Adicionar link alternativo seguro para a página de Releases do repositório no GitHub para testadores técnicos.

## Fase 3: Automação de Publicação de Release no CI/CD
- [x] T3.1 — Adicionar trigger de tags de release (`v*`) em [`.github/workflows/ci.yml`](file:///C:/dev/my-roadie-platform/.github/workflows/ci.yml).
- [x] T3.2 — Criar o job `publish-github-release` no GitHub Actions condicionado a tags de release, coletando os artefatos de `mobile-android-build` e `mobile-ios-build` e publicando via `softprops/action-gh-release@v2`.
- [x] T3.3 — Adicionar parâmetro `publish_release` no disparo manual `workflow_dispatch` do CI/CD.

## Fase 4: Testes Unitários e E2E (Vitest e Playwright)
- [x] T4.1 — Criar/atualizar suíte de testes unitários em `frontend-web/src/app/testers/page.test.tsx` cobrindo cenários com e sem URLs de download configuradas.
- [ ] T4.2 — Criar teste E2E com Playwright em `frontend-web/tests/testers.spec.ts` validando a rota `/testers`, visibilidade das instruções de Android/iOS e atributos dos botões de download.
- [ ] T4.3 — Executar `npm test` e `npx playwright test` no `frontend-web/` e garantir 100% de sucesso.

## Fase 5: Documentação Operacional e Sincronização
- [ ] T5.1 — Criar o runbook operacional `docs/operations/release-runbook.md` com instruções detalhadas para geração de tags, compilação de release e configuração de variáveis na Vercel.
- [ ] T5.2 — Atualizar `backlog.md` registrando a Spec 018 como ativa/em desenvolvimento e ajustando o roadmap.
- [ ] T5.3 — Atualizar `plan.md` raiz com o resumo da infraestrutura de distribuição de releases e correções do pipeline.

## Checklist de fechamento da feature

- [ ] Diagnóstico e auditoria da Spec 017 documentados no `spec.md` da Spec 018
- [ ] `dorny/paths-filter` corrigido para não ignorar mudanças em pushes para `main`
- [ ] Injeção de `BACKEND_URL` via segredos padronizada nos builds mobile do CI/CD
- [ ] Nomenclatura dos artefatos mobile simétrica (`my-roadie-release.apk` e `my-roadie-release.ipa`)
- [ ] Página `/testers` resiliente contra variáveis ausentes, eliminando quedas em tela 404
- [ ] Suporte a `NEXT_PUBLIC_APK_DOWNLOAD_URL`, `NEXT_PUBLIC_IPA_DOWNLOAD_URL` e `NEXT_PUBLIC_APP_VERSION`
- [ ] Job de publicação de GitHub Release automatizado no CI/CD via tags `v*`
- [ ] Testes unitários do frontend web (Vitest) passando com 100% de sucesso
- [ ] Testes E2E de navegação e botões da página `/testers` (Playwright) passando com 100% de sucesso
- [ ] Runbook operacional criado em `docs/operations/release-runbook.md`
- [ ] Documentos de governança (`backlog.md` e `plan.md`) atualizados e sincronizados
- [ ] Sintaxe do `.github/workflows/ci.yml` validada

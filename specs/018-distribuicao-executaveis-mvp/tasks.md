# Tasks — 018: Hospedagem e Distribuição de Executáveis de Release do MVP

## Fase 0: Mapeamento e Diagnóstico da Base
- [ ] T0.1 — Inspecionar o código de [`frontend-web/src/app/testers/page.tsx`](file:///C:/dev/my-roadie-platform/frontend-web/src/app/testers/page.tsx) e validar comportamento com variáveis de ambiente ausentes e presentes.
- [ ] T0.2 — Inspecionar os jobs de build mobile em [`.github/workflows/ci.yml`](file:///C:/dev/my-roadie-platform/.github/workflows/ci.yml) e validar nomes e caminhos dos arquivos gerados (`app-release.apk` e `my-roadie-release.ipa`).
- [ ] T0.3 — Documentar os resultados da inspeção na seção "Resultados da Inspeção (Fase 0)" de [`specs/018-distribuicao-executaveis-mvp/spec.md`](file:///C:/dev/my-roadie-platform/specs/018-distribuicao-executaveis-mvp/spec.md).

## Fase 1: Padronização de Releases e Configuração de URLs
- [ ] T1.1 — Definir e documentar o padrão canônico das URLs públicas de download para GitHub Releases e Supabase Storage.
- [ ] T1.2 — Atualizar o arquivo [`frontend-web/public/downloads/README.md`](file:///C:/dev/my-roadie-platform/frontend-web/public/downloads/README.md) com o guia de variáveis `NEXT_PUBLIC_APK_DOWNLOAD_URL` e `NEXT_PUBLIC_IPA_DOWNLOAD_URL`.
- [ ] T1.3 — Adicionar suporte a `NEXT_PUBLIC_APP_VERSION` para exibição dinâmica de versão na UI.

## Fase 2: Resiliência da UI da Página `/testers` (Frontend Web)
- [ ] T2.1 — Refatorar [`frontend-web/src/app/testers/page.tsx`](file:///C:/dev/my-roadie-platform/frontend-web/src/app/testers/page.tsx) para verificar se as URLs de download são válidas (iniciam com `http://`, `https://` ou apontam para asset estático existente).
- [ ] T2.2 — Adicionar tratamento visual amigável quando a URL de download não estiver configurada no ambiente (exibir alerta informativo e badge "Em breve / Aguardando build" em vez de permitir o clique que gera erro 404).
- [ ] T2.3 — Adicionar link alternativo seguro para a página de Releases do repositório no GitHub para testadores técnicos.

## Fase 3: Automação de Publicação de Release no CI/CD
- [ ] T3.1 — Adicionar trigger de tags de release (`v*`) em [`.github/workflows/ci.yml`](file:///C:/dev/my-roadie-platform/.github/workflows/ci.yml).
- [ ] T3.2 — Criar o job `publish-github-release` no GitHub Actions condicionado a tags de release, coletando os artefatos de `mobile-android-build` e `mobile-ios-build` e publicando via `softprops/action-gh-release@v2`.
- [ ] T3.3 — Adicionar parâmetro `publish_release` no disparo manual `workflow_dispatch` do CI/CD.

## Fase 4: Testes Unitários e E2E (Vitest e Playwright)
- [ ] T4.1 — Criar/atualizar suíte de testes unitários em `frontend-web/src/app/testers/page.test.tsx` cobrindo cenários com e sem URLs de download configuradas.
- [ ] T4.2 — Criar teste E2E com Playwright em `frontend-web/tests/testers.spec.ts` validando a rota `/testers`, visibilidade das instruções de Android/iOS e atributos dos botões de download.
- [ ] T4.3 — Executar `npm test` e `npx playwright test` no `frontend-web/` e garantir 100% de sucesso.

## Fase 5: Documentação Operacional e Sincronização
- [ ] T5.1 — Criar o runbook operacional `docs/operations/release-runbook.md` com instruções detalhadas para geração de tags, compilação de release e configuração de variáveis na Vercel.
- [ ] T5.2 — Atualizar `backlog.md` registrando a Spec 018 como ativa/em desenvolvimento e ajustando o roadmap.
- [ ] T5.3 — Atualizar `plan.md` raiz com o resumo da infraestrutura de distribuição de releases.

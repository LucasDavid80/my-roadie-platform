# Tasks — 025: Onboarding Legal

## Fase 0: Setup & Preparação
- [x] T0.1: Criar branch `spec/025-onboarding-legal` e inicializar documentação da spec.
- [x] T0.2: Verificar e rodar a base para checar se a build atual não está quebrada antes de começar.

## Fase 1: Implementação Backend (Modelagem e API)
- [x] T1.1: Atualizar `schema.prisma` com os campos `termsAcceptedVersion` e `termsAcceptedAt` na tabela `User`.
- [x] T1.2: Rodar `npx prisma format`, `npx prisma generate`, criar e rodar a migration. Atualizar `docs/database/erd.md`.
- [x] T1.3: Criar um `LegalModule` (e `LegalController`) que expõe via `GET /legal/current-version` a versão atual dos termos (retornando uma constante).
- [x] T1.4: Adicionar o DTO de consentimento e implementar `POST /users/me/consent` no `UsersController` para registrar o aceite e a hora (`new Date()`).
- [x] T1.5: Adicionar testes unitários no service/controller garantindo a integridade desse fluxo.
- [x] T1.6: Adicionar testes E2E para a rota de aceite de termos e para a leitura da versão constante.

## Fase 2: Interface Frontend Web (Next.js)
- [x] T2.1: Criar página pública e estática para visualização dos Termos de Uso (ex: `/termos`).
- [x] T2.2: Criar o componente `LegalConsentModal` para exibição forçada dos termos.
- [x] T2.3: Integrar a lógica global (`AuthContext` ou root layout) para verificar se `user.termsAcceptedVersion < currentVersion`. Se sim, exibe o modal de forma travada.
- [x] T2.4: Integrar botão "Aceitar" do modal com o endpoint `POST /users/me/consent` e atualizar o estado do usuário localmente para liberar o acesso.
- [x] T2.5: Adicionar testes unitários utilizando Vitest e React Testing Library para os componentes `LegalConsentModal` e `LegalConsentWrapper`.
- [x] T2.6: Adicionar teste de integração simulando o fluxo completo de "UX Block" do consentimento (verificação, bloqueio e aceite) no ambiente web.

## Fase 3: Interface Mobile (Flutter)
- [x] T3.1: Criar widget / modal de Termos de Uso no mobile.
- [x] T3.2: Integrar chamada a `GET /legal/current-version` e `POST /users/me/consent` nos repositórios e serviços.
- [x] T3.3: Implementar `LegalGuard` ou injetar a verificação no fluxo após Login/Cadastro e App Startup: se versão não bater, força o modal antes de ir ao Dashboard.
- [x] T3.4: Adicionar testes unitários para a camada de repositório, models e widget (LegalConsentModal) no Mobile.
- [x] T3.5: Adicionar testes E2E/integração validando o fluxo forçado de aceite de termos e navegação no Mobile.

## Fase 4: Fechamento & Sincronização
- [x] T4.1: Atualizar documentação geral (`docs/business-rules/rules.md` sobre consentimento obrigatório).
- [x] T4.2: Marcar checklist de fechamento E os critérios de sucesso em `spec.md`.
- [x] T4.3: Garantir cobertura de teste (>80%).
- [x] T4.4: Solicitar PR para a `main`.

---

## Checklist de fechamento da feature
- [x] Lint limpo (`npm run lint` / `flutter analyze`)
- [x] Testes passando localmente
- [x] `docs/` relevante atualizado (ERD, business-rules, roles-permissions conforme o caso)
- [x] Itens marcados como concluídos por agente de IA que tocam infraestrutura externa foram revisados manualmente
- [x] `spec.md` da baseline atualizado se o comportamento mudou

---

## Fase 5: Correções Pós-Auditoria

> Itens identificados na auditoria realizada em 2026-09-21. Nenhum item desta fase altera código de produto.

### 5.1 — Correções Documentais (agente)
- [x] T5.1: Corrigir caminho em `tasks.md` T4.1: `docs/business-rules.md` → `docs/business-rules/rules.md`.
- [x] T5.2: Corrigir caminho em `plan.md` linha 27: `backend/src/legal/` → `backend/src/modules/legal/`.

### 5.2 — Correções de Versionamento Git (requer ação humana)
- [x] T5.3: Commitar todos os arquivos do backend não versionados (`??` no git status): pasta `backend/src/modules/legal/`, `backend/src/modules/users/dto/consent.dto.ts`, `backend/test/legal.e2e-spec.ts` e `backend/prisma/migrations/20260921000000_add_legal_consent_fields/`.
- [x] T5.4: Commitar os arquivos do backend modificados e não commitados (`M` no git status): `backend/prisma/schema.prisma`, `backend/src/app.module.ts`, `backend/src/modules/users/users.controller.ts`, `backend/src/modules/users/users.service.ts`, `backend/src/modules/users/users.controller.spec.ts`, `backend/src/modules/users/users.service.spec.ts`, `backend/test/users.e2e-spec.ts`.
- [x] T5.5: Verificar (`git diff`) e commitar `mobile/lib/core/guards/legal_guard.dart` (modificado sem commit após o fechamento) — ou reverter se a mudança for indevida.
- [x] T5.6: Verificar (`git diff`) e commitar `specs/025-onboarding-legal/spec.md` (modificado localmente sem commit).
- [x] T5.7: Verificar `frontend-web/src/components/features/events/EventForm.tsx` (modificado sem commit, não pertence a esta spec) — commitar na branch correta ou stash antes de abrir o PR.

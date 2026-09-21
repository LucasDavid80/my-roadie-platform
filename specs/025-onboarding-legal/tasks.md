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
- [ ] T3.1: Criar widget / modal de Termos de Uso no mobile.
- [ ] T3.2: Integrar chamada a `GET /legal/current-version` e `POST /users/me/consent` nos repositórios e serviços.
- [ ] T3.3: Implementar `LegalGuard` ou injetar a verificação no fluxo após Login/Cadastro e App Startup: se versão não bater, força o modal antes de ir ao Dashboard.

## Fase 4: Fechamento & Sincronização
- [ ] T4.1: Atualizar documentação geral (`docs/business-rules.md` sobre consentimento obrigatório).
- [ ] T4.2: Marcar checklist de fechamento E os critérios de sucesso em `spec.md`.
- [ ] T4.3: Garantir cobertura de teste (>80%).
- [ ] T4.4: Solicitar PR para a `main`.

---

## Checklist de fechamento da feature
- [ ] Lint limpo (`npm run lint` / `flutter analyze`)
- [ ] Testes passando localmente
- [ ] `docs/` relevante atualizado (ERD, business-rules, roles-permissions conforme o caso)
- [ ] Itens marcados como concluídos por agente de IA que tocam infraestrutura externa foram revisados manualmente
- [ ] `spec.md` da baseline atualizado se o comportamento mudou

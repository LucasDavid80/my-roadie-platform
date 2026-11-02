# Tasks — 026: Gestão Básica de Bandas e Múltiplos Workspaces

## Fase 0: Setup & Preparação

- [x] T0.1: Criar branch e inicializar `spec.md`, `plan.md` e `tasks.md` da Spec 026.
- [x] T0.2: Confirmar contratos existentes de `Band`, `BandMember`, autorização por banda e dependências entre Web, Mobile e backend.
- [x] T0.3: Definir e documentar a política de integridade para exclusão de banda antes de alterar o schema ou implementar o endpoint.

## Fase 1: Implementação — Backend / Domínio

- [x] T1.1: Criar o módulo `bands` com DTOs, service, controller e registro no módulo raiz.
- [x] T1.2: Implementar listagem e detalhes de bandas respeitando associação via `BandMember`.
- [x] T1.3: Implementar criação transacional de banda com associação automática do criador como `OWNER`.
- [x] T1.4: Implementar edição e exclusão com autorização de `OWNER`/`ADMIN`, validações e integridade referencial.
- [x] T1.5: Atualizar a matriz de permissões e a documentação de banco caso os contratos ou schema sejam alterados.

## Fase 2: Interface & Integração — Web / Mobile

- [x] T2.1: Criar contratos tipados e serviço de API de bandas no frontend Web.
- [x] T2.2: Implementar contexto/provider de workspace ativo e seletor de bandas no Web.
- [x] T2.3: Implementar criação, edição, exclusão e estados de erro/vazio da gestão de bandas no Web.
- [x] T2.4: Criar entidade, model, datasource/repository e controller de bandas no Mobile.
- [x] T2.5: Implementar seletor e fluxo mínimo de gestão de workspace no Mobile.
- [x] T2.6: Integrar o `bandId` ativo às consultas e criações existentes que dependem de banda, sem enviar campos gerados pelo banco.

## Fase 3: Testes Automatizados & Qualidade

- [x] T3.1: Adicionar testes unitários e E2E do backend para sucesso, validação, não membro e `ADMIN`.
- [x] T3.2: Adicionar testes Web para provider, seletor, CRUD e propagação do workspace ativo.
- [x] T3.3: Adicionar testes Mobile de model/repository, controller e widget.
- [x] T3.4: Executar lint, build e testes direcionados dos aplicativos afetados.
- [x] T3.5: Verificar cobertura mínima de 80% em cada aplicativo afetado.
  - Backend: statements 95,31% · branches 80,30% · functions 93,04% · lines 94,94%; módulo `bands` com 88,4% stmts / 88,88% branches / 100% funcs / 90,47% lines. 239 testes passando.
  - Mobile: 87,8% de linhas (sem arquivos gerados); arquivos de bandas entre 95,2% e 100%. 177 testes passando.
  - Frontend Web: arquivos da spec todos ≥ 80% (`bands/page.tsx` 100/96,29/100/100; `WorkspaceContext` 98/84,21/100/100; `BandSelector` 100/87,5/100/100; `band-service` 100/100/100/100). Global: 88,77% stmts · 71,11% branches · 94,11% funcs · 89,24% lines. O déficit global de branches é pré-existente (baseline estimado em ~66,4% antes da 026) e está concentrado em `AuthContext`, `LoginForm` e `api.ts`, fora do escopo desta spec — pendência a tratar em spec própria.

## Fase 4: Fechamento & Sincronização

- [x] T4.1: Atualizar baseline raiz (`spec.md` e `plan.md`) e documentação relacionada com o comportamento efetivamente entregue.
- [ ] T4.2: Revisar o backlog e atualizar o status da feature para o estado correspondente à entrega.
- [ ] T4.3: Marcar simultaneamente o checklist de fechamento de `tasks.md` e os critérios de sucesso de `spec.md`.

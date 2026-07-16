# ✅ Tasks — Baseline v1 (retroativo) + Template

## Parte 1 — O que já está feito (registro retroativo, não executar de novo)

### Fase 0 — Infraestrutura do monorepo
- [x] Estrutura `backend/` (NestJS) + `frontend-web/` (Next.js) + `mobile/` (Flutter) criada.
- [x] CI configurado em `.github/workflows/ci.yml` (Node 22).
- [x] Documentação inicial em `docs/` (arquitetura, auth, business-rules, database, testing, ux, contributing).

### Fase 1 — Auth
- [x] Integração com Supabase Auth.
- [x] Estratégia JWT (`jwt.strategy.ts`) + `JwtAuthGuard`.
- [x] `RolesGuard` e `OwnershipGuard`.
- [x] Testes: `auth.controller.spec.ts`, `auth.service.spec.ts`, `roles.guard.spec.ts`, `ownership.guard.spec.ts`.

### Fase 2 — Users
- [x] Modelo Prisma `User` (com campos estendidos: instrumentos, estilos, disponibilidade etc.).
- [x] CRUD completo no backend (controller, service, DTOs).
- [x] Testes unitários + e2e (`users.e2e-spec.ts`).
- [x] Telas mobile de auth/perfil (`login_page.dart`, `person_screen.dart` e widgets relacionados).

### Fase 3 — Events
- [x] Modelo Prisma `Event` com status (`PENDING`/`CONFIRMED`/`FINISHED`/`CANCELLED`).
- [x] CRUD no backend com DTOs de criação/atualização.
- [x] Testes unitários (`events.controller.spec.ts`, `events.service.spec.ts`).
- [x] Tela mobile de agenda (`principal_screen.dart`, `custom_calendar.dart`, `commitments_widget.dart`).

### Fase 4 — Modelagem avançada (schema apenas)
- [x] Modelos Prisma `Band`, `BandMember`, `Task`, `RepertoireSong`, `Transaction` criados e migrados.
- [ ] **Não feito:** exposição desses modelos via API (controllers/services/DTOs). Ver `plan.md` §2.

### Fase 5 — Mobile (UI)
- [x] Telas de auth, agenda e perfil implementadas.
- [ ] **Não feito:** camada `data/` (datasources, repository, models) — arquivos existem mas estão vazios.

---

## Parte 2 — Template para as próximas features (copiar isto por feature)

> Cada feature nova ganha seu próprio arquivo em `specs/<numero>-<nome-curto>/tasks.md`, seguindo este formato. Numerar as tasks facilita referenciar em commits/PRs.

```markdown
# Tasks — <nome da feature>

Pré-requisitos: <specs/plan de que essa feature depende, se houver>

## Fase 1 — <nome da fase>
- [ ] T1.1 — <tarefa objetiva e testável>
  - Critério de teste: <pelo menos 1 caso positivo + 1 negativo, ou o mínimo definido na constitution.md>
- [ ] T1.2 — ...

## Fase 2 — <nome da fase>
- [ ] T2.1 — ...

## Checklist de fechamento da feature
- [ ] Lint limpo (`npm run lint` / `flutter analyze`)
- [ ] Testes passando localmente
- [ ] `docs/` relevante atualizado (ERD, business-rules, roles-permissions conforme o caso)
- [ ] Itens marcados como concluídos por agente de IA que tocam infraestrutura externa foram revisados manualmente
- [ ] `spec.md` da baseline (ou da feature anterior) atualizado se o comportamento mudou
```

### Sugestão de primeiras specs a abrir (não é obrigatório seguir esta ordem)

1. **API de Tasks** — expor `Task` via backend (fecha o gap da Fase 4).
2. **API de Repertoire** — expor `RepertoireSong` via backend.
3. **API de Transactions** — expor `Transaction` via backend (é a mais sensível: financeiro, vale um cuidado extra de testes).
4. **Mobile ⇄ API real** — implementar a camada `data/` do mobile (fecha o gap da Fase 5), antes de empilhar features novas de mobile em cima de uma UI desconectada.

Essas quatro não são "próximas features" no sentido de novidade de produto — são o que falta para a baseline documentada em `spec.md` bater 100% com o que a API realmente oferece. Fechá-las primeiro (ou pelo menos as que bloqueiam a próxima feature real que você quer construir) evita empilhar spec nova sobre uma base com furos.

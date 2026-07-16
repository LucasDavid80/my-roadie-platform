# 🗺️ Plan — Baseline v1

> Complementa o `spec.md`: aqui entra o **como técnico** do estado atual, não o *o quê*. Serve de referência para os `plan.md` de features futuras não reinventarem decisões já tomadas.

## 1. Arquitetura (C4 — nível 1)

```
Músico/Roadie → frontend-web (Next.js) ┐
Músico/Roadie → mobile (Flutter)       ├→ backend (NestJS) → Supabase (Postgres + Auth)
```

- `frontend-web` e `mobile` são clientes independentes do mesmo backend — nenhum dos dois fala direto com o Supabase para dados de domínio (só para Auth).
- Ver diagrama completo em `docs/architecture/overview.md`.

## 2. Backend

- Estrutura: `src/modules/<dominio>` (hoje: `auth`, `users`, `events`).
- Persistência: Prisma Client sobre Postgres (Supabase). `DATABASE_URL` via env.
- Fluxo de schema: editar `prisma/schema.prisma` → migration → `npx prisma generate` → atualizar `docs/database/erd.md`.
- Autenticação: Supabase Auth emite identidade; backend valida via estratégia JWT (`jwt.strategy.ts`) e guards.

**Lacuna conhecida:** `Task`, `RepertoireSong` e `Transaction` têm `model` no Prisma mas nenhum módulo NestJS. Antes de qualquer feature nova que dependa dessas entidades (ex.: "app de logística mostrando tarefas do evento"), essa lacuna precisa virar uma spec/feature própria (`specs/00X-tasks-api`, `specs/00X-repertoire-api`, etc.), não ser resolvida "de passagem" dentro de outra feature.

## 3. Frontend Web

- Next.js App Router, Route Groups `(auth)` e `(dashboard)`.
- `src/services/` concentra chamadas HTTP; sempre remover `id`/`createdAt`/`updatedAt` antes de `POST`/`PATCH`.
- Tipos de `src/types/` devem espelhar os DTOs do backend.

**Decisão pendente a fechar:** `docs/architecture/frontend.md` ainda lista estilização e gerenciamento de estado como opções entre colchetes, não resolvidas. Antes de iniciar SDD para features de frontend, essa página deveria ser atualizada com a escolha real usada no código (conferir `package.json` do `frontend-web`).

## 4. Mobile

- Clean Architecture: `domain/` → `data/` → `presentation/`.
- Estado atual: telas de auth, agenda e perfil implementadas na camada `presentation/`, mas a camada `data/` (datasources, repository, models) está vazia — a UI ainda roda desconectada do backend.

**Próximo passo natural (mesmo antes de novas features):** uma spec dedicada a "conectar mobile à API" (implementar `remote_datasource.dart`, `agenda_repository_impl.dart`, `event_model.dart`) é provavelmente pré-requisito de qualquer feature nova de mobile, porque sem isso o app mobile não reflete dados reais.

## 5. Testes

- Backend: Jest, `NestJS TestingModule`; testes unitários colocados junto do código (`*.spec.ts`), e2e em `backend/test/`.
- Frontend Web: Vitest.
- Mobile: `flutter_test`, testes já cobrindo vários widgets/controllers em `mobile/test/`.
- Banco de teste isolado (`DATABASE_URL_TEST`) para integração/e2e; migrations aplicadas antes de rodar.

### Cobertura de Testes (Medição de 14/07/2026)

| App | % Statements | % Branches | % Functions | % Lines |
|---|---|---|---|---|
| Backend | 66.35% | 69.35% | 71.42% | 65.89% |
| Frontend Web | 70.00% | 67.39% | 75.00% | 71.59% |
| Mobile | - | - | - | 63.72% |

## 6. CI/CD

- Definido em `.github/workflows/ci.yml`, roda com Node 22.
- Simulação local recomendada via `act --secret-file .secrets` antes de abrir PR.
- Fluxo esperado: lint → unit tests → build → integração/e2e.

## 7. Ambientes e variáveis

| Variável | Onde |
|---|---|
| `DATABASE_URL`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_KEY` | backend |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | frontend-web |
| `SUPABASE_SERVICE_ROLE` | backend apenas, nunca no cliente |

## 8. Débito técnico a considerar antes/junto das próximas features

1. Módulos ausentes: Task, RepertoireSong, Transaction (schema existe, API não).
2. Mobile sem camada de dados implementada.
3. Decisões de stack do frontend-web não fechadas na documentação.
4. Nenhum `spec.md`/`plan.md`/`tasks.md` formal existia antes desta migração — daqui em diante, toda feature nova segue o fluxo descrito em `constitution.md` §8.
5. **Rotas admin não isoladas** — `constitution.md` §9 (atualizado após esta baseline) passou a exigir um Route Group `(admin)` próprio, separado de `(dashboard)`. O código hoje tem `admin` aninhado dentro de `(dashboard)`, sem guard de papel dedicado — está fora do padrão definido depois desta baseline ter sido escrita.
6. **Cobertura de testes não medida contra a meta atual** — `constitution.md` §5 fixou 70-80% por app (backend/frontend-web/mobile). A baseline não tem essa métrica registrada; antes de cobrar 70-80% em features novas, vale rodar a cobertura atual dos três apps para saber o ponto de partida real.
7. **Gaps de LGPD listados em `constitution.md` §10** (consentimento no cadastro, política de exclusão de conta, exportação de dados, log de acesso a dados sensíveis, confirmação de região/criptografia do Supabase) — nenhum desses está implementado hoje; são debt novo, não regressão.

> Itens 5-7 nasceram de uma atualização da `constitution.md` feita **depois** desta baseline ter sido escrita — por isso o código ainda não reflete essas regras. Isso é esperado: a baseline descreve o estado no momento em que foi escrita, não persegue a constituição em tempo real. Quando esses itens forem resolvidos, atualizar este arquivo.

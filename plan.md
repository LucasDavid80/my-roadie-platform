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

- Estrutura: `src/modules/<dominio>` (hoje: `auth`, `users`, `events`, `tasks`, `repertoire`, `transactions`).
- Persistência: Prisma Client sobre Postgres (Supabase). `DATABASE_URL` via env.
- Fluxo de schema: editar `prisma/schema.prisma` → migration → `npx prisma generate` → atualizar `docs/database/erd.md`.
- Autenticação: Supabase Auth emite identidade; backend valida via estratégia JWT (`jwt.strategy.ts`) e guards.

**Lacunas de módulos zeradas:** módulos `Task` (spec 004), `RepertoireSong` (spec 005) e `Transaction` (spec 006) entregues e expostos via API NestJS.

## 3. Frontend Web

- Next.js App Router, Route Groups `(auth)`, `(dashboard)` e `(admin)`.
- `src/services/` concentra chamadas HTTP; sempre remover `id`/`createdAt`/`updatedAt` antes de `POST`/`PATCH`.
- Tipos de `src/types/` devem espelhar os DTOs do backend.
- Instância centralizada do Supabase em `src/lib/supabase.ts`. Autenticação integrada ao Supabase Auth via `signInWithPassword` no `AuthContext` com tratamento de erros e mensagens amigáveis no `LoginForm` (Spec 008).

**Decisão fechada:** A stack do frontend-web foi confirmada e documentada em `docs/architecture/frontend.md` (Tailwind CSS, Context API e Axios).


## 4. Mobile

- Clean Architecture: `domain/` → `data/` → `presentation/`.
- Estado atual: as telas de auth, agenda e perfil estão conectadas à API real do backend através do `remote_datasource` e dos repositories.
- Atualização reativa de compromissos: `AgendaController` sincroniza eventos retornados da API e notifica a UI de forma imutável após criação/edição (Spec 007).
- Estabilização do Perfil (`PersonScreen`): `PhotoWidget` e `InfoWidget` ajustados para layout seguro e parse seguro de tipos; `UserNotifier` inicializado com coleções não nulas e captura de erros HTTP com fallbacks (Spec 009).




## 5. Testes

- Backend: Jest, `NestJS TestingModule`; testes unitários colocados junto do código (`*.spec.ts`), e2e em `backend/test/`.
- Frontend Web: Vitest.
- Mobile: `flutter_test`, testes já cobrindo vários widgets/controllers em `mobile/test/`.
- Banco de teste isolado (`DATABASE_URL_TEST`) para integração/e2e; migrations aplicadas antes de rodar.

### Cobertura de Testes (Medição de 28/07/2026 — Spec 005)

| App | % Statements | % Branches | % Functions | % Lines |
|---|---|---|---|---|
| Backend | 73.49% | 74.54% | 84.61% | 74.55% |
| Frontend Web | 70.00% | 67.39% | 75.00% | 71.59% |
| Mobile | - | - | - | 77.82% |

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

1. Módulos ausentes: nenhum (módulos Task, RepertoireSong e Transaction entregues nas specs 004, 005 e 006).
2. Mobile com camada de dados implementada e conectada (resolvido na spec 003).
3. Decisões de stack do frontend-web não fechadas na documentação (resolvido na spec 001).
4. Nenhum `spec.md`/`plan.md`/`tasks.md` formal existia antes desta migração — daqui em diante, toda feature nova segue o fluxo descrito em `constitution.md` §8.
5. **Rotas admin não isoladas** — `constitution.md` §9 (atualizado após esta baseline) passou a exigir um Route Group `(admin)` próprio, separado de `(dashboard)`. O código hoje tem `admin` aninhado dentro de `(dashboard)`, sem guard de papel dedicado — está fora do padrão definido depois desta baseline ter sido escrita.
6. **Cobertura de testes não medida contra a meta atual** — Resolvido na spec 001 (ver tabela de medição na seção 5).
7. **Gaps de LGPD listados em `constitution.md` §10** (consentimento no cadastro, política de exclusão de conta, exportação de dados, log de acesso a dados sensíveis, confirmação de região/criptografia do Supabase) — nenhum desses está implementado hoje; são debt novo, não regressão.

> Itens 5-7 nasceram de uma atualização da `constitution.md` feita **depois** desta baseline ter sido escrita — por isso o código ainda não reflete essas regras. Isso é esperado: a baseline descreve o estado no momento em que foi escrita, não persegue a constituição em tempo real. Quando esses itens forem resolvidos, atualizar este arquivo.

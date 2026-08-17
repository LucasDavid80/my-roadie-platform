# 📋 Spec — Baseline v1 (estado atual do projeto)

> Este spec não descreve uma feature nova: ele documenta **o que já existe hoje**, para servir de linha de base a partir da qual as próximas specs vão evoluir. Foi montado a partir de `docs/business-rules/rules.md`, `docs/database/erd.md`, `docs/auth/roles-permissions.md` e conferido contra o código real do `backend/src/modules` e do `mobile/lib`.

## 1. Objetivo do produto

Plataforma para músicos e roadies organizarem agendas, eventos, tarefas, repertório e finanças de suas bandas, com três frentes: web (gestão), mobile (uso em campo) e uma API central.

## 2. Atores

| Papel | Pode |
|---|---|
| **MUSICIAN** | Criar/editar eventos, tarefas e repertório da própria banda; ver transações e eventos das bandas em que participa |
| **ROADIE** | Permissões parecidas com MUSICIAN; costuma ser responsável por tarefas/logística de eventos |
| **ADMIN** | Acesso global: CRUD irrestrito de usuários, bandas, eventos e transações |

## 3. Entidades de dados (modeladas no Prisma)

- **User** — email (único), nome, role, `supabaseId` (único), telefone, instagram, cidade/UF, cachê mínimo, link do YouTube, bio, instrumentos, estilos, disponibilidade.
- **Band** — nome; tem membros, eventos, repertório e transações.
- **BandMember** — vincula User↔Band, com papel dentro da banda (ex.: owner/member), único por `[userId, bandId]`.
- **Event** — título, data, local, descrição, status (`PENDING`, `CONFIRMED`, `FINISHED`, `CANCELLED`), pertence a uma Band, tem um criador (User).
- **Task** — descrição, `isDone`, pertence a um Event (cascade delete).
- **RepertoireSong** — título, artista, tom, posição, notas; pertence a uma Band.
- **Transaction** — descrição, valor (decimal), tipo (`INCOME`/`EXPENSE`), data; vinculada a Band, opcionalmente a Event, e a um User.

## 4. O que está de fato implementado hoje (verificado no código)

### Backend (`backend/src/modules/`)
- ✅ **auth** — login via Supabase Auth, estratégia JWT com validação dinâmica de algoritmos ES256 (JWKS) e HS256 em `JwtStrategy`, `JwtAuthGuard` com logs estruturados e exceções 401 descritivas (`TOKEN_EXPIRED`, `INVALID_SIGNATURE`, `MALFORMED_TOKEN`, `MISSING_BEARER`) (Spec 012).
- ✅ **users** — CRUD completo (`POST /users`, `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id`), com testes unitários e e2e.
- ✅ **events** — CRUD de eventos com DTOs de criação/atualização e testes.
- ✅ **tasks** — CRUD completo de tarefas (`POST /tasks`, `GET /tasks`, `GET /tasks/:id`, `PATCH /tasks/:id`, `DELETE /tasks/:id`), com DTOs validados via `class-validator`, autorização por banda via `BandAccessService`, e cobertura de testes unitários e E2E.
- ✅ **repertoire** — CRUD completo de músicas do repertório (`POST /repertoire`, `GET /repertoire`, `GET /repertoire/:id`, `PATCH /repertoire/:id`, `DELETE /repertoire/:id`), com DTOs validados via `class-validator`, autorização por banda via `BandAccessService`, e cobertura de testes unitários e E2E.
- ✅ **transactions** — CRUD completo de lançamentos financeiros (`POST /transactions`, `GET /transactions`, `GET /transactions/:id`, `PATCH /transactions/:id`, `DELETE /transactions/:id`), com DTOs validados via `class-validator`, autorização por banda via `BandAccessService`, e cobertura de testes unitários e E2E.
- ✅ **band-access** — Módulo reutilizável `BandAccessModule` / `BandAccessService` com `getUserBandIds` e `assertMembership`, garantindo autorização restrita por associação em `BandMember` nos módulos `tasks`, `repertoire` e `transactions` (Spec 011).

### Frontend Web (`frontend-web/src/`)
- Rotas presentes: `(auth)/login`, `(auth)/register`, `(dashboard)/dashboard`, `(dashboard)/profile`, `(admin)/admin`.
- Serviços de API e contexto de autenticação (`AuthContext`) existem na estrutura.
- A stack do frontend-web foi confirmada e documentada em `docs/architecture/frontend.md` (Tailwind CSS, Context API e Axios), eliminando os placeholders.
- ✅ **Autenticação e Cadastro via Supabase Auth:** Módulo `src/lib/supabase.ts` centraliza a instância do Supabase. `AuthContext` efetua autenticação real via `supabase.auth.signInWithPassword`, e `LoginForm` exibe mensagens de erro amigáveis (Spec 008). Rota `/register` acessível e integrada ao `supabase.auth.signUp` e à API do backend NestJS (`POST /users`) com mensagens de erro (Spec 010).
- ✅ **Deduplicação de `fetchProfile` e Mensagens 401:** `AuthContext` deduplica o carregamento de perfil via `useRef` garantindo disparo único de `fetchProfile`, com `LoginForm` exibindo feedbacks descritivos de erro da API (Spec 012).

### Mobile (`mobile/lib/`)
- Telas presentes e com bastante conteúdo: login/signup (`presentation/screens/auth`), agenda/calendário (`presentation/screens/principal`), perfil (`presentation/screens/person`).
- ✅ **Camada de dados e cadastro sincronizado:** `data/datasources/remote_datasource.dart`, `data/repositories/agenda_repository_impl.dart`, `data/repositories/user_repository_impl.dart` e `auth_remote_datasource.dart` conectam a interface mobile aos endpoints do backend e ao Supabase Auth (`POST /users`), garantindo a criação de perfis no PostgreSQL com tratamento de erros na UI (Spec 010).
- ✅ **Reatividade de compromissos:** A lista de compromissos e o calendário na tela de Agenda atualizam imediatamente no aplicativo mobile após a criação/edição de eventos (Spec 007).
- ✅ **Carregamento e Salvamento do Perfil Mobile:** Injeção do JWT de sessão do Supabase no `RemoteDataSource._getHeaders()` para evitar erros HTTP 401 Unauthorized, com `UserNotifier`/`PersonScreen` expondo mensagens de erro reais na UI em vez de falhas silenciosas, com testes unitários, de widget e de integração para o fluxo de carregamento e edição do perfil (Spec 009).
- ✅ **Deduplicação de `fetchProfile` e Tratamento Visual de Erro:** `UserNotifier` com trava de requisição prevenindo execuções síncronas redundantes de `fetchProfile`, com exibição de erros 401 legíveis ao usuário via UI/SnackBar (Spec 012).
- ✅ **Rolagem da Agenda sobre o calendário:** `CustomCalendar` restringe o `TableCalendar` a `AvailableGestures.horizontalSwipe`, liberando o arraste vertical para o `SingleChildScrollView` da `PrincipalScreen`; a navegação horizontal, as setas do cabeçalho, a seleção de dias e os marcadores de eventos foram preservados e cobertos por teste de widget (Spec 013).

## 5. Regras de negócio confirmadas (das que já têm API)

1. Conta é criada no Supabase Auth e depois o perfil é criado no backend usando o `supabaseId`.
2. Rotas protegidas exigem JWT válido (com verificação de algoritmo ES256/JWKS e HS256, gerando exceções descritivas como `TOKEN_EXPIRED`, `INVALID_SIGNATURE`, `MALFORMED_TOKEN` e `MISSING_BEARER` no `JwtAuthGuard`).
3. Um usuário só atualiza/deleta o próprio perfil, a menos que seja `ADMIN`.
4. Eventos pertencem a uma Band; edição/exclusão é restrita a criador, membro com permissão, ou `ADMIN`.
5. `ValidationPipe` com whitelist rígida: payloads com campos extras (`id`, `createdAt`, `updatedAt`) são rejeitados com 400.
6. Recursos dos módulos `tasks`, `repertoire` e `transactions` exigem associação à `Band` dona via `BandMember` (`403 Forbidden` para não-membros), exceto para `ADMIN` (acesso global). `GET` sem `bandId` filtra automaticamente pelas bandas do usuário (Spec 011).
7. O carregamento de perfil (`fetchProfile`) é executado estritamente uma única vez por ciclo de autenticação na Web e no Mobile, evitando chamadas duplicadas ao backend.

## 6. Fora do escopo desta baseline (não construído ainda)

- Módulo de **logística** — citado como exemplo em `docs/architecture/backend.md` (`ex: events, users, logistics`), mas não existe nenhum código para isso. É uma menção aspiracional, não uma feature.
- Exposição via API de **Transaction** (resolvido na spec 006; API de Tasks na spec 004, API de Repertoire na spec 005).
- Integração do mobile com a API real (resolvido na spec 003).

## 7. Critério de "pronto" desta baseline

Esta spec serve como referência congelada. Ela é considerada válida enquanto bater com o código — atualizada após os ajustes de UX da Agenda (Spec 013). Se qualquer item da seção 4 mudar nas próximas specs, este arquivo deve ser atualizado na spec correspondente.


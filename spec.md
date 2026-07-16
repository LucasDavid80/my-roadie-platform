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
- ✅ **auth** — login via Supabase Auth, estratégia JWT, guards (`JwtAuthGuard`, `RolesGuard`, `OwnershipGuard`).
- ✅ **users** — CRUD completo (`POST /users`, `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id`), com testes unitários e e2e.
- ✅ **events** — CRUD de eventos com DTOs de criação/atualização e testes.
- ⚠️ **Task, RepertoireSong, Transaction** — **existem apenas no `schema.prisma`**. Não há módulo NestJS (`controller`/`service`/`dto`) para nenhum dos três ainda. Ou seja: as regras descritas em `docs/business-rules/rules.md` para tarefas, repertório e transações são o *comportamento pretendido*, não o *comportamento disponível via API* hoje.

### Frontend Web (`frontend-web/src/`)
- Rotas presentes: `(auth)/login`, `(auth)/register`, `(dashboard)/dashboard`, `(dashboard)/profile`, `(admin)/admin`.
- Serviços de API e contexto de autenticação (`AuthContext`) existem na estrutura.
- A stack do frontend-web foi confirmada e documentada em `docs/architecture/frontend.md` (Tailwind CSS, Context API e Axios), eliminando os placeholders.

### Mobile (`mobile/lib/`)
- Telas presentes e com bastante conteúdo: login/signup (`presentation/screens/auth`), agenda/calendário (`presentation/screens/principal`), perfil (`presentation/screens/person`).
- ⚠️ **Camada de dados vazia:** `data/datasources/remote_datasource.dart`, `data/datasources/local_datasource.dart`, `data/repositories/agenda_repository_impl.dart` e `data/models/event_model.dart` existem como arquivos, mas **estão em branco (0 bytes)**. Ou seja: a UI do mobile hoje não está de fato conectada ao backend — é a interface pronta, esperando a integração.

## 5. Regras de negócio confirmadas (das que já têm API)

1. Conta é criada no Supabase Auth e depois o perfil é criado no backend usando o `supabaseId`.
2. Rotas protegidas exigem JWT válido.
3. Um usuário só atualiza/deleta o próprio perfil, a menos que seja `ADMIN`.
4. Eventos pertencem a uma Band; edição/exclusão é restrita a criador, membro com permissão, ou `ADMIN`.
5. `ValidationPipe` com whitelist rígida: payloads com campos extras (`id`, `createdAt`, `updatedAt`) são rejeitados com 400.

## 6. Fora do escopo desta baseline (não construído ainda)

- Módulo de **logística** — citado como exemplo em `docs/architecture/backend.md` (`ex: events, users, logistics`), mas não existe nenhum código para isso. É uma menção aspiracional, não uma feature.
- Exposição via API de **Task, RepertoireSong e Transaction** (ver seção 4).
- Integração do mobile com a API real.

## 7. Critério de "pronto" desta baseline

Esta spec serve como referência congelada. Ela é considerada válida enquanto bater com o código — se qualquer item da seção 4 mudar (ex.: alguém implementar o módulo de Tasks), este arquivo deve ser atualizado no mesmo PR que implementa a mudança.

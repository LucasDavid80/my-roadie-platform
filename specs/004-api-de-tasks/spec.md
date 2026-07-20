# Spec — 004: API de Tasks

## Objetivo

Expor a entidade `Task` (tarefas / checklist de eventos) via API HTTP/REST no backend NestJS (`backend/src/modules/tasks/`), permitindo criar, listar, buscar, atualizar e remover tarefas vinculadas a compromissos e eventos de bandas.

## Por quê

O modelo `Task` já foi definido no banco de dados (`prisma/schema.prisma`) com seu relacionamento `Event -> Task` (com exclusão em cascata). No entanto, o backend ainda não possui o módulo NestJS correspondente (`TasksModule`), controllers, serviços ou DTOs expostos.

Conforme a `constitution.md` §3 ("schema não é feature entregue"), uma entidade só se torna disponível para o ecossistema quando possui a camada de API exposta e validada. A disponibilização da API de Tasks desbloqueia funcionalidades críticas de gestão de logística e checklist no web e no mobile (como o inventário de equipamentos e checklist de carga / roadie check).

## Escopo

- Criar a estrutura do módulo NestJS `src/modules/tasks/` no projeto `backend`.
- Implementar DTOs (`CreateTaskDto`, `UpdateTaskDto`) com validações rigorosas via `class-validator` (`IsString`, `IsNotEmpty`, `IsBoolean`, `IsUUID`, `IsOptional`).
- Implementar `TasksService` encapsulando operações CRUD no banco de dados via `PrismaService`.
- Implementar `TasksController` com suporte às seguintes operações:
  - `POST /tasks`: Criar uma nova tarefa vinculada a um `eventId`.
  - `GET /tasks`: Listar tarefas (filtráveis por `eventId`).
  - `GET /tasks/:id`: Buscar uma tarefa pelo ID.
  - `PATCH /tasks/:id`: Atualizar campos de uma tarefa (ex.: `description`, `isDone`).
  - `DELETE /tasks/:id`: Remover uma tarefa pelo ID.
- Proteger todas as rotas do controlador com `JwtAuthGuard`.
- Registrar o `TasksModule` no `AppModule`.
- Implementar testes unitários (`tasks.service.spec.ts`, `tasks.controller.spec.ts`) e testes de integração E2E (`backend/test/tasks.e2e-spec.ts`).

## Fora de escopo

- Alterações ou migrações no esquema Prisma (`prisma/schema.prisma`), pois o modelo `Task` existente atende integralmente os requisitos básicos.
- Telas ou componentes visuais no Frontend Web (`frontend-web/`) ou Mobile (`mobile/`) — a integração de interface será feita em specs subsequentes.
- Sistema avançado de atribuição de responsáveis por tarefa ou agendamento de datas limite de conclusão (o modelo `Task` contempla `id`, `description`, `isDone`, `eventId`, `createdAt`).

## Critérios de Sucesso

- [ ] Endpoints HTTP para criação, listagem, busca por ID, edição e remoção de tarefas funcionando corretamente.
- [ ] Requisições `POST` e `PATCH` validadas por DTOs com `ValidationPipe` e `forbidNonWhitelisted: true`.
- [ ] Chamadas sem token JWT apropriado rejeitadas com HTTP 401 Unauthorized.
- [ ] Testes unitários do `TasksService` e `TasksController` cobrindo casos de sucesso e tratamento de erros (ex.: tarefa não encontrada -> HTTP 404).
- [ ] Testes de integração E2E cobrindo o fluxo completo da API de tarefas.
- [ ] Cobertura de testes do backend atende a meta estipulada em `constitution.md` §5 (mínimo 70%).

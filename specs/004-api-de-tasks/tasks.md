# Tasks — 004: API de Tasks

Pré-requisitos: nenhum.

## Fase 1 — Setup de DTOs e Estrutura do Módulo

- [x] T1.1 — Criar os DTOs `CreateTaskDto` e `UpdateTaskDto` em `backend/src/modules/tasks/dto/`.
  - Critério: DTOs possuem anotações de validação com `class-validator` (`IsString`, `IsNotEmpty`, `IsBoolean`, `IsUUID`, `IsOptional`).
- [x] T1.2 — Criar o módulo NestJS `TasksModule` em `backend/src/modules/tasks/tasks.module.ts`.
  - Critério: Módulo declara `TasksController`, `TasksService` e importa `PrismaModule`.

## Fase 2 — Lógica de Negócio e Controladora

- [x] T2.1 — Implementar `TasksService` em `backend/src/modules/tasks/tasks.service.ts`.
  - Critério: Métodos `create`, `findAll`, `findOne`, `update` e `remove` operando com `PrismaService`, lançando `NotFoundException` para IDs ou `eventId` inexistentes.
- [x] T2.2 — Implementar `TasksController` em `backend/src/modules/tasks/tasks.controller.ts`.
  - Critério: Rotas expostas em `/tasks` protegidas por `JwtAuthGuard` respondendo com os códigos HTTP adequados (201, 200, 204, 404).
- [x] T2.3 — Registrar `TasksModule` no `AppModule` (`backend/src/app.module.ts`).
  - Critério: Aplicação NestJS inicia sem erros de injeção de dependência.

## Fase 3 — Testes Unitários e Integração E2E

- [x] T3.1 — Criar testes unitários para `TasksService` em `backend/src/modules/tasks/tasks.service.spec.ts`.
  - Critério: Cobertura com mocks do `PrismaService`, contendo ao menos 1 caso positivo e 1 caso negativo (not found) por método.
- [x] T3.2 — Criar testes unitários para `TasksController` em `backend/src/modules/tasks/tasks.controller.spec.ts`.
  - Critério: Testar delegação correta ao serviço e retorno dos endpoints para casos de sucesso e erro.
- [ ] T3.3 — Criar suite de testes E2E em `backend/test/tasks.e2e-spec.ts`.
  - Critério: Testes cobrindo criação, listagem por evento, busca por ID, atualização, deleção e rejeição de requisições não autenticadas (401).

## Checklist de fechamento da feature

- [ ] `TasksModule` registrado em `backend/src/app.module.ts`
- [ ] Testes unitários (`npm test`) executando e passando no backend
- [ ] Testes E2E (`npm run test:e2e`) executando e passando no backend
- [ ] Cobertura do backend atinge os requisitos de `constitution.md` §5 (≥ 70%)
- [ ] Status atualizado em `backlog.md` para "concluído" ao finalizar a feature

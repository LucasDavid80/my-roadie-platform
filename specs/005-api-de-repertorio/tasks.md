# Tasks — 005: API de Repertório

Pré-requisitos: nenhum.

## Fase 1 — Setup de DTOs e Estrutura do Módulo

- [x] T1.1 — Criar os DTOs `CreateRepertoireSongDto` e `UpdateRepertoireSongDto` em `backend/src/modules/repertoire/dto/`.
  - Critério: DTOs possuem anotações de validação com `class-validator` (`IsString`, `IsNotEmpty`, `IsInt`, `IsUUID`, `IsOptional`).
- [x] T1.2 — Criar o módulo NestJS `RepertoireModule` em `backend/src/modules/repertoire/repertoire.module.ts`.
  - Critério: Módulo declara `RepertoireController`, `RepertoireService` e importa `PrismaModule`.

## Fase 2 — Lógica de Negócio e Controladora

- [ ] T2.1 — Implementar `RepertoireService` em `backend/src/modules/repertoire/repertoire.service.ts`.
  - Critério: Métodos `create`, `findAll`, `findOne`, `update` e `remove` operando com `PrismaService`, lançando `NotFoundException` para IDs ou `bandId` inexistentes.
- [ ] T2.2 — Implementar `RepertoireController` em `backend/src/modules/repertoire/repertoire.controller.ts`.
  - Critério: Rotas expostas em `/repertoire` protegidas por `JwtAuthGuard` respondendo com os códigos HTTP adequados (201, 200, 204, 404).
- [ ] T2.3 — Registrar `RepertoireModule` no `AppModule` (`backend/src/app.module.ts`).
  - Critério: Aplicação NestJS inicia sem erros de injeção de dependência.

## Fase 3 — Testes Unitários e Integração E2E

- [ ] T3.1 — Criar testes unitários para `RepertoireService` em `backend/src/modules/repertoire/repertoire.service.spec.ts`.
  - Critério: Cobertura com mocks do `PrismaService`, contendo ao menos 1 caso positivo e 1 caso negativo (not found) por método.
- [ ] T3.2 — Criar testes unitários para `RepertoireController` em `backend/src/modules/repertoire/repertoire.controller.spec.ts`.
  - Critério: Testar delegação correta ao serviço e retorno dos endpoints para casos de sucesso e erro.
- [ ] T3.3 — Criar suite de testes E2E em `backend/test/repertoire.e2e-spec.ts`.
  - Critério: Testes cobrindo criação, listagem por banda, busca por ID, atualização, deleção e rejeição de requisições não autenticadas (401).

## Checklist de fechamento da feature

- [ ] `RepertoireModule` registrado em `backend/src/app.module.ts`
- [ ] Testes unitários (`npm test`) executando e passando no backend
- [ ] Testes E2E (`npm run test:e2e`) executando e passando no backend
- [ ] Cobertura do backend atinge os requisitos de `constitution.md` §5 (≥ 80%)
- [ ] Status atualizado em `backlog.md` para "concluído" ao finalizar a feature

# Tasks — 014: Corrigir Criação de Compromisso no Dispositivo Físico

Pré-requisitos: `spec.md` e `plan.md` aprovados.

## Fase 0 — Diagnóstico & Validação Prévia

- [x] T0.1 — Inspecionar `backend/src/modules/events/` e mapear campos necessários do schema Prisma (`prisma/schema.prisma`) para eventos.
- [x] T0.2 — Confirmar o comportamento da rota `POST /events` atual e testar a reprodução do erro 404 / 400.
- [x] T0.3 — Inspecionar o fluxo de chamada de `NewAppointmentWidget` -> `AgendaController.addOrUpdateEvent` -> `AgendaRepositoryImpl` -> `RemoteDataSource.saveEvent`.

## Fase 1 — Backend: Habilitar e Estruturar Módulo de Eventos

- [x] T1.1 — Atualizar `CreateEventDto` e `UpdateEventDto` com `class-validator` e campos do modelo `Event` (`title`, `date`, `location`, `description`, `bandId`, `status`).
- [x] T1.2 — Importar `PrismaModule` em `EventsModule` e implementar `EventsService` com operações CRUD no Prisma conectando `createdBy` (via `createdById`) e `band`.
- [x] T1.3 — Descomentar e estruturar `EventsController` com `@UseGuards(JwtAuthGuard)` e decorators de rota (`@Post()`, `@Get()`, `@Patch(':id')`, `@Delete(':id')`), extraindo o usuário logado para criação.
- [x] T1.4 — Criar/atualizar testes unitários (`events.controller.spec.ts`, `events.service.spec.ts`) e testes E2E para o módulo de eventos.

## Fase 2 — Mobile: Integração de Dados e Tratamento Visual de Erros

- [x] T2.1 — Ajustar `RemoteDataSource.saveEvent` para enviar payload sanitizado (removendo `id` temporário no caso de criação e convertendo tipos de forma compatível).
- [x] T2.2 — Adicionar tratamento visual de erro (ex.: `ScaffoldMessenger.of(context).showSnackBar`) em `NewAppointmentWidget` para exibir mensagens de erro amigáveis ao usuário quando a requisição falhar.
- [x] T2.3 — Assegurar que `AgendaController.addOrUpdateEvent` trate o retorno do backend e atualize a lista de eventos com a entidade persistida.

## Fase 3 — Testes Automatizados & Validação

- [x] T3.1 — Escrever testes de widget e unitários no mobile para o formulário de criação de compromissos (`NewAppointmentWidget` e `AgendaController`) cobrindo cenários de sucesso e erro.
- [x] T3.2 — Executar suite de testes do mobile (`flutter test`) e do backend (`npm test` / `npm run test:e2e`) garantindo 100% de aprovação.
- [x] T3.3 — Documentar o guia de execução e testes em dispositivo físico (`adb reverse tcp:3000 tcp:3000` / `--dart-define=BACKEND_URL`).

## Fase 4 — Fechamento

- [x] T4.1 — Atualizar `backlog.md` marcando a spec 014 como concluída.
- [ ] T4.2 — Atualizar a baseline da raiz (`spec.md` / `plan.md`) com o status dos endpoints de eventos e sincronização mobile.
- [ ] T4.3 — Revisar critérios de sucesso em `spec.md` da spec 014 e validar checklist final.

## Checklist de fechamento da feature

- [ ] `POST /events` e `GET /events` ativos e testados no backend NestJS
- [ ] `NewAppointmentWidget` com feedback visual de erro na UI
- [ ] Payload de evento compatível entre Flutter e NestJS/Prisma
- [ ] Testes automatizados do backend e mobile passando sem regressões
- [ ] Baseline e backlog devidamente sincronizados

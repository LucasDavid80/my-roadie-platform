# Tasks — 015: Extensão do Modelo de Eventos & Ações do Card de Compromisso

Pré-requisitos: `spec.md` e `plan.md` aprovados.

## Fase 0 — Diagnóstico & Validação Prévia

- [x] T0.1 — Inspecionar o modelo `Event` e `Transaction` em `backend/prisma/schema.prisma` e mapear colunas/relações a ajustar (`startTime`, `endTime`, `type`, `fee`, `onDelete: Cascade`).
- [x] T0.2 — Inspecionar `CreateEventDto`, `UpdateEventDto`, `EventsService` e `EventsController` no backend NestJS para criação/atualização de transações vinculadas.
- [x] T0.3 — Inspecionar `EventEntity`, `EventModel`, `CommitmentCard`, `CommitmentsWidget` e `NewAppointmentWidget` no app mobile.
- [x] T0.4 — Documentar os resultados da inspeção da Fase 0 em `specs/015-extensao-modelo-eventos-e-acoes-card/spec.md`.

## Fase 1 — Schema Prisma, Geração do Client & Tipos

- [x] T1.1 — Atualizar o modelo `Event` e a relação com `Transaction` em `backend/prisma/schema.prisma` com `startTime`, `endTime`, `type`, `fee` e `onDelete: Cascade`.
- [x] T1.2 — Executar `npx prisma generate` no diretório `backend/` para atualizar o client do Prisma.
- [x] T1.3 — Atualizar a documentação do banco de dados em `docs/database/erd.md` refletindo os novos campos e o relacionamento com `Transaction`.
- [x] T1.4 — Criar/atualizar a tipagem de `EventEntity` no frontend web (`frontend-web/src/types/event.ts`).

## Fase 2 — Backend: DTOs, Service, Controller & Sincronização de Transações

- [x] T2.1 — Atualizar `CreateEventDto` e `UpdateEventDto` com validações `class-validator` para `startTime`, `endTime`, `type` e `fee`.
- [x] T2.2 — Atualizar `backend/src/modules/events/entities/event.entity.ts` com as novas propriedades.
- [x] T2.3 — Atualizar `EventsService` para persistir os campos de `Event` e sincronizar automaticamente uma `Transaction` do tipo `INCOME` quando `fee > 0` na criação e atualização.
- [x] T2.4 — Atualizar os testes unitários do backend (`events.service.spec.ts` e `events.controller.spec.ts`) cobrindo os novos campos, a sincronização de `Transaction` e a exclusão com autorização.
- [x] T2.5 — Atualizar os testes E2E do backend (`backend/test/events.e2e-spec.ts`) validando o ciclo completo de criação com transação, consulta, atualização e exclusão.

## Fase 3 — Mobile: Models, Ações do Card de Compromisso & Layout

- [x] T3.1 — Atualizar `EventModel.toCreatePayload()` e `EventModel.fromMap()` para serializar e desserializar `startTime`, `endTime`, `type` e `fee`.
- [x] T3.2 — Atualizar `CommitmentCard` substituindo o ícone estático por um `IconButton` funcional com modal de confirmação para exclusão de compromisso.
- [x] T3.3 — Conectar o callback de exclusão em `CommitmentsWidget` e `PrincipalScreen` chamando `AgendaController.deleteEvent(id)` com feedback visual (`SnackBar`).
- [x] T3.4 — Ajustar o layout horizontal, a renderização dinâmica do campo Cachê (exibido apenas para `Show` e `Gravação`) e o alinhamento centralizado do botão de submissão em `NewAppointmentWidget`.
- [x] T3.5 — Atualizar/criar testes unitários e de widget no Flutter (`agenda_controller_test.dart`, `commitment_card_test.dart`, `new_appointment_widget_test.dart`).

## Fase 4 — Validação Integrada & Testes Automatizados

- [x] T4.1 — Executar os testes automatizados do backend (`npm test` e `npm run test:e2e` em `backend/`).
- [ ] T4.2 — Executar os testes automatizados do mobile (`flutter test` em `mobile/`).
- [ ] T4.3 — Validar a integridade dos builds do backend, web e mobile (`npm run build` / `flutter analyze`).

## Fase 5 — Fechamento & Sincronização de Documentação

- [ ] T5.1 — Atualizar `backlog.md` marcando a spec 015 como concluída.
- [ ] T5.2 — Atualizar a baseline da raiz (`spec.md` / `plan.md`) com a extensão do modelo de eventos e a sincronização financeira.
- [ ] T5.3 — Validar o checklist de fechamento em `tasks.md`.

## Checklist de fechamento da feature

- [ ] Modelo `Event` no Prisma atualizado com `startTime`, `endTime`, `type`, `fee` e `npx prisma generate` executado
- [ ] `docs/database/erd.md` devidamente atualizado
- [ ] Endpoints do backend NestJS sincronizando `Transaction` (`INCOME`) automaticamente ao informar cachê (`fee > 0`)
- [ ] App mobile enviando horários, cachê e tipo ao backend e persistindo corretamente
- [ ] Exclusão de compromisso funcionando no `CommitmentCard` com confirmação e feedback visual
- [ ] Layout e alinhamento de `NewAppointmentWidget` refinados
- [ ] Testes automatizados do backend e mobile passando sem regressões
- [ ] `backlog.md`, `spec.md` e `plan.md` atualizados

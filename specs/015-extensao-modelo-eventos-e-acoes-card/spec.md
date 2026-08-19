# Spec — 015: Extensão do Modelo de Eventos & Ações do Card de Compromisso

## Objetivo

Estender o modelo `Event` no banco de dados (Prisma) e na API backend (NestJS) para suportar e persistir os campos de horário de início (`startTime`), horário de término (`endTime`), tipo de evento (`type`) e cachê (`fee`), sincronizando automaticamente o cachê do evento com o módulo financeiro (`Transaction`), além de habilitar no aplicativo mobile o envio/recebimento completo desses dados, implementar o fluxo interativo de exclusão/cancelamento de compromissos com confirmação no `CommitmentCard`, e aplicar ajustes de layout/alinhamento no formulário de criação/edição.

## Por quê

- **Completude do ciclo de vida da Agenda (Fase 1 do Backlog)**: Após a estabilização da criação e sincronização com o backend na spec 014, o app mobile já coleta e exibe horários, tipo e cachê na interface, mas esses campos não eram persistidos no banco de dados, sendo perdidos após o reload ou limitados a valores padrão em memória.
- **Sincronização entre Agenda e Financeiro (`Transaction`)**: O `Event` já possui relacionamento com `Transaction`. Quando um compromisso tem cachê informado (`fee > 0`), o backend deve sincronizar automaticamente uma receita (`INCOME`) no livro-caixa da banda, evitando retrabalho do usuário de lançar o mesmo valor duas vezes.
- **Ação de Exclusão Inoperante**: O botão/ícone de exclusão no `CommitmentCard` era estático ou não chamava a rota `DELETE /events/:id` na API nem atualizava a lista de eventos de forma reativa.
- **Consistência de Contratos e Banco de Dados**: Alinhar o schema do Prisma (`prisma/schema.prisma`), os DTOs do backend (`CreateEventDto`, `UpdateEventDto`), a entidade do backend, a documentação do banco (`docs/database/erd.md`), os tipos do frontend web e os models/entities do Flutter.
- **Refinamento de UX/UI**: Otimizar a distribuição horizontal dos campos e centralizar o botão de ação no modal/card `NewAppointmentWidget`.

## Escopo

1. **Schema & Banco de Dados (`backend/prisma/schema.prisma` e `docs/database/erd.md`)**:
   - Adicionar os campos ao modelo `Event`:
     - `startTime`: `String?` (formato `"HH:mm"`, ex.: `"19:30"`)
     - `endTime`: `String?` (formato `"HH:mm"`, ex.: `"22:00"`)
     - `type`: `String?` (ex.: `"Show"`, `"Ensaio"`, `"Gravação"`, `"Reunião"`, default: `"Show"`)
     - `fee`: `Decimal? @db.Decimal(10, 2)` (valor monetário do cachê acordado)
   - Configurar `onDelete: Cascade` na relação de `Event.transactions` em `Transaction` para integridade referencial em caso de remoção do evento.
   - Executar `npx prisma generate` e atualizar `docs/database/erd.md`.

2. **Backend NestJS (`backend/src/modules/events/`)**:
   - `CreateEventDto` e `UpdateEventDto`:
     - Adicionar validações de `startTime` (`@IsOptional() @IsString()`), `endTime` (`@IsOptional() @IsString()`), `type` (`@IsOptional() @IsString()`), e `fee` (`@IsOptional() @IsNumber()`).
   - `EventsService`:
     - Mapear `startTime`, `endTime`, `type`, `fee` nos métodos `create`, `findAll`, `findOne`, `update`.
     - **Sincronização Automática com `Transaction`**:
       - Ao criar um evento com `fee > 0`, registrar uma `Transaction` (`type: INCOME`, `amount: fee`, `eventId: event.id`, `bandId: resolvedBandId`, `userId: userId`, `description: "Cachê - <Título do Evento>"`).
       - Ao atualizar um evento, sincronizar o valor (`amount`) e descrição da `Transaction` vinculada caso o `fee` ou `title` sejam modificados.
     - Garantir que `remove(id, user)` exclua o evento com verificação de permissão/membership e limpe as transações automáticas vinculadas.
   - Testes unitários (`events.service.spec.ts`, `events.controller.spec.ts`) e testes E2E (`events.e2e-spec.ts`) cobrindo criação, atualização, listagem, sincronização de transação e remoção com os novos campos.

3. **Frontend Web (`frontend-web/`)**:
   - Atualizar a interface `EventEntity` em `src/types/` (ou criar `src/types/event.ts`) refletindo os novos campos para consistência do monorepo.

4. **Mobile Flutter (`mobile/`)**:
   - `EventEntity` & `EventModel`:
     - Atualizar `toCreatePayload()` e `toMap()` para incluir `startTime`, `endTime`, `type` e `fee`.
     - Garantir parsing seguro de `fee` (numérico/Decimal para `double`) e strings de horário no `fromMap()`.
   - `CommitmentCard`:
     - Substituir o ícone estático por um `IconButton` funcional com ícone de lixeira.
     - Implementar modal de confirmação de exclusão ("Excluir Compromisso? Esta ação não pode ser desfeita").
     - Acionar a exclusão via callback para o `AgendaController.deleteEvent(id)`.
     - Feedback de sucesso/erro via `SnackBar`.
   - `NewAppointmentWidget`:
     - Ajustar espaçamentos horizontais para layout limpo e proporcional.
     - Exibição condicional do campo **Cachê**: visível para os tipos `Show` e `Gravação`; ocultado para `Ensaio` e `Reunião` (com o campo `Local` expandindo para a largura total).
     - Centralizar o botão de submissão ("Criar Compromisso" / "Salvar Alterações").
   - Testes automatizados no mobile:
     - Testes unitários do `AgendaController` e `EventModel`.
     - Testes de widget do `CommitmentCard` cobrindo o fluxo de exclusão com confirmação.

## Fora de escopo

- Gestão de múltiplos membros recebendo divisão automática do cachê (*Cache Splitter* — spec dedicada na Fase 5).
- Lançamento manual detalhado de múltiplas despesas ou pagamentos parcelados de um mesmo evento (módulo financeiro autônomo).
- Sincronização offline-first com banco local (Hive/SQLite) — reservado para a spec de persistência offline (Fase 3).
- Notificações push de lembrete de horários (Fase 4).

## Critérios de Sucesso

- [ ] Modelo `Event` estendido no Prisma com `startTime`, `endTime`, `type`, `fee` e migration/generate executados.
- [ ] `docs/database/erd.md` atualizado com o diagrama e especificações dos novos campos de `Event` e relacionamento com `Transaction`.
- [ ] Backend aceita, valida e persiste os novos campos em `POST /events` e `PATCH /events/:id`.
- [ ] Backend cria e sincroniza automaticamente uma `Transaction` do tipo `INCOME` quando `fee > 0`.
- [ ] Backend exclui compromissos via `DELETE /events/:id` com validação de permissão via `JwtAuthGuard` e `BandAccessService`.
- [ ] App mobile envia os novos campos ao criar/editar compromissos e os exibe corretamente no `CommitmentCard` após recarregar.
- [ ] `CommitmentCard` permite excluir um compromisso com confirmação do usuário e remove o item reativamente da agenda.
- [ ] Formulário `NewAppointmentWidget` com layout ajustado e botão centralizado.
- [ ] Todos os testes unitários e de integração (backend e mobile) passando sem regressões.
- [ ] `backlog.md` e baseline sincronizados ao final da spec.

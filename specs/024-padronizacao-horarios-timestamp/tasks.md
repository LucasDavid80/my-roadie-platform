# Tasks — 024: Padronização de Horários com Timestamps

## Fase 0: Setup & Preparação
- [x] T0.1: Criar branch, inicializar documentação da spec e atualizar backlog.md.

## Fase 1: Implementação (Backend / Prisma)
- [ ] T1.1: Atualizar o `schema.prisma` adicionando as colunas `startsAt`, `endsAt` e `timezone` (nullable inicialmente).
- [ ] T1.2: Criar e rodar migration customizada de backfill para preencher os novos campos nos dados legados, inferindo o fuso.
- [ ] T1.3: Atualizar o `schema.prisma` tornando `startsAt` e `timezone` `NOT NULL` e removendo `date`, `startTime`, `endTime`, seguida de nova migration.
- [ ] T1.4: Atualizar o diagrama `docs/database/erd.md` pós-migration (Constitution §3).
- [ ] T1.5: Criar decorator customizado `@IsAfterDate` e atualizar DTOs (`CreateEventDto`, `UpdateEventDto`) com validações rigorosas.
- [ ] T1.6: Refatorar o `EventsService` e `EventsController` para suportar a nova estrutura.
- [ ] T1.7: Atualizar testes automatizados do backend e garantir 80%+ de cobertura.

## Fase 2: Interface & Integração (Frontend Web)
- [ ] T2.1: Atualizar interfaces TypeScript (`Event`) na pasta `types/`.
- [ ] T2.2: Refatorar os formulários de criação/edição de evento para adotar `startsAt` e `endsAt`.
- [ ] T2.3: Atualizar listagens de eventos, agendas e componentes que renderizam datas no painel web.
- [ ] T2.4: Rodar suíte de testes web para garantir integridade.

## Fase 3: Interface & Integração (Mobile)
- [ ] T3.1: Atualizar `EventEntity`, `EventModel` e seus métodos de serialização (`fromMap`, `toMap`, `toCreatePayload`).
- [ ] T3.2: Refatorar as lógicas em `AgendaController` (ex: `upcomingEvents`, `pastEvents`, `monthlyEvents`) para usar `startsAt`.
- [ ] T3.3: Atualizar `NotificationService` (da Spec 023) para extrair o aviso de 24h/2h a partir de `startsAt`.
- [ ] T3.4: Refatorar as telas (`PrincipalScreen`, `HistoryScreen`, cards) e os date/time pickers do `NewAppointmentWidget`.
- [ ] T3.5: Ajustar e rodar a suíte de testes (unitários/widget) no mobile, garantindo o piso de 80% de cobertura.

## Fase 4: Testes em Dispositivo Físico
- [ ] T4.1: Testar o aplicativo alterando manualmente o fuso horário (timezone) nas configurações do dispositivo físico para garantir que os eventos ajustam sua exibição (`startsAt` e `endsAt`) corretamente.
- [ ] T4.2: Validar o agendamento e recebimento das notificações locais (24h e 2h antes) em background real no hardware, já que o gerenciamento de energia e alarms em simuladores difere do ambiente real.
- [ ] T4.3: Realizar testes de transição de data com o dispositivo físico, mantendo o app em background durante a virada da madrugada.

## Fase 5: Fechamento & Sincronização
- [ ] T5.1: Re-rodar os testes E2E do sistema.
- [ ] T5.2: Atualizar documentação de baseline e registrar auditorias necessárias.
- [ ] T5.3: Marcar checklist de fechamento e critérios de sucesso da spec.

---

## Checklist de Fechamento (preencher atomicamente com os critérios de `spec.md`)
- [ ] Todas as fases acima concluídas e commitadas
- [ ] Cobertura >= 80% verificada no Backend, Web e Mobile
- [ ] Testes E2E executados e passando
- [ ] Todos os critérios de sucesso de `spec.md` marcados `[x]`
- [ ] Solicitação de `git push` e Pull Request enviada ao usuário

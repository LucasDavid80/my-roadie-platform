# Tasks — 024: Padronização de Horários com Timestamps

## Fase 0: Setup & Preparação
- [x] T0.1: Criar branch, inicializar documentação da spec e atualizar backlog.md.

## Fase 1: Implementação (Backend / Prisma)
- [ ] T1.1: Atualizar o `schema.prisma` removendo `date`, `startTime`, `endTime` e adicionando `startsAt`, `endsAt`.
- [ ] T1.2: Gerar migration customizada no Prisma para converter os dados legados antes de excluir as colunas antigas.
- [ ] T1.3: Atualizar DTOs (`CreateEventDto`, `UpdateEventDto`) e validações no NestJS.
- [ ] T1.4: Refatorar o `EventsService` e `EventsController` para suportar a nova estrutura.
- [ ] T1.5: Atualizar testes automatizados do backend e garantir 80%+ de cobertura.

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

## Fase 4: Fechamento & Sincronização
- [ ] T4.1: Re-rodar os testes E2E do sistema.
- [ ] T4.2: Atualizar documentação de baseline e registrar auditorias necessárias.
- [ ] T4.3: Marcar checklist de fechamento e critérios de sucesso da spec.

---

## Checklist de Fechamento (preencher atomicamente com os critérios de `spec.md`)
- [ ] Todas as fases acima concluídas e commitadas
- [ ] Cobertura >= 80% verificada no Backend, Web e Mobile
- [ ] Testes E2E executados e passando
- [ ] Todos os critérios de sucesso de `spec.md` marcados `[x]`
- [ ] Solicitação de `git push` e Pull Request enviada ao usuário

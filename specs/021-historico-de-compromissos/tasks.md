# Tasks — 021: Histórico de Compromissos (Mobile)

Pré-requisitos: nenhum bloqueante direto. Recomendado rodar depois (ou junto) da spec 022 (correção dos cards do dashboard), já que ambas mexem em `compromissosTotal`/`events` da `PrincipalScreen` e compartilham o mesmo critério de "mês/dia corrente".

## Fase 0 — Confirmar decisões em aberto antes de codar

- [x] T0.1 — Definir com o usuário: ações de editar/excluir ficam habilitadas ou desabilitadas na tela de Histórico. (Definido: Habilitadas)
- [x] T0.2 — Inspecionar o layout atual de `PrincipalScreen`/`CommitmentsWidget`/`MyRoadieAppBar` e decidir onde entra o atalho para o Histórico. (Definido: cabeçalho de "Próximos Compromissos" em `CommitmentsWidget`)
- [x] T0.3 — Decidir `upcomingEvents`/`pastEvents` como getters no `AgendaController` (padrão atual de `totalFee`/`monthlyShows`) ou como `Provider` derivado — registrar a decisão e o motivo aqui antes de implementar. (Definido: Getters no `AgendaController`)
- [x] T0.4 — Checar se a spec 022 (bug dos cards do dashboard) já foi concluída; se sim, alinhar para que `InfosWidget` consuma o mesmo getter `upcomingEvents` criado aqui, evitando lógica de filtro de data duplicada. (Verificado: spec 022 em `ideia` no backlog; T3.3 implementará `upcomingEvents.length` como base)

## Fase 1 — `AgendaController`: getters de passado/futuro

- [x] T1.1 — Implementar `_startOfDay`, `upcomingEvents` e `pastEvents` em `agenda_controller.dart`, conforme a abordagem escolhida em T0.3.
  - Critério de teste: evento com `date` = hoje aparece em `upcomingEvents`; evento com `date` = ontem aparece em `pastEvents`; ambos ordenados conforme especificado no plan.md.
- [x] T1.2 — Testes unitários cobrindo hoje/ontem/amanhã/lista vazia para os dois getters.

## Fase 2 — Tela de Histórico

- [x] T2.1 — Criar `history_screen.dart` em `mobile/lib/presentation/screens/history/`, consumindo `pastEvents`.
- [x] T2.2 — Reaproveitar `CommitmentCard`/`CommitmentsWidget` (ou variante somente-leitura, conforme T0.1) para renderizar a lista agrupada por data.
- [x] T2.3 — Implementar estado vazio ("Nenhum compromisso no histórico ainda").
- [x] T2.4 — Teste de widget: lista renderiza `pastEvents`, estado vazio quando não há eventos passados.

## Fase 3 — Integração na Agenda

- [x] T3.1 — Atualizar `PrincipalScreen`: `CommitmentsWidget` passa a receber `upcomingEvents` em vez de `events`.
- [x] T3.2 — Adicionar o atalho/botão de navegação para `HistoryScreen`, no local definido em T0.2.
- [x] T3.3 — Ajustar `InfosWidget`/`compromissosTotal` para usar `upcomingEvents.length`, coordenando com a spec 022 conforme T0.4.
- [x] T3.4 — Atualizar `test/principal_screen_test.dart`: evento passado não aparece mais em "Próximos Compromissos"; navegação para o Histórico funciona.

## Fase 4 — Fechamento

- [x] T4.1 — Rodar `flutter test` completo do módulo mobile, sem regressão nos testes existentes (`agenda_controller_test.dart`, `principal_screen_test.dart`, `infos_widget_test.dart`).
- [x] T4.2 — Atualizar `backlog.md`: mover "Histórico de Compromissos e Filtragem de Próximos Eventos (Mobile)" de `em spec` para `concluído (specs/021-historico-de-compromissos/)`.
- [ ] T4.3 — Revisar `spec.md` desta pasta e marcar cada item de "Critérios de Sucesso" como `[x]`, um a um, confirmando manualmente antes de marcar (junto com o checklist abaixo, no mesmo passo — conforme convenção do `AGENTS.md`).

## Checklist de fechamento da feature

- [ ] Agenda mostra só compromissos futuros (`>= hoje`) em "Próximos Compromissos"
- [ ] Histórico mostra todos os compromissos passados (`< hoje`), mais recente primeiro
- [ ] Atalho de navegação Agenda ↔ Histórico funcionando nos dois sentidos
- [ ] Estados vazios tratados em ambas as telas
- [ ] Decisão sobre editar/excluir no histórico implementada conforme T0.1
- [ ] `flutter test` 100% verde, sem regressão
- [ ] `backlog.md` atualizado

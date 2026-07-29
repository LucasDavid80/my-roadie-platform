# Tasks — 007: Atualizar lista de compromissos após criação

Pré-requisitos: `specs/003-mobile-conectado-api-real` (camada data do mobile implementada e conectada à API).

## Fase 1 — Ajuste na camada de controle (Notifier/State)

- [x] T1.1 — Atualizar `AgendaController.addOrUpdateEvent` em `mobile/lib/presentation/controllers/agenda_controller.dart` para consumir o `EventEntity` retornado da persistência ou sincronizar `state` via re-fetch.
  - Critério de teste: Teste unitário em `agenda_controller_test.dart` confirmando que, após chamar `addOrUpdateEvent`, o `state` contém o novo evento retornado pelo repositório.
- [x] T1.2 — Implementar tratamento de erro e preservação de estado no `AgendaController` para falhas na persistência.
  - Critério de teste: Teste unitário em `agenda_controller_test.dart` simulando exceção do repositório (`Exception('Erro API')`) e verificando que a lista original no `state` é preservada sem inserção de itens corrompidos.

## Fase 2 — Integração com Formulário e Widgets da UI

- [ ] T2.1 — Atualizar a submissão do formulário `NewAppointmentWidget` e o callback em `PrincipalScreen` para aguardar a sincronização e fechar o modal com segurança.
  - Critério de teste: Teste de widget no Flutter simulando a abertura do modal, preenchimento dos campos, clique em "Criar Compromisso" e verificação do fechamento do modal.
- [ ] T2.2 — Garantir a reatividade dos widgets `CommitmentsWidget` e `CustomCalendar` na `PrincipalScreen` quando o `agendaProvider` emitir novo estado.
  - Critério de teste: Teste de widget confirmando que a adição de um novo evento ao estado faz o item aparecer renderizado na árvore de widgets da `PrincipalScreen`.

## Fase 3 — Validação de Regressão e Suíte Mobile

- [ ] T3.1 — Rodar a suíte completa de testes do mobile (`flutter test`) e confirmar 100% dos testes passando sem falhas.
  - Critério de teste: Execução de `flutter test` no terminal com zero falhas.

## Checklist de fechamento da feature

- [ ] `flutter test` 100% verde e sem regressões.
- [ ] O novo compromisso aparece imediatamente na lista e no calendário após confirmação.
- [ ] `backlog.md` atualizado com o status desta tarefa.
- [ ] `spec.md` e `plan.md` da baseline verificados e alinhados ao comportamento atualizado.

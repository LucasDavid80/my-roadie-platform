# Tasks — 013: Ajustes de UX na Agenda (Mobile)

Pré-requisitos: nenhum. É correção sobre tela já entregue (spec 007 — Atualizar Lista de Compromissos).

## Fase 0 — Confirmar diagnóstico antes de codar

- [x] T0.1 — Reproduzir o bug manualmente (emulador/dispositivo): confirmar que o drag vertical iniciado sobre o `CustomCalendar` não rola a `PrincipalScreen`, e que fora dele rola normalmente.
- [x] T0.2 — Confirmar no código-fonte do `TableCalendar` (via `flutter pub deps` / código do pacote em `~/.pub-cache`) que o default de `availableGestures` é de fato `AvailableGestures.all` e que ele inclui um recognizer de swipe vertical para troca de `CalendarFormat`.
- [x] T0.3 — Confirmar que a tela não usa `CalendarFormat` diferente de mês em nenhum ponto (grep por `CalendarFormat` em `mobile/lib`), validando que desativar o swipe vertical não remove funcionalidade em uso.

## Fase 1 — Corrigir o gesto do calendário

- [x] T1.1 — Adicionar `availableGestures: AvailableGestures.horizontalSwipe` ao `TableCalendar` em `custom_calendar.dart`.
  - Critério de teste: rodar manualmente no emulador — drag vertical sobre o calendário agora rola a tela; swipe horizontal ainda troca de mês; tap num dia ainda seleciona e mostra os compromissos.
- [x] T1.2 — Testar manualmente a troca de mês pelas setas do `_buildCustomHeader` (`_buildArrowButton`) para confirmar que não foi afetada pela mudança.
  - Critério de teste: tocar seta esquerda/direita muda `_focusedDay` corretamente, igual antes da mudança.

## Fase 2 — Teste automatizado de regressão

- [x] T2.1 — Escrever teste de widget que renderiza `PrincipalScreen` com eventos suficientes para o conteúdo exceder a altura da viewport, executa `tester.drag()` vertical a partir de um ponto dentro de `find.byType(CustomCalendar)`, e assevera que o offset do `Scrollable` da tela mudou.
  - Critério de teste: teste falha se revertido T1.1 (ou seja, comprovadamente cobre a regressão) e passa com a correção aplicada.
- [x] T2.2 — Rodar `flutter test` completo do módulo mobile e confirmar que `principal_screen_test.dart` e `agenda_controller_test.dart` continuam verdes.

## Fase 3 — Fechamento

- [ ] T3.1 — Atualizar `backlog.md`: mover a entrada "Habilitar rolagem na tela de Agenda" de `ideia` para `concluído (specs/013-ajustes-ux-agenda-mobile/)`.
- [ ] T3.2 — Revisar `spec.md` desta pasta e marcar todos os itens do "Critério de sucesso" como concluídos, um a um, confirmando cada um manualmente antes de marcar.

## Checklist de fechamento da feature

- [ ] Drag vertical sobre o calendário rola a tela (T0.1 reproduzido → T1.1 corrigido)
- [ ] Swipe horizontal e setas de navegação de mês continuam funcionando
- [ ] Seleção de dia e marcadores de evento continuam funcionando
- [ ] Teste automatizado novo cobrindo a rolagem (T2.1) passando
- [ ] `flutter test` 100% verde, sem regressão em `principal_screen_test.dart` / `agenda_controller_test.dart`
- [ ] `backlog.md` atualizado

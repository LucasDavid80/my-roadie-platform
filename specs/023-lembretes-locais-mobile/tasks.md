# Tasks — 023: Lembretes Locais de Eventos Próximos na Agenda (Mobile)

## Fase 0: Setup & Preparação

- [x] T0.1: Criar branch `spec/023-lembretes-locais-mobile` e inicializar documentação da spec (`spec.md`, `plan.md`, `tasks.md`)
- [x] T0.2: Adicionar dependências `flutter_local_notifications` e `timezone` ao `pubspec.yaml` e rodar `flutter pub get`
- [x] T0.3: Adicionar permissão `SCHEDULE_EXACT_ALARM` ao `AndroidManifest.xml` do app mobile

## Fase 1: Implementação do Serviço de Notificações

- [x] T1.1: Criar `mobile/lib/services/notification_service.dart` com a classe `NotificationService` (singleton) — métodos `initialize`, `scheduleEventReminders`, `cancelEventReminders` e `cancelAll`
- [x] T1.2: Inicializar `NotificationService` e `tz.initializeTimeZones()` em `main.dart` antes do `runApp`

## Fase 2: Integração ao AgendaController

- [x] T2.1: Chamar `NotificationService.scheduleEventReminders(event)` ao final do fluxo de criação de evento em `agenda_controller.dart`
- [x] T2.2: Chamar `NotificationService.cancelEventReminders(eventId)` + `scheduleEventReminders(event)` ao editar um evento (cancelar antigos e agendar novos)
- [x] T2.3: Chamar `NotificationService.cancelEventReminders(eventId)` ao excluir um evento em `agenda_controller.dart`

## Fase 3: Testes Automatizados & Qualidade

- [x] T3.1: Criar `mobile/test/services/notification_service_test.dart` cobrindo os 6 casos definidos no `plan.md` (T-U1 a T-U6): agendamento com startTime futuro > 24h, entre 2h e 24h, passado, nulo, cancelamento individual e cancelamento total
- [ ] T3.2: Executar `flutter test --coverage` em `mobile/` e verificar cobertura >= 80% no `NotificationService`

## Fase 4: Fechamento & Sincronização

- [ ] T4.1: Verificar que o app compila sem erros para Android (`flutter build apk --debug`) e confirmar ausência de erros de análise estática (`flutter analyze`)
- [ ] T4.2: Marcar checklist de fechamento e critérios de sucesso da spec (`tasks.md` e `spec.md` simultaneamente)

---

## Checklist de Fechamento (preencher atomicamente com os critérios de `spec.md`)

- [ ] Todas as fases acima concluídas e commitadas
- [ ] Cobertura >= 80% verificada no `NotificationService`
- [ ] App compila sem erros (Android debug)
- [ ] Todos os critérios de sucesso de `spec.md` marcados `[x]`
- [ ] Solicitação de `git push` e Pull Request enviada ao usuário para aprovação

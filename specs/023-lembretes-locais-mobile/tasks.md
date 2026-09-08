# Tasks — 023: Lembretes Locais de Eventos Próximos na Agenda (Mobile)

## Fase 0: Setup & Preparação

- [x] T0.1: Criar branch `spec/023-lembretes-locais-mobile` e inicializar documentação da spec (`spec.md`, `plan.md`, `tasks.md`)
- [x] T0.2: Adicionar dependências `flutter_local_notifications` e `timezone` ao `pubspec.yaml` e rodar `flutter pub get`
- [x] T0.3: Adicionar permissão `SCHEDULE_EXACT_ALARM` ao `AndroidManifest.xml` do app mobile
- [x] T0.4: Configurar `core library desugaring` no `mobile/android/app/build.gradle.kts`

## Fase 1: Implementação do Serviço de Notificações

- [x] T1.1: Criar `mobile/lib/services/notification_service.dart` com a classe `NotificationService` (singleton) — métodos `initialize`, `scheduleEventReminders`, `cancelEventReminders` e `cancelAll`
- [x] T1.2: Inicializar `NotificationService` e `tz.initializeTimeZones()` em `main.dart` antes do `runApp`

## Fase 2: Integração ao AgendaController

- [x] T2.1: Chamar `NotificationService.scheduleEventReminders(event)` ao final do fluxo de criação de evento em `agenda_controller.dart`
- [x] T2.2: Chamar `NotificationService.cancelEventReminders(eventId)` + `scheduleEventReminders(event)` ao editar um evento (cancelar antigos e agendar novos)
- [x] T2.3: Chamar `NotificationService.cancelEventReminders(eventId)` ao excluir um evento em `agenda_controller.dart`

## Fase 3: Testes Automatizados & Qualidade

- [x] T3.1: Criar `mobile/test/services/notification_service_test.dart` cobrindo os 6 casos definidos no `plan.md` (T-U1 a T-U6): agendamento com startTime futuro > 24h, entre 2h e 24h, passado, nulo, cancelamento individual e cancelamento total
- [x] T3.2: Executar `flutter test --coverage` em `mobile/` e verificar cobertura >= 80% no `NotificationService`

## Fase 4: Fechamento & Sincronização

- [x] T4.1: Verificar que o app compila sem erros para Android (`flutter build apk --debug`) e confirmar ausência de erros de análise estática (`flutter analyze`)
- [x] T4.2: Marcar checklist de fechamento e critérios de sucesso da spec (`tasks.md` e `spec.md` simultaneamente)

## Fase 5: QA e Testes Manuais em Dispositivo (Físico/Emulador)

- [x] T5.1: Instalar o app em um aparelho Android físico ou emulador (`flutter run -d <device>`)
- [x] T5.1.1 [Correção QA]: Instalar `flutter_timezone` e configurar o `tz.setLocalLocation` no `main.dart` para resolver inconsistência do UTC na criação de notificações locais.
- [x] T5.2: Criar um novo evento na agenda definindo o `startTime` para **daqui a 2 horas e 2 minutos**. Aguardar os 2 minutos com o app em background ou fechado e verificar se a notificação de 2h é exibida pelo sistema operacional
- [x] T5.3: Editar o mesmo evento, alterando o `startTime` para **daqui a 24 horas e 2 minutos**. Aguardar 2 minutos e verificar se a notificação de 24h é disparada com sucesso (provando que o cancelamento do agendamento antigo funcionou)
- [x] T5.4: Excluir o evento, definir um temporizador no aparelho e comprovar que nenhuma notificação "fantasma" é disparada no horário em que o evento ocorreria

---

## Checklist de Fechamento (preencher atomicamente com os critérios de `spec.md`)

- [x] Todas as fases acima concluídas e commitadas
- [x] Cobertura >= 80% verificada no `NotificationService`
- [x] App compila sem erros (Android debug)
- [x] Todos os critérios de sucesso de `spec.md` marcados `[x]`
- [x] Solicitação de `git push` e Pull Request enviada ao usuário para aprovação

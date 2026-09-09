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
- [x] T2.2: Ao editar um evento, `scheduleEventReminders(event)` é chamado
  no `AgendaController`; o cancelamento dos agendamentos anteriores ocorre
  internamente dentro do serviço (primeira instrução de
  `scheduleEventReminders` chama `cancelEventReminders`), não via chamada
  separada no controller. O comportamento final é equivalente ao descrito na
  task, mas a implementação difere da sequência literal especificada.
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

- [ ] Todas as fases acima concluídas e commitadas
- [x] Cobertura >= 80% verificada no `NotificationService`
- [ ] App compila sem erros (Android debug)
- [ ] Todos os critérios de sucesso de `spec.md` marcados `[x]`
- [ ] Solicitação de `git push` e Pull Request enviada ao usuário para aprovação

### Pendências identificadas na verificação do fechamento

- [x] Corrigir o cast inseguro `savedEvent as EventModel` em
  `AgendaController.addOrUpdateEvent` (linhas 52 e 56): se o repositório
  retornar `EventEntity` em vez de `EventModel`, a chamada a
  `scheduleEventReminders` lança `CastError` em runtime e os lembretes não
  são agendados. Causa-raiz: `IAgendaRepository.saveEvent` declara retorno
  `Future<EventEntity>`, mas a implementação concreta retorna `EventModel`.
  Solução: fazer `EventModel` estender ou implementar `EventEntity`, ou
  alterar o contrato da interface para `Future<EventModel>`.
- [x] Remover os cinco `print()` introduzidos no commit `252fe73` em
  `mobile/lib/services/notification_service.dart` (linhas 96-98, 106, 124).
  Esses prints foram adicionados como debug de QA e não foram revertidos.
  Causam cinco avisos `avoid_print` no `flutter analyze`, violando o
  critério T4.1. Alternativa: substituir por `AppLogger.info(...)` com
  proteção `kDebugMode`, padrão já estabelecido em
  `mobile/lib/core/utils/app_logger.dart`.
- [x] Reexecutar `flutter build apk --debug` e `flutter analyze` após as
  correções das inconsistências 1, 2 e 3, e registrar o resultado (saída
  do terminal ou log de CI) como evidência no fechamento definitivo da spec.
- [ ] T5.2–T5.4 (reexecução): Realizar novo ciclo de QA manual em
  dispositivo físico ou emulador após as correções das inconsistências
  1, 2 e 3. Documentar aqui: data, dispositivo, versão do Android e
  resultado observado (notificação de 2h, notificação de 24h e ausência de
  notificação fantasma após exclusão do evento).
- [ ] Commitar as alterações pendentes no worktree
  (`mobile/coverage/lcov.info`, `specs/023-lembretes-locais-mobile/tasks.md`)
  seguindo o padrão Conventional Commits antes de solicitar o Push/PR.
- [ ] Solicitar autorização explícita do usuário para executar `git push`
  e abrir o Pull Request (pendente — não realizado até o fechamento desta auditoria).

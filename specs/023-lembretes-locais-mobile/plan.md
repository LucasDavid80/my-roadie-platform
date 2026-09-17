# Plano Técnico — 023: Lembretes Locais de Eventos Próximos na Agenda (Mobile)

> [!IMPORTANT]
> **Supersedido parcialmente pela Spec 024:** Todas as referências a `startTime` neste plano foram substituídas no código por `startsAt` (DateTime ISO-8601) na Spec 024. Pseudocódigos e tabelas de teste abaixo refletem a nomenclatura original da época da execução.

## 1. Arquitetura e Decisões Técnicas

### Biblioteca escolhida
- **`flutter_local_notifications`** (versão estável mais recente compatível com Flutter 3.x): solução madura, sem dependência de servidor, suporte nativo a Android e iOS com agendamento por timestamp absoluto (`zonedSchedule`).
- **`timezone`**: dependência obrigatória de `flutter_local_notifications` para agendamento com fuso horário correto. Requer inicialização com `tz.initializeTimeZones()` no startup.
- **`flutter_timezone`**: adicionado na fase de QA para configurar o `tz.local` com o fuso real do dispositivo, evitando bugs matemáticos de tempo por conta do UTC padrão.

### Padrão de design
- **`NotificationService`** — classe Singleton responsável por toda a lógica de notificações. Encapsula `FlutterLocalNotificationsPlugin` e expõe métodos públicos chamados pelo `AgendaController`.
- O serviço é inicializado em `main.dart` antes do `runApp`, garantindo disponibilidade desde o primeiro frame.
- **IDs de notificação**: derivados do `eventId` da API para garantir unicidade e rastreabilidade. Como IDs devem ser `int`, usa-se `eventId.hashCode`. Para os dois lembretes por evento, usa-se `eventId.hashCode` (24h) e `eventId.hashCode + 1` (2h).

### Fluxo de agendamento
```
Criar/Editar Evento
  └─> AgendaController.addOrUpdateEvent()
        └─> NotificationService.scheduleEventReminders(event)
              ├─> cancelEventReminders(event.id)   ← ocorre aqui, dentro do serviço
              ├─> Calcular startTime - 24h → agendar se no futuro
              └─> Calcular startTime - 2h  → agendar se no futuro

Excluir Evento
  └─> AgendaController.deleteEvent()
        └─> NotificationService.cancelEventReminders(eventId)
              ├─> cancel(eventId.hashCode)
              └─> cancel(eventId.hashCode + 1)
```

### Plataformas e permissões
- **Android**: criar `NotificationChannel` com `importance: Importance.high` e `priority: Priority.high` no startup. 
- **Ícones**: Utilizar `largeIcon: DrawableResourceAndroidBitmap('@mipmap/ic_launcher')` para garantir que o ícone colorido seja exibido no corpo da notificação (visto que o smallIcon original é restrito a uma máscara monocromática pelo Android).
- **Agendamento no Android**: Uso de `AndroidScheduleMode.alarmClock`. Após testes extensivos de QA em aparelhos Xiaomi (MIUI), alarmes inexatos ou exatos convencionais sofrem bloqueios severos de bateria em background. O modo "Despertador" (`alarmClock`) força a ativação do rádio e do display em background, sendo o único capaz de romper as restrições da MIUI.
- **Manifest do Android**: O agendamento exige a adição obrigatória dos Receivers nativos (`ScheduledNotificationReceiver` e `ScheduledNotificationBootReceiver`), além da permissão `RECEIVE_BOOT_COMPLETED` no `AndroidManifest.xml` (para evitar a falha silenciosa de broadcast do AlarmManager e garantir a persistência pós-reboot).
- **Android Build**: o pacote exige habilitar o `core library desugaring` no `build.gradle.kts` do app, ativando `isCoreLibraryDesugaringEnabled = true` em `compileOptions` e adicionando a dependência `coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.0.3")`.
- **iOS**: solicitar permissão via `requestPermissions(alert: true, badge: true, sound: true)` no `initialize()`.

## 2. Modelagem de Dados / Contratos

Nenhuma alteração no `schema.prisma` ou no backend. A feature é 100% client-side.

### Contrato interno do `NotificationService`

```dart
class NotificationService {
  // Inicializa o plugin e solicita permissões
  Future<void> initialize() async { ... }

  // Agenda 2 lembretes (24h e 2h antes) para o evento
  // Ignora silenciosamente se startTime for nulo ou já passou
  Future<void> scheduleEventReminders(EventModel event) async { ... }

  // Cancela os 2 lembretes de um evento pelo eventId
  Future<void> cancelEventReminders(String eventId) async { ... }

  // Cancela TODAS as notificações pendentes (uso em logout/limpeza)
  Future<void> cancelAll() async { ... }
}
```

### `EventModel` (existente em `mobile/lib/`)
Nenhuma alteração de campos — `startTime` já existe no modelo após a spec 015.

## 3. Estrutura de Arquivos Afetados

```
mobile/
├── pubspec.yaml                                  ← adicionar flutter_local_notifications e timezone
├── lib/
│   ├── main.dart                                 ← inicializar NotificationService e tz
│   ├── services/
│   │   └── notification_service.dart             ← NOVO: NotificationService singleton
│   ├── features/
│   │   └── agenda/
│   │       └── controllers/
│   │           └── agenda_controller.dart        ← chamar scheduleEventReminders / cancelEventReminders
├── android/
│   └── app/
│       └── src/main/AndroidManifest.xml          ← adicionar permissão SCHEDULE_EXACT_ALARM (Android 12+)
└── test/
    └── services/
        └── notification_service_test.dart        ← NOVO: testes unitários do serviço
```

> **Débito técnico (aberto):** `AgendaController` usa cast direto
> `savedEvent as EventModel` para chamar `scheduleEventReminders`.
> O contrato `IAgendaRepository.saveEvent → Future<EventEntity>` é mais
> amplo que o necessário; a correção deve ampliar `EventModel` para
> implementar `EventEntity` ou estreitar o contrato da interface.

### Permissão Android (`AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<!-- Android 13+ POST_NOTIFICATIONS é solicitado em runtime pelo plugin -->
```

## 4. Estratégia de Testes

### Testes unitários (`notification_service_test.dart`)
Utilizar `mockito` ou `mocktail` para mockar `FlutterLocalNotificationsPlugin` e validar:

| Caso | Descrição |
|------|-----------|
| T-U1 | `scheduleEventReminders` agenda 2 notificações quando `startTime` é futuro (> 24h) |
| T-U2 | `scheduleEventReminders` agenda apenas 1 notificação quando `startTime` está entre 2h e 24h no futuro |
| T-U3 | `scheduleEventReminders` não agenda nada quando `startTime` já passou |
| T-U4 | `scheduleEventReminders` não agenda nada quando `startTime` é nulo |
| T-U5 | `cancelEventReminders` chama `cancel` com os dois IDs derivados do `eventId` |
| T-U6 | `cancelAll` delega para `cancelAll` do plugin |

### Cobertura alvo
- `NotificationService`: >= 80% (linhas) — verificado com `flutter test --coverage`.
- Os controllers existentes (`AgendaController`) não terão seus testes alterados — apenas os calls ao `NotificationService` serão verificados indiretamente via mock nos testes do serviço.

## 5. Débitos técnicos abertos (identificados em auditoria pós-fechamento)

| # | Item | Descrição | Origem |
|---|---|---|---|
| DT-1 | `print()` de debug em produção | Cinco chamadas `print()` adicionadas em `notification_service.dart` durante QA (commit `252fe73`) para inspecionar `now`, `eventTz`, `reminder24h` e `reminder2h`. Não foram removidos antes do fechamento. Devem ser substituídos por `AppLogger.info(...)` com proteção `kDebugMode`. | commit `252fe73`, linhas 96–98, 106, 124 |
| DT-2 | Cast inseguro `EventEntity → EventModel` | `AgendaController` realiza cast direto ao chamar `scheduleEventReminders`; lança `CastError` em runtime se o contrato da interface for satisfeito por uma implementação que retorne `EventEntity` puro. | `agenda_controller.dart:52,56` |

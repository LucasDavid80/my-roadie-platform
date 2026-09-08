# Plano Técnico — 023: Lembretes Locais de Eventos Próximos na Agenda (Mobile)

## 1. Arquitetura e Decisões Técnicas

### Biblioteca escolhida
- **`flutter_local_notifications`** (versão estável mais recente compatível com Flutter 3.x): solução madura, sem dependência de servidor, suporte nativo a Android e iOS com agendamento por timestamp absoluto (`zonedSchedule`).
- **`timezone`**: dependência obrigatória de `flutter_local_notifications` para agendamento com fuso horário correto. Requer inicialização com `tz.initializeTimeZones()` no startup.

### Padrão de design
- **`NotificationService`** — classe Singleton responsável por toda a lógica de notificações. Encapsula `FlutterLocalNotificationsPlugin` e expõe métodos públicos chamados pelo `AgendaController`.
- O serviço é inicializado em `main.dart` antes do `runApp`, garantindo disponibilidade desde o primeiro frame.
- **IDs de notificação**: derivados do `eventId` da API para garantir unicidade e rastreabilidade. Como IDs devem ser `int`, usa-se `eventId.hashCode`. Para os dois lembretes por evento, usa-se `eventId.hashCode` (24h) e `eventId.hashCode + 1` (2h).

### Fluxo de agendamento
```
Criar/Editar Evento
  └─> AgendaController.createEvent() / updateEvent()
        └─> NotificationService.scheduleEventReminders(event)
              ├─> Cancelar notificações antigas (via cancelEventReminders)
              ├─> Calcular startTime - 24h → agendar se no futuro
              └─> Calcular startTime - 2h  → agendar se no futuro

Excluir Evento
  └─> AgendaController.deleteEvent()
        └─> NotificationService.cancelEventReminders(eventId)
              ├─> cancel(eventId.hashCode)
              └─> cancel(eventId.hashCode + 1)
```

### Plataformas e permissões
- **Android**: criar `NotificationChannel` com `importance: Importance.high` e `priority: Priority.high` no startup. Sem necessidade de permissão explícita no Android < 13. No Android 13+ (`POST_NOTIFICATIONS`), o plugin solicita automaticamente.
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

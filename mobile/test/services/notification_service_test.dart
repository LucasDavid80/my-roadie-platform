import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'package:timezone/timezone.dart' as tz_local;

import 'package:agenda_musical/domain/models/event_model.dart';
import 'package:agenda_musical/services/notification_service.dart';

class MockFlutterLocalNotificationsPlugin extends Mock
    implements FlutterLocalNotificationsPlugin {}

void main() {
  late MockFlutterLocalNotificationsPlugin mockPlugin;
  late NotificationService service;

  setUpAll(() {
    tz.initializeTimeZones();
    registerFallbackValue(tz_local.TZDateTime.now(tz_local.local));
    registerFallbackValue(const NotificationDetails());
    registerFallbackValue(AndroidScheduleMode.exactAllowWhileIdle);
    registerFallbackValue(UILocalNotificationDateInterpretation.absoluteTime);
  });

  setUp(() {
    mockPlugin = MockFlutterLocalNotificationsPlugin();
    NotificationService.setMockPlugin(mockPlugin);
    service = NotificationService.instance;
  });

  EventModel createEvent({required String id, required DateTime date}) {
    return EventModel(
      id: id,
      title: 'Teste',
      type: 'Show',
      startsAt: date,
      timezone: 'America/Sao_Paulo',
      endsAt: null,
      location: 'Local',
      fee: 0.0,
      notes: '',
    );
  }

  group('NotificationService Tests -', () {
    test('T-U1: scheduleEventReminders agenda 2 notificacoes quando startsAt eh futuro (> 24h)', () async {
      // Setup
      when(() => mockPlugin.cancel(any())).thenAnswer((_) async {});
      when(() => mockPlugin.zonedSchedule(
        any(), any(), any(), any(), any(),
        androidScheduleMode: any(named: 'androidScheduleMode'),
        uiLocalNotificationDateInterpretation: any(named: 'uiLocalNotificationDateInterpretation'),
        payload: any(named: 'payload'),
      )).thenAnswer((_) async {});

      final now = DateTime.now();
      // Future date > 24h (e.g. 2 days ahead)
      final futureDate = now.add(const Duration(days: 2));
      
      final event = createEvent(id: 'event_1', date: futureDate);

      // Act
      await service.scheduleEventReminders(event);

      // Assert
      verify(() => mockPlugin.cancel(event.id.hashCode)).called(1);
      verify(() => mockPlugin.cancel(event.id.hashCode + 1)).called(1);
      
      verify(() => mockPlugin.zonedSchedule(
        event.id.hashCode,
        any(),
        any(),
        any(),
        any(),
        androidScheduleMode: any(named: 'androidScheduleMode'),
        uiLocalNotificationDateInterpretation: any(named: 'uiLocalNotificationDateInterpretation'),
        payload: event.id,
      )).called(1);

      verify(() => mockPlugin.zonedSchedule(
        event.id.hashCode + 1,
        any(),
        any(),
        any(),
        any(),
        androidScheduleMode: any(named: 'androidScheduleMode'),
        uiLocalNotificationDateInterpretation: any(named: 'uiLocalNotificationDateInterpretation'),
        payload: event.id,
      )).called(1);
    });

    test('T-U2: scheduleEventReminders agenda apenas 1 notificacao quando startsAt esta entre 2h e 24h no futuro', () async {
      when(() => mockPlugin.cancel(any())).thenAnswer((_) async {});
      when(() => mockPlugin.zonedSchedule(
        any(), any(), any(), any(), any(),
        androidScheduleMode: any(named: 'androidScheduleMode'),
        uiLocalNotificationDateInterpretation: any(named: 'uiLocalNotificationDateInterpretation'),
        payload: any(named: 'payload'),
      )).thenAnswer((_) async {});

      final now = DateTime.now();
      // Future date between 2h and 24h (e.g. 10 hours ahead)
      final futureDate = now.add(const Duration(hours: 10));
      
      final event = createEvent(id: 'event_2', date: futureDate);

      // Act
      await service.scheduleEventReminders(event);

      // Assert
      verify(() => mockPlugin.cancel(event.id.hashCode)).called(1);
      verify(() => mockPlugin.cancel(event.id.hashCode + 1)).called(1);
      
      // Should NOT schedule the 24h reminder (hashCode)
      verifyNever(() => mockPlugin.zonedSchedule(
        event.id.hashCode,
        any(),
        any(),
        any(),
        any(),
        androidScheduleMode: any(named: 'androidScheduleMode'),
        uiLocalNotificationDateInterpretation: any(named: 'uiLocalNotificationDateInterpretation'),
        payload: any(named: 'payload'),
      ));

      // Should schedule the 2h reminder (hashCode + 1)
      verify(() => mockPlugin.zonedSchedule(
        event.id.hashCode + 1,
        any(),
        any(),
        any(),
        any(),
        androidScheduleMode: any(named: 'androidScheduleMode'),
        uiLocalNotificationDateInterpretation: any(named: 'uiLocalNotificationDateInterpretation'),
        payload: event.id,
      )).called(1);
    });

    test('T-U3: scheduleEventReminders nao agenda nada quando startsAt ja passou', () async {
      when(() => mockPlugin.cancel(any())).thenAnswer((_) async {});

      final now = DateTime.now();
      // Past date
      final pastDate = now.subtract(const Duration(hours: 10));
      
      final event = createEvent(id: 'event_3', date: pastDate);

      // Act
      await service.scheduleEventReminders(event);

      // Assert
      verify(() => mockPlugin.cancel(event.id.hashCode)).called(1);
      verify(() => mockPlugin.cancel(event.id.hashCode + 1)).called(1);
      
      verifyNever(() => mockPlugin.zonedSchedule(
        any(), any(), any(), any(), any(),
        androidScheduleMode: any(named: 'androidScheduleMode'),
        uiLocalNotificationDateInterpretation: any(named: 'uiLocalNotificationDateInterpretation'),
        payload: any(named: 'payload'),
      ));
    });

    

    test('T-U5: cancelEventReminders chama cancel com os dois IDs derivados do eventId', () async {
      when(() => mockPlugin.cancel(any())).thenAnswer((_) async {});

      // Act
      await service.cancelEventReminders('event_5');

      // Assert
      verify(() => mockPlugin.cancel('event_5'.hashCode)).called(1);
      verify(() => mockPlugin.cancel('event_5'.hashCode + 1)).called(1);
    });

    test('T-U6: cancelAll delega para cancelAll do plugin', () async {
      when(() => mockPlugin.cancelAll()).thenAnswer((_) async {});

      // Act
      await service.cancelAll();

      // Assert
      verify(() => mockPlugin.cancelAll()).called(1);
    });
  });
}

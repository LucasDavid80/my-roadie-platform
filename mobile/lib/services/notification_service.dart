import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;

import '../domain/models/event_model.dart';

/// Servico singleton responsavel por toda a logica de notificacoes locais.
///
/// Encapsula [FlutterLocalNotificationsPlugin] e expoe metodos publicos
/// chamados pelo AgendaController para agendar/cancelar lembretes de eventos.
class NotificationService {
  NotificationService._internal({FlutterLocalNotificationsPlugin? plugin})
      : _plugin = plugin ?? FlutterLocalNotificationsPlugin();

  static NotificationService instance = NotificationService._internal();

  factory NotificationService() => instance;

  final FlutterLocalNotificationsPlugin _plugin;

  @visibleForTesting
  static void setMockPlugin(FlutterLocalNotificationsPlugin mockPlugin) {
    instance = NotificationService._internal(plugin: mockPlugin);
  }

  static const String _channelId = 'agenda_events';
  static const String _channelName = 'Eventos da Agenda';
  static const String _channelDescription = 'Lembretes de eventos proximos';

  /// Inicializa o plugin e solicita permissoes.
  ///
  /// - Android: cria o [AndroidNotificationChannel] com alta prioridade.
  /// - iOS: solicita permissoes de alerta, badge e som em runtime.
  ///
  /// Deve ser chamado em `main.dart` antes do `runApp`.
  Future<void> initialize() async {
    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings iosSettings =
        DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _plugin.initialize(initSettings);

    // Cria o canal de notificacao de alta prioridade no Android.
    const AndroidNotificationChannel channel = AndroidNotificationChannel(
      _channelId,
      _channelName,
      description: _channelDescription,
      importance: Importance.high,
    );

    await _plugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);
  }

  /// Agenda dois lembretes para o evento: 24h e 2h antes do [EventModel.startTime].
  ///
  /// - Ignora silenciosamente se [EventModel.startTime] for vazio ou invalido.
  /// - Ignora silenciosamente se o horario calculado ja passou.
  /// - Cancela lembretes anteriores do mesmo evento antes de agendar os novos,
  ///   garantindo que edicoes nao gerem notificacoes duplicadas.
  Future<void> scheduleEventReminders(EventModel event) async {
    if (event.startTime.isEmpty) return;

    final List<String> parts = event.startTime.split(':');
    if (parts.length < 2) return;

    final int? hour = int.tryParse(parts[0]);
    final int? minute = int.tryParse(parts[1]);
    if (hour == null || minute == null) return;

    final DateTime eventDateTime = DateTime(
      event.date.year,
      event.date.month,
      event.date.day,
      hour,
      minute,
    );

    final tz.TZDateTime eventTz =
        tz.TZDateTime.from(eventDateTime, tz.local);
    final tz.TZDateTime now = tz.TZDateTime.now(tz.local);

    print('--- SCHEDULING NOTIFICATION ---');
    print('Current time (now): $now');
    print('Event time (eventTz): $eventTz');

    // Cancela os lembretes existentes antes de agendar os novos.
    await cancelEventReminders(event.id);

    // Lembrete de 24 horas antes.
    final tz.TZDateTime reminder24h =
        eventTz.subtract(const Duration(hours: 24));
    print('Reminder 24h: $reminder24h | isAfter(now)? ${reminder24h.isAfter(now)}');
    if (reminder24h.isAfter(now)) {
      await _plugin.zonedSchedule(
        event.id.hashCode,
        'Lembrete: ${event.title}',
        'Seu evento comeca amanha!',
        reminder24h,
        _buildNotificationDetails(),
        androidScheduleMode: AndroidScheduleMode.alarmClock,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
        payload: event.id,
      );
    }

    // Lembrete de 2 horas antes.
    final tz.TZDateTime reminder2h =
        eventTz.subtract(const Duration(hours: 2));
    print('Reminder 2h: $reminder2h | isAfter(now)? ${reminder2h.isAfter(now)}');
    if (reminder2h.isAfter(now)) {
      await _plugin.zonedSchedule(
        event.id.hashCode + 1,
        'Lembrete: ${event.title}',
        'Seu evento comeca em 2 horas!',
        reminder2h,
        _buildNotificationDetails(),
        androidScheduleMode: AndroidScheduleMode.alarmClock,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
        payload: event.id,
      );
    }
  }

  /// Cancela os dois lembretes associados a um evento pelo seu [eventId].
  ///
  /// IDs derivados: [eventId.hashCode] (24h) e [eventId.hashCode + 1] (2h).
  Future<void> cancelEventReminders(String eventId) async {
    await _plugin.cancel(eventId.hashCode);
    await _plugin.cancel(eventId.hashCode + 1);
  }

  /// Cancela TODAS as notificacoes pendentes agendadas pelo app.
  ///
  /// Uso tipico: logout ou limpeza total de dados.
  Future<void> cancelAll() async {
    await _plugin.cancelAll();
  }

  NotificationDetails _buildNotificationDetails() {
    const AndroidNotificationDetails androidDetails =
        AndroidNotificationDetails(
      _channelId,
      _channelName,
      channelDescription: _channelDescription,
      importance: Importance.high,
      priority: Priority.high,
      largeIcon: DrawableResourceAndroidBitmap('@mipmap/ic_launcher'),
    );

    const DarwinNotificationDetails iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    return const NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
  }
}

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:agenda_musical/presentation/controllers/agenda_controller.dart';
import 'package:agenda_musical/domain/interfaces/i_agenda_repository.dart';
import 'package:agenda_musical/domain/entities/event_entity.dart';

class MockAgendaRepository extends Mock implements IAgendaRepository {}

void main() {
  late ProviderContainer container;
  late MockAgendaRepository mockAgendaRepository;

  setUpAll(() {
    registerFallbackValue(
      EventEntity(
        id: '1',
        title: 'Test Event',
        type: 'Show',
        date: DateTime(2026, 7, 16),
        startTime: '10:00',
        endTime: '12:00',
        location: 'Test Location',
        fee: 100.0,
      ),
    );
  });

  setUp(() async {
    mockAgendaRepository = MockAgendaRepository();
    // Default mocks
    when(() => mockAgendaRepository.getEvents()).thenAnswer((_) async => []);
    when(() => mockAgendaRepository.saveEvent(any()))
        .thenAnswer((invocation) async => invocation.positionalArguments.first as EventEntity);
    when(() => mockAgendaRepository.deleteEvent(any())).thenAnswer((_) async => {});

    container = ProviderContainer(
      overrides: [
        agendaRepositoryProvider.overrideWithValue(mockAgendaRepository),
      ],
    );

    // Wait for the initial async fetchEvents to finish before tests start
    await container.read(agendaProvider.notifier).fetchEvents();
  });

  tearDown(() {
    container.dispose();
  });

  test('Should start with an empty list', () {
    final state = container.read(agendaProvider);
    expect(state, isEmpty);
  });

  test('Should add a new event', () async {
    final event = EventEntity(
      id: '1',
      title: 'Show Test',
      type: 'Show',
      date: DateTime.now(),
      startTime: '20:00',
      endTime: '22:00',
      location: 'Pub',
      fee: 500.0,
      notes: '',
    );

    await container.read(agendaProvider.notifier).addOrUpdateEvent(event);
    
    final state = container.read(agendaProvider);
    expect(state.length, 1);
    expect(state.first.id, '1');
    expect(state.first.title, 'Show Test');
  });

  test('Should add a new event using the persisted EventEntity returned by repository (T1.1)', () async {
    final tempEvent = EventEntity(
      id: 'temp-id-123',
      title: 'Show com ID Temporario',
      type: 'Show',
      date: DateTime.now(),
      startTime: '20:00',
      endTime: '22:00',
      location: 'Pub',
      fee: 500.0,
      notes: '',
    );

    final persistedEvent = EventEntity(
      id: 'real-uuid-from-api-456',
      title: 'Show com ID Temporario',
      type: 'Show',
      date: tempEvent.date,
      startTime: '20:00',
      endTime: '22:00',
      location: 'Pub',
      fee: 500.0,
      notes: '',
    );

    when(() => mockAgendaRepository.saveEvent(tempEvent))
        .thenAnswer((_) async => persistedEvent);

    await container.read(agendaProvider.notifier).addOrUpdateEvent(tempEvent);

    final state = container.read(agendaProvider);
    expect(state.length, 1);
    expect(state.first.id, 'real-uuid-from-api-456');
  });

  test('Should preserve original state and throw exception when saveEvent fails (T1.2)', () async {
    final eventToFail = EventEntity(
      id: 'fail-123',
      title: 'Show que falha',
      type: 'Show',
      date: DateTime.now(),
      startTime: '20:00',
      endTime: '22:00',
      location: 'Pub',
      fee: 500.0,
      notes: '',
    );

    when(() => mockAgendaRepository.saveEvent(eventToFail))
        .thenThrow(Exception('Erro API'));

    final initialList = container.read(agendaProvider);

    expect(
      () => container.read(agendaProvider.notifier).addOrUpdateEvent(eventToFail),
      throwsA(isA<Exception>()),
    );

    final state = container.read(agendaProvider);
    expect(state, equals(initialList));
    expect(state.any((e) => e.id == 'fail-123'), false);
  });

  test('Should update an existing event', () async {
    final event1 = EventEntity(
      id: '1',
      title: 'Original Title',
      type: 'Show',
      date: DateTime.now(),
      startTime: '20:00',
      endTime: '22:00',
      location: 'Pub',
      fee: 500.0,
      notes: '',
    );

    await container.read(agendaProvider.notifier).addOrUpdateEvent(event1);

    final eventUpdate = EventEntity(
      id: '1',
      title: 'Updated Title',
      type: 'Show',
      date: DateTime.now(),
      startTime: '20:00',
      endTime: '22:00',
      location: 'Pub',
      fee: 600.0,
      notes: 'New notes',
    );

    await container.read(agendaProvider.notifier).addOrUpdateEvent(eventUpdate);

    final state = container.read(agendaProvider);
    expect(state.length, 1);
    expect(state.first.title, 'Updated Title');
    expect(state.first.fee, 600.0);
  });

  test('Should calculate total fee correctly', () async {
    final event1 = EventEntity(
      id: '1',
      title: 'Show 1',
      type: 'Show',
      date: DateTime.now(),
      startTime: '20:00',
      endTime: '22:00',
      location: 'Pub',
      fee: 500.0,
      notes: '',
    );

    final event2 = EventEntity(
      id: '2',
      title: 'Show 2',
      type: 'Show',
      date: DateTime.now(),
      startTime: '21:00',
      endTime: '23:00',
      location: 'Bar',
      fee: 350.0,
      notes: '',
    );

    await container.read(agendaProvider.notifier).addOrUpdateEvent(event1);
    await container.read(agendaProvider.notifier).addOrUpdateEvent(event2);

    final totalFee = container.read(agendaProvider.notifier).totalFee;
    expect(totalFee, 850.0);
  });

  test('Should count monthly shows correctly', () async {
    final now = DateTime.now();
    final lastMonth = DateTime(now.year, now.month - 1, now.day);

    final eventThisMonth = EventEntity(
      id: '1',
      title: 'This Month',
      type: 'Show',
      date: now,
      startTime: '20:00',
      endTime: '22:00',
      location: 'Pub',
      fee: 500.0,
      notes: '',
    );

    final eventLastMonth = EventEntity(
      id: '2',
      title: 'Last Month',
      type: 'Show',
      date: lastMonth,
      startTime: '21:00',
      endTime: '23:00',
      location: 'Bar',
      fee: 350.0,
      notes: '',
    );

    await container.read(agendaProvider.notifier).addOrUpdateEvent(eventThisMonth);
    await container.read(agendaProvider.notifier).addOrUpdateEvent(eventLastMonth);

    final shows = container.read(agendaProvider.notifier).monthlyShows;
    expect(shows, 1);
  });

  test('Should delete event from state when repository succeeds (T3.1)', () async {
    final event1 = EventEntity(
      id: 'event-1',
      title: 'Show 1',
      type: 'Show',
      date: DateTime.now(),
      startTime: '20:00',
      endTime: '22:00',
      location: 'Pub A',
      fee: 300.0,
      notes: '',
    );
    final event2 = EventEntity(
      id: 'event-2',
      title: 'Show 2',
      type: 'Show',
      date: DateTime.now(),
      startTime: '21:00',
      endTime: '23:00',
      location: 'Pub B',
      fee: 400.0,
      notes: '',
    );

    when(() => mockAgendaRepository.saveEvent(event1)).thenAnswer((_) async => event1);
    when(() => mockAgendaRepository.saveEvent(event2)).thenAnswer((_) async => event2);
    when(() => mockAgendaRepository.deleteEvent('event-1')).thenAnswer((_) async {});

    await container.read(agendaProvider.notifier).addOrUpdateEvent(event1);
    await container.read(agendaProvider.notifier).addOrUpdateEvent(event2);

    expect(container.read(agendaProvider).length, 2);

    await container.read(agendaProvider.notifier).deleteEvent('event-1');

    final state = container.read(agendaProvider);
    expect(state.length, 1);
    expect(state.first.id, 'event-2');
  });

  test('Should handle deleteEvent error gracefully when repository fails (T3.1)', () async {
    when(() => mockAgendaRepository.deleteEvent('non-existent'))
        .thenThrow(Exception('Erro ao deletar'));

    await container.read(agendaProvider.notifier).deleteEvent('non-existent');
    expect(container.read(agendaProvider), isEmpty);
  });

  test('Should handle fetchEvents error gracefully without throwing (T3.1)', () async {
    when(() => mockAgendaRepository.getEvents()).thenThrow(Exception('Falha no banco'));

    await container.read(agendaProvider.notifier).fetchEvents();
    expect(container.read(agendaProvider), isEmpty);
  });

  group('upcomingEvents and pastEvents (T1.2)', () {
    test('Should return empty lists when state is empty', () {
      final controller = container.read(agendaProvider.notifier);
      expect(controller.upcomingEvents, isEmpty);
      expect(controller.pastEvents, isEmpty);
    });

    test('Should separate and sort upcomingEvents (ascending) and pastEvents (descending)', () async {
      final now = DateTime.now();
      final todayMorning = DateTime(now.year, now.month, now.day, 8, 0);
      final tomorrow = DateTime(now.year, now.month, now.day + 1, 20, 0);
      final inTwoDays = DateTime(now.year, now.month, now.day + 2, 19, 0);
      final yesterday = DateTime(now.year, now.month, now.day - 1, 21, 0);
      final twoDaysAgo = DateTime(now.year, now.month, now.day - 2, 18, 0);

      final eventToday = EventEntity(
        id: 'event-today',
        title: 'Show Hoje',
        type: 'Show',
        date: todayMorning,
        startTime: '08:00',
        endTime: '10:00',
        location: 'Local Hoje',
        fee: 300.0,
      );

      final eventTomorrow = EventEntity(
        id: 'event-tomorrow',
        title: 'Show Amanhã',
        type: 'Show',
        date: tomorrow,
        startTime: '20:00',
        endTime: '22:00',
        location: 'Local Amanhã',
        fee: 400.0,
      );

      final eventInTwoDays = EventEntity(
        id: 'event-future',
        title: 'Show Futuro',
        type: 'Show',
        date: inTwoDays,
        startTime: '19:00',
        endTime: '21:00',
        location: 'Local Futuro',
        fee: 500.0,
      );

      final eventYesterday = EventEntity(
        id: 'event-yesterday',
        title: 'Show Ontem',
        type: 'Show',
        date: yesterday,
        startTime: '21:00',
        endTime: '23:00',
        location: 'Local Ontem',
        fee: 200.0,
      );

      final eventTwoDaysAgo = EventEntity(
        id: 'event-past',
        title: 'Show Mais Antigo',
        type: 'Show',
        date: twoDaysAgo,
        startTime: '18:00',
        endTime: '20:00',
        location: 'Local Passado',
        fee: 250.0,
      );

      // Adiciona fora de ordem para validar ordenação
      await container.read(agendaProvider.notifier).addOrUpdateEvent(eventTomorrow);
      await container.read(agendaProvider.notifier).addOrUpdateEvent(eventTwoDaysAgo);
      await container.read(agendaProvider.notifier).addOrUpdateEvent(eventToday);
      await container.read(agendaProvider.notifier).addOrUpdateEvent(eventYesterday);
      await container.read(agendaProvider.notifier).addOrUpdateEvent(eventInTwoDays);

      final controller = container.read(agendaProvider.notifier);

      // upcomingEvents: hoje, amanhã, depois de amanhã (ordem ascendente)
      final upcoming = controller.upcomingEvents;
      expect(upcoming.length, 3);
      expect(upcoming[0].id, 'event-today');
      expect(upcoming[1].id, 'event-tomorrow');
      expect(upcoming[2].id, 'event-future');

      // pastEvents: ontem, 2 dias atrás (ordem descendente - mais recente primeiro)
      final past = controller.pastEvents;
      expect(past.length, 2);
      expect(past[0].id, 'event-yesterday');
      expect(past[1].id, 'event-past');
    });
  });

  group('Monthly statistics getters (T1.2)', () {
    test('monthlyEvents should return only events belonging to the current month and year', () async {
      final now = DateTime.now();
      final thisMonth = DateTime(now.year, now.month, 10);
      final lastMonth = DateTime(now.year, now.month - 1, 10);
      final nextMonth = DateTime(now.year, now.month + 1, 10);
      final lastYearSameMonth = DateTime(now.year - 1, now.month, 10);

      final eventThisMonth = EventEntity(
        id: 'e-this-month',
        title: 'Compromisso Este Mês',
        type: 'Show',
        date: thisMonth,
        startTime: '20:00',
        endTime: '22:00',
        location: 'Local 1',
        fee: 500.0,
      );

      final eventLastMonth = EventEntity(
        id: 'e-last-month',
        title: 'Compromisso Mês Passado',
        type: 'Show',
        date: lastMonth,
        startTime: '20:00',
        endTime: '22:00',
        location: 'Local 2',
        fee: 400.0,
      );

      final eventNextMonth = EventEntity(
        id: 'e-next-month',
        title: 'Compromisso Próximo Mês',
        type: 'Ensaio',
        date: nextMonth,
        startTime: '19:00',
        endTime: '21:00',
        location: 'Local 3',
        fee: 0.0,
      );

      final eventLastYear = EventEntity(
        id: 'e-last-year',
        title: 'Compromisso Ano Passado',
        type: 'Show',
        date: lastYearSameMonth,
        startTime: '20:00',
        endTime: '22:00',
        location: 'Local 4',
        fee: 600.0,
      );

      await container.read(agendaProvider.notifier).addOrUpdateEvent(eventThisMonth);
      await container.read(agendaProvider.notifier).addOrUpdateEvent(eventLastMonth);
      await container.read(agendaProvider.notifier).addOrUpdateEvent(eventNextMonth);
      await container.read(agendaProvider.notifier).addOrUpdateEvent(eventLastYear);

      final monthlyEvents = container.read(agendaProvider.notifier).monthlyEvents;
      expect(monthlyEvents.length, 1);
      expect(monthlyEvents.first.id, 'e-this-month');
    });

    test('monthlyShows should only count events in the current month with type show (case-insensitive and trimmed)', () async {
      final now = DateTime.now();
      final thisMonth = DateTime(now.year, now.month, 12);
      final nextMonth = DateTime(now.year, now.month + 1, 12);

      final showLower = EventEntity(
        id: 's-lower',
        title: 'Show Minúsculo',
        type: 'show',
        date: thisMonth,
        startTime: '20:00',
        endTime: '22:00',
        location: 'Local A',
        fee: 1000.0,
      );

      final showSpaces = EventEntity(
        id: 's-spaces',
        title: 'Show com Espaços',
        type: '  Show  ',
        date: thisMonth,
        startTime: '21:00',
        endTime: '23:00',
        location: 'Local B',
        fee: 1500.0,
      );

      final ensaioThisMonth = EventEntity(
        id: 'e-ensaio',
        title: 'Ensaio Geral',
        type: 'Ensaio',
        date: thisMonth,
        startTime: '14:00',
        endTime: '17:00',
        location: 'Estúdio',
        fee: 0.0,
      );

      final reuniaoThisMonth = EventEntity(
        id: 'r-reuniao',
        title: 'Reunião de Banda',
        type: 'Reunião',
        date: thisMonth,
        startTime: '10:00',
        endTime: '11:00',
        location: 'Escritório',
        fee: 0.0,
      );

      final showNextMonth = EventEntity(
        id: 's-next-month',
        title: 'Show Próximo Mês',
        type: 'Show',
        date: nextMonth,
        startTime: '22:00',
        endTime: '01:00',
        location: 'Local C',
        fee: 2000.0,
      );

      await container.read(agendaProvider.notifier).addOrUpdateEvent(showLower);
      await container.read(agendaProvider.notifier).addOrUpdateEvent(showSpaces);
      await container.read(agendaProvider.notifier).addOrUpdateEvent(ensaioThisMonth);
      await container.read(agendaProvider.notifier).addOrUpdateEvent(reuniaoThisMonth);
      await container.read(agendaProvider.notifier).addOrUpdateEvent(showNextMonth);

      final showsCount = container.read(agendaProvider.notifier).monthlyShows;
      expect(showsCount, 2);
    });

    test('monthlyFee should sum fees strictly for current month events, ignoring past and future months', () async {
      final now = DateTime.now();
      final thisMonth1 = DateTime(now.year, now.month, 5);
      final thisMonth2 = DateTime(now.year, now.month, 20);
      final pastMonth = DateTime(now.year, now.month - 1, 15);
      final futureMonth = DateTime(now.year, now.month + 1, 15);

      final event1ThisMonth = EventEntity(
        id: 'fee-1',
        title: 'Show 1 Mês Atual',
        type: 'Show',
        date: thisMonth1,
        startTime: '20:00',
        endTime: '22:00',
        location: 'Local 1',
        fee: 1500.0,
      );

      final event2ThisMonth = EventEntity(
        id: 'fee-2',
        title: 'Show 2 Mês Atual',
        type: 'Show',
        date: thisMonth2,
        startTime: '21:00',
        endTime: '23:00',
        location: 'Local 2',
        fee: 2500.0,
      );

      final pastEvent = EventEntity(
        id: 'fee-past',
        title: 'Show Mês Passado',
        type: 'Show',
        date: pastMonth,
        startTime: '20:00',
        endTime: '22:00',
        location: 'Local 3',
        fee: 5000.0,
      );

      final futureEvent = EventEntity(
        id: 'fee-future',
        title: 'Show Mês Futuro',
        type: 'Show',
        date: futureMonth,
        startTime: '20:00',
        endTime: '22:00',
        location: 'Local 4',
        fee: 10000.0,
      );

      final controller = container.read(agendaProvider.notifier);

      // Estado inicial sem eventos
      expect(controller.monthlyFee, 0.0);

      await controller.addOrUpdateEvent(event1ThisMonth);
      await controller.addOrUpdateEvent(event2ThisMonth);
      await controller.addOrUpdateEvent(pastEvent);
      await controller.addOrUpdateEvent(futureEvent);

      // monthlyFee deve somar apenas 1500 + 2500 = 4000.0 (ignorando 5000 e 10000)
      expect(controller.monthlyFee, 4000.0);
      // Enquanto o totalFee legado acumula tudo (1500 + 2500 + 5000 + 10000 = 19000.0)
      expect(controller.totalFee, 19000.0);
    });
  });
}

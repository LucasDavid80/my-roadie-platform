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
}

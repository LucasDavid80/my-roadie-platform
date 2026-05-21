import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:agenda_musical/presentation/controllers/agenda_controller.dart';
import 'package:agenda_musical/domain/entities/event_entity.dart';

void main() {
  late ProviderContainer container;

  setUp(() {
    container = ProviderContainer();
  });

  tearDown(() {
    container.dispose();
  });

  test('Should start with an empty list', () {
    final state = container.read(agendaProvider);
    expect(state, isEmpty);
  });

  test('Should add a new event', () {
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

    container.read(agendaProvider.notifier).addOrUpdateEvent(event);
    
    final state = container.read(agendaProvider);
    expect(state.length, 1);
    expect(state.first.id, '1');
    expect(state.first.title, 'Show Test');
  });

  test('Should update an existing event', () {
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

    container.read(agendaProvider.notifier).addOrUpdateEvent(event1);

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

    container.read(agendaProvider.notifier).addOrUpdateEvent(eventUpdate);

    final state = container.read(agendaProvider);
    expect(state.length, 1);
    expect(state.first.title, 'Updated Title');
    expect(state.first.fee, 600.0);
  });

  test('Should calculate total fee correctly', () {
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

    container.read(agendaProvider.notifier).addOrUpdateEvent(event1);
    container.read(agendaProvider.notifier).addOrUpdateEvent(event2);

    final totalFee = container.read(agendaProvider.notifier).totalFee;
    expect(totalFee, 850.0);
  });

  test('Should count monthly shows correctly', () {
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

    container.read(agendaProvider.notifier).addOrUpdateEvent(eventThisMonth);
    container.read(agendaProvider.notifier).addOrUpdateEvent(eventLastMonth);

    final shows = container.read(agendaProvider.notifier).monthlyShows;
    expect(shows, 1);
  });
}

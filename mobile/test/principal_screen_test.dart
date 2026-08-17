import 'package:agenda_musical/domain/entities/event_entity.dart';
import 'package:agenda_musical/domain/interfaces/i_agenda_repository.dart';
import 'package:agenda_musical/presentation/controllers/agenda_controller.dart';
import 'package:agenda_musical/presentation/screens/principal/principal_screen.dart';
import 'package:agenda_musical/presentation/screens/principal/widgets/custom_calendar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mocktail/mocktail.dart';

class MockAgendaRepository extends Mock implements IAgendaRepository {}

void main() {
  late MockAgendaRepository mockAgendaRepository;

  setUpAll(() async {
    await initializeDateFormatting('pt_BR', null);
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

  setUp(() {
    mockAgendaRepository = MockAgendaRepository();
    when(() => mockAgendaRepository.getEvents()).thenAnswer((_) async => []);
    when(() => mockAgendaRepository.saveEvent(any())).thenAnswer((invocation) async => invocation.positionalArguments.first as EventEntity);
    when(() => mockAgendaRepository.deleteEvent(any())).thenAnswer((_) async => {});
  });

  testWidgets('Should render new event in PrincipalScreen when agendaProvider emits new state (T2.2)', (WidgetTester tester) async {
    final container = ProviderContainer(
      overrides: [
        agendaRepositoryProvider.overrideWithValue(mockAgendaRepository),
      ],
    );

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: const MaterialApp(
          home: PrincipalScreen(),
        ),
      ),
    );

    await tester.pumpAndSettle();

    // Inicialmente não tem nenhum compromisso
    expect(find.text('Nenhum compromisso para este dia.'), findsOneWidget);
    expect(find.text('Novo Show Reativo'), findsNothing);

    final newEvent = EventEntity(
      id: 'real-uuid-reactivity-123',
      title: 'Novo Show Reativo',
      type: 'Show',
      date: DateTime.now(),
      startTime: '21:00',
      endTime: '23:00',
      location: 'Teatro Municipal',
      fee: 1500.0,
      notes: 'Passagem de som às 18h',
    );

    // Dispara a adição do evento via Notifier
    await container.read(agendaProvider.notifier).addOrUpdateEvent(newEvent);
    await tester.pumpAndSettle();

    // Verifica que o widget reagiu e renderizou o novo item na árvore
    expect(find.text('Nenhum compromisso para este dia.'), findsNothing);
    expect(find.text('Novo Show Reativo'), findsOneWidget);
    expect(find.text('Teatro Municipal'), findsOneWidget);
  });

  testWidgets('Should scroll PrincipalScreen vertically when dragging over CustomCalendar (T2.1)', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(800, 1200);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    final now = DateTime.now();
    final events = List.generate(
      10,
      (index) => EventEntity(
        id: 'scroll-event-$index',
        title: 'Show de Rolagem #$index',
        type: 'Show',
        date: now,
        startTime: '20:00',
        endTime: '22:00',
        location: 'Local #$index',
        fee: 500.0,
      ),
    );

    final container = ProviderContainer(
      overrides: [
        agendaRepositoryProvider.overrideWithValue(mockAgendaRepository),
      ],
    );

    for (final event in events) {
      await container.read(agendaProvider.notifier).addOrUpdateEvent(event);
    }

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: const MaterialApp(
          home: PrincipalScreen(),
        ),
      ),
    );

    await tester.pumpAndSettle();

    final scrollableFinder = find.descendant(
      of: find.byType(SingleChildScrollView),
      matching: find.byType(Scrollable),
    ).first;

    final initialOffset = tester.state<ScrollableState>(scrollableFinder).position.pixels;
    expect(initialOffset, equals(0.0));

    final calendarFinder = find.byType(CustomCalendar);
    expect(calendarFinder, findsOneWidget);

    await tester.drag(calendarFinder, const Offset(0, -300));
    await tester.pumpAndSettle();

    final updatedOffset = tester.state<ScrollableState>(scrollableFinder).position.pixels;
    expect(updatedOffset, greaterThan(initialOffset));
  });
}


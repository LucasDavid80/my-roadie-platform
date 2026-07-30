import 'package:agenda_musical/domain/entities/event_entity.dart';
import 'package:agenda_musical/domain/interfaces/i_agenda_repository.dart';
import 'package:agenda_musical/presentation/controllers/agenda_controller.dart';
import 'package:agenda_musical/presentation/screens/principal/principal_screen.dart';
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
}

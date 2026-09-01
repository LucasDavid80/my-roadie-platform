import 'package:agenda_musical/domain/entities/event_entity.dart';
import 'package:agenda_musical/domain/interfaces/i_agenda_repository.dart';
import 'package:agenda_musical/presentation/controllers/agenda_controller.dart';
import 'package:agenda_musical/presentation/screens/history/history_screen.dart';
import 'package:agenda_musical/presentation/screens/principal/widgets/commitment_card.dart';
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
        id: 'fallback-id',
        title: 'Fallback Event',
        type: 'Show',
        date: DateTime(2025, 1, 1),
        startTime: '10:00',
        endTime: '12:00',
        location: 'Fallback Loc',
        fee: 100.0,
      ),
    );
  });

  setUp(() {
    mockAgendaRepository = MockAgendaRepository();
    when(() => mockAgendaRepository.getEvents()).thenAnswer((_) async => []);
    when(() => mockAgendaRepository.saveEvent(any())).thenAnswer(
      (invocation) async => invocation.positionalArguments.first as EventEntity,
    );
    when(() => mockAgendaRepository.deleteEvent(any())).thenAnswer(
      (_) async => {},
    );
  });

  Widget createTestWidget({required ProviderContainer container}) {
    return UncontrolledProviderScope(
      container: container,
      child: const MaterialApp(
        home: HistoryScreen(),
      ),
    );
  }

  testWidgets(
      'Should render empty state message when there are no past events',
      (WidgetTester tester) async {
    final container = ProviderContainer(
      overrides: [
        agendaRepositoryProvider.overrideWithValue(mockAgendaRepository),
      ],
    );

    await tester.pumpWidget(createTestWidget(container: container));
    await tester.pumpAndSettle();

    expect(find.text('Histórico de Compromissos'), findsOneWidget);
    expect(find.text('Nenhum compromisso no histórico ainda'), findsOneWidget);
    expect(find.byType(CommitmentCard), findsNothing);
  });

  testWidgets(
      'Should render past events and ignore future events in HistoryScreen',
      (WidgetTester tester) async {
    final now = DateTime.now();
    final pastDate1 = now.subtract(const Duration(days: 2));
    final pastDate2 = now.subtract(const Duration(days: 10));
    final futureDate = now.add(const Duration(days: 5));

    final pastEvent1 = EventEntity(
      id: 'past-1',
      title: 'Show Passado Recente',
      type: 'Show',
      date: pastDate1,
      startTime: '20:00',
      endTime: '22:00',
      location: 'Bar Antigo',
      fee: 600.0,
      notes: 'Cachê pago',
    );

    final pastEvent2 = EventEntity(
      id: 'past-2',
      title: 'Ensaio Passado Antigo',
      type: 'Ensaio',
      date: pastDate2,
      startTime: '15:00',
      endTime: '17:00',
      location: 'Estúdio B',
      fee: 0.0,
      notes: '',
    );

    final futureEvent = EventEntity(
      id: 'future-1',
      title: 'Show Futuro Não Deve Aparecer',
      type: 'Show',
      date: futureDate,
      startTime: '21:00',
      endTime: '23:00',
      location: 'Grande Teatro',
      fee: 2000.0,
      notes: '',
    );

    when(() => mockAgendaRepository.getEvents()).thenAnswer(
      (_) async => [
        pastEvent1,
        pastEvent2,
        futureEvent,
      ],
    );

    final container = ProviderContainer(
      overrides: [
        agendaRepositoryProvider.overrideWithValue(mockAgendaRepository),
      ],
    );

    await tester.pumpWidget(createTestWidget(container: container));
    await tester.pumpAndSettle();

    // Mensagem de vazio não deve aparecer
    expect(find.text('Nenhum compromisso no histórico ainda'), findsNothing);

    // Compromissos passados devem ser renderizados
    expect(find.text('Show Passado Recente'), findsOneWidget);
    expect(find.text('Ensaio Passado Antigo'), findsOneWidget);
    expect(find.text('Bar Antigo'), findsOneWidget);
    expect(find.text('Estúdio B'), findsOneWidget);

    // Compromisso futuro não deve aparecer no histórico
    expect(find.text('Show Futuro Não Deve Aparecer'), findsNothing);

    // Dois cards renderizados
    expect(find.byType(CommitmentCard), findsNWidgets(2));

    // Botões de edição e exclusão presentes (ações habilitadas)
    expect(
      find.byKey(const ValueKey('commitment_card_edit_button')),
      findsNWidgets(2),
    );
    expect(
      find.byKey(const ValueKey('commitment_card_delete_button')),
      findsNWidgets(2),
    );
  });
}

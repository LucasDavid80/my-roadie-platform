import 'package:agenda_musical/domain/entities/event_entity.dart';
import 'package:agenda_musical/domain/interfaces/i_agenda_repository.dart';
import 'package:agenda_musical/presentation/controllers/agenda_controller.dart';
import 'package:agenda_musical/presentation/screens/history/history_screen.dart';
import 'package:agenda_musical/presentation/screens/principal/principal_screen.dart';
import 'package:agenda_musical/presentation/screens/principal/widgets/custom_calendar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:intl/intl.dart';
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

  testWidgets('Should not display past events in Upcoming Commitments on PrincipalScreen (T3.4)', (WidgetTester tester) async {
    final now = DateTime.now();
    final pastEvent = EventEntity(
      id: 'past-event-1',
      title: 'Show Ontem Já Ocorrido',
      type: 'Show',
      date: now.subtract(const Duration(days: 1)),
      startTime: '20:00',
      endTime: '22:00',
      location: 'Local Passado',
      fee: 400.0,
      notes: '',
    );
    final upcomingEvent = EventEntity(
      id: 'upcoming-event-1',
      title: 'Show Amanhã Confirmado',
      type: 'Show',
      date: now.add(const Duration(days: 1)),
      startTime: '21:00',
      endTime: '23:00',
      location: 'Local Futuro',
      fee: 800.0,
      notes: '',
    );

    when(() => mockAgendaRepository.getEvents()).thenAnswer(
      (_) async => [pastEvent, upcomingEvent],
    );

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

    // Evento futuro deve estar presente
    expect(find.text('Show Amanhã Confirmado'), findsOneWidget);
    expect(find.text('Local Futuro'), findsOneWidget);

    // Evento passado NÃO deve aparecer em Próximos Compromissos
    expect(find.text('Show Ontem Já Ocorrido'), findsNothing);
    expect(find.text('Local Passado'), findsNothing);
  });

  testWidgets('Should navigate to HistoryScreen when tapping view history button (T3.4)', (WidgetTester tester) async {
    final testRouter = GoRouter(
      initialLocation: '/',
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const PrincipalScreen(),
          routes: [
            GoRoute(
              path: 'history',
              builder: (context, state) => const HistoryScreen(),
            ),
          ],
        ),
      ],
    );

    final container = ProviderContainer(
      overrides: [
        agendaRepositoryProvider.overrideWithValue(mockAgendaRepository),
      ],
    );

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: MaterialApp.router(
          routerConfig: testRouter,
        ),
      ),
    );

    await tester.pumpAndSettle();

    // Encontra e clica no botão "Ver histórico"
    final viewHistoryButton = find.byKey(const ValueKey('view_history_button'));
    expect(viewHistoryButton, findsOneWidget);
    expect(find.text('Ver histórico'), findsOneWidget);

    await tester.ensureVisible(viewHistoryButton);
    await tester.pumpAndSettle();

    await tester.tap(viewHistoryButton);
    await tester.pumpAndSettle();

    // Verifica que navegou para a tela de histórico
    expect(find.byType(HistoryScreen), findsOneWidget);
    expect(find.text('Histórico de Compromissos'), findsOneWidget);
  });

  Finder findCardValue(String cardTitle, String expectedValue) {
    final card = find.ancestor(
      of: find.text(cardTitle),
      matching: find.byType(Card),
    );
    return find.descendant(
      of: card,
      matching: find.text(expectedValue),
    );
  }

  testWidgets('Should display accurate current month metrics in dashboard cards on PrincipalScreen (T3.2)', (WidgetTester tester) async {
    final currencyFormatter = NumberFormat.currency(
      locale: 'pt_BR',
      symbol: r'R$',
    );
    final now = DateTime.now();

    final showThisMonth = EventEntity(
      id: 'show-this-month',
      title: 'Show Deste Mês',
      type: 'Show',
      date: DateTime(now.year, now.month, now.day, 21, 0),
      startTime: '21:00',
      endTime: '23:00',
      location: 'Palco Principal',
      fee: 1500.0,
      notes: '',
    );
    final rehearsalThisMonth = EventEntity(
      id: 'rehearsal-this-month',
      title: 'Ensaio Geral',
      type: 'Ensaio',
      date: DateTime(now.year, now.month, now.day, 18, 0),
      startTime: '18:00',
      endTime: '20:00',
      location: 'Estúdio',
      fee: 0.0,
      notes: '',
    );
    final showNextMonth = EventEntity(
      id: 'show-next-month',
      title: 'Show Mês Que Vem',
      type: 'Show',
      date: DateTime(now.year, now.month + 1, 15, 20, 0),
      startTime: '20:00',
      endTime: '22:00',
      location: 'Outro Estado',
      fee: 5000.0,
      notes: '',
    );
    final showPastMonth = EventEntity(
      id: 'show-past-month',
      title: 'Show Mês Passado',
      type: 'Show',
      date: DateTime(now.year, now.month - 1, 15, 20, 0),
      startTime: '20:00',
      endTime: '22:00',
      location: 'Teatro Velho',
      fee: 3000.0,
      notes: '',
    );

    when(() => mockAgendaRepository.getEvents()).thenAnswer(
      (_) async => [
        showThisMonth,
        rehearsalThisMonth,
        showNextMonth,
        showPastMonth,
      ],
    );

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

    // 1. "Este Mês": 2 eventos no mês atual (showThisMonth + rehearsalThisMonth)
    expect(findCardValue('Este Mês', '2'), findsOneWidget);

    // 2. "Próximos": 3 eventos futuros a partir de hoje (showThisMonth + rehearsalThisMonth + showNextMonth)
    expect(findCardValue('Próximos', '3'), findsOneWidget);

    // 3. "Shows/Mês": 1 show no mês atual (apenas showThisMonth, excluindo rehearsal e outros meses)
    expect(findCardValue('Shows/Mês', '1'), findsOneWidget);

    // 4. "Cachê/Mês": R$ 1.500,00 (apenas showThisMonth.fee, ignorando 5000 e 3000)
    expect(
      findCardValue('Cachê/Mês', currencyFormatter.format(1500.0)),
      findsOneWidget,
    );
  });

  testWidgets('Should display zeroed metrics and R\$ 0,00 when there are no events (T3.2)', (WidgetTester tester) async {
    final currencyFormatter = NumberFormat.currency(
      locale: 'pt_BR',
      symbol: r'R$',
    );

    when(() => mockAgendaRepository.getEvents()).thenAnswer(
      (_) async => [],
    );

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

    expect(findCardValue('Este Mês', '0'), findsOneWidget);
    expect(findCardValue('Próximos', '0'), findsOneWidget);
    expect(findCardValue('Shows/Mês', '0'), findsOneWidget);
    expect(
      findCardValue('Cachê/Mês', currencyFormatter.format(0.0)),
      findsOneWidget,
    );
  });

  testWidgets('Should reactively update dashboard cards when a new event is added to current month (T3.2)', (WidgetTester tester) async {
    final currencyFormatter = NumberFormat.currency(
      locale: 'pt_BR',
      symbol: r'R$',
    );
    final now = DateTime.now();

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

    // Começa vazio
    expect(findCardValue('Este Mês', '0'), findsOneWidget);
    expect(findCardValue('Shows/Mês', '0'), findsOneWidget);
    expect(
      findCardValue('Cachê/Mês', currencyFormatter.format(0.0)),
      findsOneWidget,
    );

    // Adiciona show no mês atual com cachê de 2500
    final newShow = EventEntity(
      id: 'reactive-card-event-1',
      title: 'Show Adicionado Reativo',
      type: 'Show',
      date: DateTime(now.year, now.month, now.day, 20, 0),
      startTime: '20:00',
      endTime: '22:00',
      location: 'Palco Externo',
      fee: 2500.0,
      notes: '',
    );

    await container.read(agendaProvider.notifier).addOrUpdateEvent(newShow);
    await tester.pumpAndSettle();

    // Cards atualizados reativamente
    expect(findCardValue('Este Mês', '1'), findsOneWidget);
    expect(findCardValue('Próximos', '1'), findsOneWidget);
    expect(findCardValue('Shows/Mês', '1'), findsOneWidget);
    expect(
      findCardValue('Cachê/Mês', currencyFormatter.format(2500.0)),
      findsOneWidget,
    );
  });
}


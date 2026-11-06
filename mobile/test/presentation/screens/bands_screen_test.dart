import 'dart:async';

import 'package:agenda_musical/data/datasources/remote_datasource.dart';
import 'package:agenda_musical/data/models/band_model.dart';
import 'package:agenda_musical/domain/interfaces/i_band_repository.dart';
import 'package:agenda_musical/presentation/controllers/band_controller.dart';
import 'package:agenda_musical/presentation/screens/bands/bands_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockBandRepository extends Mock implements IBandRepository {}

void main() {
  late ProviderContainer container;
  late MockBandRepository mockBandRepository;

  setUp(() {
    mockBandRepository = MockBandRepository();
    container = ProviderContainer(
      overrides: [
        bandRepositoryProvider.overrideWithValue(mockBandRepository),
      ],
    );
    addTearDown(container.dispose);
  });

  Widget createTestWidget() {
    return UncontrolledProviderScope(
      container: container,
      child: const MaterialApp(home: BandsScreen()),
    );
  }

  void stubBands() {
    when(() => mockBandRepository.getBands()).thenAnswer(
      (_) async => [
        const BandModel(id: 'band-1', name: 'Banda Aurora'),
        const BandModel(id: 'band-2', name: 'Banda Eclipse'),
      ],
    );
  }

  testWidgets('should list the bands and mark the first one as active (loading success)', (WidgetTester tester) async {
    // arrange
    stubBands();

    // act
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    // assert
    expect(find.widgetWithText(ListTile, 'Banda Aurora'), findsOneWidget);
    expect(find.widgetWithText(ListTile, 'Banda Eclipse'), findsOneWidget);
    expect(find.text('Workspace ativo'), findsOneWidget);
    expect(find.byIcon(Icons.check_circle), findsOneWidget);
    expect(container.read(bandProvider).activeBandId, 'band-1');
  });

  testWidgets('should switch the active workspace when a band is tapped', (WidgetTester tester) async {
    // arrange
    stubBands();
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    // act
    await tester.tap(find.widgetWithText(ListTile, 'Banda Eclipse'));
    await tester.pumpAndSettle();

    // assert
    expect(container.read(bandProvider).activeBandId, 'band-2');
    expect(
      find.descendant(
        of: find.widgetWithText(ListTile, 'Banda Eclipse'),
        matching: find.text('Workspace ativo'),
      ),
      findsOneWidget,
    );
    expect(find.byIcon(Icons.check_circle), findsOneWidget);
  });

  testWidgets('should show an empty state when there are no bands', (WidgetTester tester) async {
    // arrange
    when(() => mockBandRepository.getBands()).thenAnswer((_) async => []);

    // act
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    // assert
    expect(
      find.text('Nenhuma banda disponível para esta conta.'),
      findsOneWidget,
    );
    expect(find.byType(ListTile), findsNothing);
  });

  testWidgets('should show error feedback when loading fails', (WidgetTester tester) async {
    // arrange
    when(
      () => mockBandRepository.getBands(),
    ).thenThrow(NetworkException());

    // act
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    // assert
    expect(find.text('Erro de conexão com o servidor'), findsOneWidget);
    expect(find.text('Não foi possível carregar as bandas.'), findsOneWidget);
    expect(find.byType(ListTile), findsNothing);
  });

  testWidgets('should preserve the active workspace when navigating to another screen', (WidgetTester tester) async {
    // arrange
    stubBands();
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    await tester.tap(find.widgetWithText(ListTile, 'Banda Eclipse'));
    await tester.pumpAndSettle();
    expect(container.read(bandProvider).activeBandId, 'band-2');

    // act
    final navigator = tester.state<NavigatorState>(find.byType(Navigator));
    unawaited(
      navigator.push(
        MaterialPageRoute<void>(builder: (_) => const BandsScreen()),
      ),
    );
    await tester.pumpAndSettle();

    // assert
    expect(find.byType(BandsScreen), findsOneWidget);
    expect(container.read(bandProvider).activeBandId, 'band-2');
    expect(
      find.descendant(
        of: find.widgetWithText(ListTile, 'Banda Eclipse'),
        matching: find.text('Workspace ativo'),
      ),
      findsOneWidget,
    );
  });
}

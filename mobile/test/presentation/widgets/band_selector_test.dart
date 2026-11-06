import 'dart:async';

import 'package:agenda_musical/data/datasources/remote_datasource.dart';
import 'package:agenda_musical/data/models/band_model.dart';
import 'package:agenda_musical/domain/entities/band_entity.dart';
import 'package:agenda_musical/domain/interfaces/i_band_repository.dart';
import 'package:agenda_musical/presentation/controllers/band_controller.dart';
import 'package:agenda_musical/presentation/widgets/band_selector.dart';
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
      child: const MaterialApp(
        home: Scaffold(body: BandSelector()),
      ),
    );
  }

  testWidgets('should show a loading indicator while bands are being fetched (loading state)', (WidgetTester tester) async {
    // arrange
    final completer = Completer<List<BandEntity>>();
    when(
      () => mockBandRepository.getBands(),
    ).thenAnswer((_) => completer.future);

    unawaited(container.read(bandProvider.notifier).fetchBands());

    // act
    await tester.pumpWidget(createTestWidget());
    await tester.pump();

    // assert
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(find.byType(DropdownButton<String>), findsNothing);
  });

  testWidgets('should show error feedback and retry the request when loading fails (error state)', (WidgetTester tester) async {
    // arrange
    var callCount = 0;
    when(() => mockBandRepository.getBands()).thenAnswer((_) async {
      callCount++;
      if (callCount == 1) {
        throw NetworkException();
      }
      return [const BandModel(id: 'band-1', name: 'Banda Aurora')];
    });

    await container.read(bandProvider.notifier).fetchBands();

    // act
    await tester.pumpWidget(createTestWidget());
    await tester.pump();

    // assert
    expect(find.text('Não foi possível carregar as bandas.'), findsOneWidget);
    expect(find.byIcon(Icons.refresh), findsOneWidget);

    await tester.tap(find.byIcon(Icons.refresh));
    await tester.pumpAndSettle();

    expect(find.text('Não foi possível carregar as bandas.'), findsNothing);
    expect(find.text('Banda Aurora'), findsOneWidget);
    expect(callCount, 2);
  });

  testWidgets('should show an empty message when the user has no bands (empty state)', (WidgetTester tester) async {
    // arrange
    when(() => mockBandRepository.getBands()).thenAnswer((_) async => []);
    await container.read(bandProvider.notifier).fetchBands();

    // act
    await tester.pumpWidget(createTestWidget());
    await tester.pump();

    // assert
    expect(find.text('Nenhuma banda disponível'), findsOneWidget);
    expect(find.byType(DropdownButton<String>), findsNothing);
  });

  testWidgets('should render the available bands and switch the active workspace on selection', (WidgetTester tester) async {
    // arrange
    when(() => mockBandRepository.getBands()).thenAnswer(
      (_) async => [
        const BandModel(id: 'band-1', name: 'Banda Aurora'),
        const BandModel(id: 'band-2', name: 'Banda Eclipse'),
      ],
    );
    final controller = container.read(bandProvider.notifier);
    await controller.fetchBands();

    // act
    await tester.pumpWidget(createTestWidget());
    await tester.pump();

    // assert
    expect(find.byType(DropdownButton<String>), findsOneWidget);
    expect(
      tester
          .widget<DropdownButton<String>>(find.byType(DropdownButton<String>))
          .value,
      'band-1',
    );

    await tester.tap(find.byType(DropdownButton<String>));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Banda Eclipse').last);
    await tester.pumpAndSettle();

    expect(controller.state.activeBandId, 'band-2');
    expect(
      tester
          .widget<DropdownButton<String>>(find.byType(DropdownButton<String>))
          .value,
      'band-2',
    );
  });
}

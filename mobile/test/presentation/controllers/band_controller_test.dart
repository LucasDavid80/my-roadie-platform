import 'package:agenda_musical/data/datasources/remote_datasource.dart';
import 'package:agenda_musical/data/models/band_model.dart';
import 'package:agenda_musical/domain/interfaces/i_band_repository.dart';
import 'package:agenda_musical/presentation/controllers/band_controller.dart';
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
  });

  tearDown(() {
    container.dispose();
  });

  void stubBands() {
    when(() => mockBandRepository.getBands()).thenAnswer(
      (_) async => [
        const BandModel(id: 'band-1', name: 'Banda Aurora'),
        const BandModel(id: 'band-2', name: 'Banda Eclipse'),
      ],
    );
  }

  group('BandController', () {
    test('should start without bands and without active workspace', () {
      // act
      final state = container.read(bandProvider);

      // assert
      expect(state.bands, isEmpty);
      expect(state.activeBandId, isNull);
      expect(state.isLoading, isFalse);
      expect(state.error, isNull);
    });

    test('fetchBands should load bands and activate the first one (positive case)', () async {
      // arrange
      stubBands();

      // act
      await container.read(bandProvider.notifier).fetchBands();

      // assert
      final state = container.read(bandProvider);
      expect(state.bands.length, 2);
      expect(state.activeBandId, 'band-1');
      expect(state.isLoading, isFalse);
      expect(state.error, isNull);
    });

    test('fetchBands should preserve the active workspace when it is still accessible (positive case)', () async {
      // arrange
      stubBands();
      final controller = container.read(bandProvider.notifier);
      await controller.fetchBands();
      controller.selectBand('band-2');

      // act
      await controller.fetchBands();

      // assert
      expect(container.read(bandProvider).activeBandId, 'band-2');
    });

    test('fetchBands should discard an inaccessible active workspace and fall back to the first band (edge case)', () async {
      // arrange
      stubBands();
      final controller = container.read(bandProvider.notifier);
      await controller.fetchBands();
      controller.selectBand('band-2');

      when(() => mockBandRepository.getBands()).thenAnswer(
        (_) async => [const BandModel(id: 'band-1', name: 'Banda Aurora')],
      );

      // act
      await controller.fetchBands();

      // assert
      final state = container.read(bandProvider);
      expect(state.bands.length, 1);
      expect(state.activeBandId, 'band-1');
    });

    test('fetchBands should clear the active workspace when the user has no bands (edge case)', () async {
      // arrange
      stubBands();
      final controller = container.read(bandProvider.notifier);
      await controller.fetchBands();
      expect(container.read(bandProvider).activeBandId, 'band-1');

      when(() => mockBandRepository.getBands()).thenAnswer((_) async => []);

      // act
      await controller.fetchBands();

      // assert
      final state = container.read(bandProvider);
      expect(state.bands, isEmpty);
      expect(state.activeBandId, isNull);
    });

    test('fetchBands should expose an error and no bands on the first load failure (negative case)', () async {
      // arrange
      when(
        () => mockBandRepository.getBands(),
      ).thenThrow(NetworkException());

      // act
      await container.read(bandProvider.notifier).fetchBands();

      // assert
      final state = container.read(bandProvider);
      expect(state.bands, isEmpty);
      expect(state.activeBandId, isNull);
      expect(state.isLoading, isFalse);
      expect(state.error, isNotNull);
    });

    test('fetchBands should expose an error and keep the previous bands when a refresh fails (negative case)', () async {
      // arrange
      stubBands();
      final controller = container.read(bandProvider.notifier);
      await controller.fetchBands();

      when(
        () => mockBandRepository.getBands(),
      ).thenThrow(NetworkException());

      // act
      await controller.fetchBands();

      // assert
      final state = container.read(bandProvider);
      expect(state.isLoading, isFalse);
      expect(state.error, isNotNull);
      expect(state.bands.length, 2);
      expect(state.activeBandId, 'band-1');
    });

    test('selectBand should switch the active workspace to an available band (positive case)', () async {
      // arrange
      stubBands();
      final controller = container.read(bandProvider.notifier);
      await controller.fetchBands();

      // act
      controller.selectBand('band-2');

      // assert
      expect(container.read(bandProvider).activeBandId, 'band-2');
    });

    test('selectBand should ignore a band that is not in the workspace list (negative case)', () async {
      // arrange
      stubBands();
      final controller = container.read(bandProvider.notifier);
      await controller.fetchBands();

      // act
      controller.selectBand('band-unknown');

      // assert
      expect(container.read(bandProvider).activeBandId, 'band-1');
    });
  });
}

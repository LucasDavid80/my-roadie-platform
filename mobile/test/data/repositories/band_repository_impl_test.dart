import 'package:agenda_musical/data/datasources/remote_datasource.dart';
import 'package:agenda_musical/data/models/band_model.dart';
import 'package:agenda_musical/data/repositories/band_repository_impl.dart';
import 'package:agenda_musical/domain/entities/band_entity.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockRemoteDataSource extends Mock implements RemoteDataSource {}

void main() {
  late BandRepositoryImpl repository;
  late MockRemoteDataSource mockRemoteDataSource;

  setUp(() {
    mockRemoteDataSource = MockRemoteDataSource();
    repository = BandRepositoryImpl(mockRemoteDataSource);
  });

  group('BandRepositoryImpl', () {
    test('getBands should return the bands provided by the datasource (positive case)', () async {
      // arrange
      when(() => mockRemoteDataSource.getBands()).thenAnswer(
        (_) async => [
          const BandModel(id: 'band-1', name: 'Banda Aurora'),
          const BandModel(id: 'band-2', name: 'Banda Eclipse'),
        ],
      );

      // act
      final result = await repository.getBands();

      // assert
      expect(result, isA<List<BandEntity>>());
      expect(result.length, 2);
      expect(result.first.id, 'band-1');
      expect(result.first.name, 'Banda Aurora');
      expect(result[1].name, 'Banda Eclipse');
      verify(() => mockRemoteDataSource.getBands()).called(1);
    });

    test('getBands should return an empty list when the user has no bands (edge case)', () async {
      // arrange
      when(() => mockRemoteDataSource.getBands()).thenAnswer((_) async => []);

      // act
      final result = await repository.getBands();

      // assert
      expect(result, isEmpty);
      verify(() => mockRemoteDataSource.getBands()).called(1);
    });

    test('getBands should propagate datasource failures (negative case)', () async {
      // arrange
      when(
        () => mockRemoteDataSource.getBands(),
      ).thenThrow(NetworkException());

      // act & assert
      expect(
        () => repository.getBands(),
        throwsA(isA<NetworkException>()),
      );
    });
  });
}

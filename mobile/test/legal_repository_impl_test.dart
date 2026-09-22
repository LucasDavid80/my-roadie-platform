import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:agenda_musical/data/datasources/remote_datasource.dart';
import 'package:agenda_musical/data/repositories/legal_repository_impl.dart';

class MockRemoteDataSource extends Mock implements RemoteDataSource {}

void main() {
  late LegalRepositoryImpl repository;
  late MockRemoteDataSource mockRemoteDataSource;

  setUp(() {
    mockRemoteDataSource = MockRemoteDataSource();
    repository = LegalRepositoryImpl(mockRemoteDataSource);
  });

  group('LegalRepositoryImpl', () {
    test('getCurrentTermsVersion should return version from datasource (positive case)', () async {
      // arrange
      when(() => mockRemoteDataSource.getCurrentTermsVersion())
          .thenAnswer((_) async => 'v1.0.0');

      // act
      final result = await repository.getCurrentTermsVersion();

      // assert
      expect(result, 'v1.0.0');
      verify(() => mockRemoteDataSource.getCurrentTermsVersion()).called(1);
    });

    test('getCurrentTermsVersion should throw exception when datasource fails (negative case)', () async {
      // arrange
      when(() => mockRemoteDataSource.getCurrentTermsVersion())
          .thenThrow(ServerException('Server Error'));

      // act & assert
      expect(() => repository.getCurrentTermsVersion(), throwsA(isA<ServerException>()));
    });

    test('acceptTerms should complete successfully when datasource succeeds (positive case)', () async {
      // arrange
      when(() => mockRemoteDataSource.acceptTerms(any()))
          .thenAnswer((_) async => Future.value());

      // act
      await repository.acceptTerms('v1.0.0');

      // assert
      verify(() => mockRemoteDataSource.acceptTerms('v1.0.0')).called(1);
    });

    test('acceptTerms should throw exception when datasource fails (negative case)', () async {
      // arrange
      when(() => mockRemoteDataSource.acceptTerms(any()))
          .thenThrow(UnauthorizedException());

      // act & assert
      expect(() => repository.acceptTerms('v1.0.0'), throwsA(isA<UnauthorizedException>()));
    });
  });
}

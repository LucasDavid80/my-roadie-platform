import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:agenda_musical/data/datasources/remote_datasource.dart';
import 'package:agenda_musical/data/repositories/user_repository_impl.dart';
import 'package:agenda_musical/domain/entities/user_entity.dart';
import 'package:agenda_musical/data/models/user_model.dart';

class MockRemoteDataSource extends Mock implements RemoteDataSource {}

void main() {
  late UserRepositoryImpl repository;
  late MockRemoteDataSource mockRemoteDataSource;

  setUpAll(() {
    registerFallbackValue(
      UserModel(
        id: '1',
        name: 'Test User',
      ),
    );
  });

  setUp(() {
    mockRemoteDataSource = MockRemoteDataSource();
    repository = UserRepositoryImpl(mockRemoteDataSource);
  });

  group('UserRepositoryImpl', () {
    final tUserEntity = UserEntity(
      id: 'user-123',
      name: 'Lucas',
    );
    final tUserModel = UserModel(
      id: 'user-123',
      name: 'Lucas',
    );

    test('getUser should return UserEntity when datasource succeeds (positive case)', () async {
      // arrange
      when(() => mockRemoteDataSource.getUserProfile(any()))
          .thenAnswer((_) async => tUserModel);

      // act
      final result = await repository.getUser('user-123');

      // assert
      expect(result, isA<UserEntity>());
      expect(result.id, 'user-123');
      expect(result.name, 'Lucas');
      verify(() => mockRemoteDataSource.getUserProfile('user-123')).called(1);
    });

    test('getUser should throw exception when datasource fails (negative case)', () async {
      // arrange
      when(() => mockRemoteDataSource.getUserProfile(any()))
          .thenThrow(ServerException('Server Error'));

      // act & assert
      expect(() => repository.getUser('user-123'), throwsA(isA<ServerException>()));
    });

    test('updateUser should call updateUserProfile on datasource (positive case)', () async {
      // arrange
      when(() => mockRemoteDataSource.updateUserProfile(any(), any()))
          .thenAnswer((_) async => tUserModel);

      // act
      final result = await repository.updateUser('user-123', tUserEntity);

      // assert
      expect(result, isA<UserEntity>());
      verify(() => mockRemoteDataSource.updateUserProfile('user-123', any())).called(1);
    });
  });
}

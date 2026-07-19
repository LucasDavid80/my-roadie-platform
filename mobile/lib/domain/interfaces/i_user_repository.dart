// lib/domain/interfaces/i_user_repository.dart
import '../entities/user_entity.dart';

abstract class IUserRepository {
  Future<UserEntity> getUser(String id);
  Future<UserEntity> updateUser(String id, UserEntity user);
}

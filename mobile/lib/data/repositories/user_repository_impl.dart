// lib/data/repositories/user_repository_impl.dart
import '../../domain/entities/user_entity.dart';
import '../../domain/interfaces/i_user_repository.dart';
import '../datasources/remote_datasource.dart';
import '../models/user_model.dart';

class UserRepositoryImpl implements IUserRepository {
  final RemoteDataSource remoteDataSource;

  UserRepositoryImpl(this.remoteDataSource);

  @override
  Future<UserEntity> getUser(String id) async {
    return await remoteDataSource.getUserProfile(id);
  }

  @override
  Future<UserEntity> updateUser(String id, UserEntity user) async {
    final model = UserModel(
      id: user.id,
      name: user.name,
      experience: user.experience,
      phone: user.phone,
      instagram: user.instagram,
      city: user.city,
      federativeUnit: user.federativeUnit,
      minCache: user.minCache,
      youtubeLink: user.youtubeLink,
      bio: user.bio,
      instruments: user.instruments,
      styles: user.styles,
      isAvailable: user.isAvailable,
    );
    return await remoteDataSource.updateUserProfile(id, model);
  }
}

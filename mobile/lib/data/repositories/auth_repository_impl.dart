// lib/data/repositories/auth_repository_impl.dart
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../domain/interfaces/i_auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';

class AuthRepositoryImpl implements IAuthRepository {
  final AuthRemoteDataSource remoteDataSource;

  AuthRepositoryImpl(this.remoteDataSource);

  @override
  Future<User?> signIn(String email, String password) async {
    final response = await remoteDataSource.signIn(email: email, password: password);
    return response.user;
  }

  @override
  Future<User?> signUp(String email, String password) async {
    final response = await remoteDataSource.signUp(email: email, password: password);
    return response.user;
  }

  @override
  Future<void> signOut() async {
    await remoteDataSource.signOut();
  }

  @override
  User? get currentUser => remoteDataSource.currentUser;

  @override
  String? get currentToken => remoteDataSource.currentSession?.accessToken;
}

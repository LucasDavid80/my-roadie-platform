// lib/data/datasources/auth_remote_datasource.dart
import 'package:supabase_flutter/supabase_flutter.dart';
import 'remote_datasource.dart';

class AuthRemoteDataSource {
  final SupabaseClient _supabase;
  final RemoteDataSource? _remoteDataSource;

  AuthRemoteDataSource(this._supabase, [this._remoteDataSource]);

  Future<AuthResponse> signIn({required String email, required String password}) async {
    return await _supabase.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  Future<AuthResponse> signUp({
    required String email,
    required String password,
    String? name,
    String? role,
    Map<String, dynamic>? data,
  }) async {
    final metadata = <String, dynamic>{
      ...?data,
    };
    if (name != null) metadata['name'] = name;
    if (role != null) metadata['role'] = role;

    final response = await _supabase.auth.signUp(
      email: email,
      password: password,
      data: metadata.isNotEmpty ? metadata : null,
    );

    final user = response.user;
    if (user != null && _remoteDataSource != null) {
      final userRole = role ?? (user.userMetadata?['role']?.toString() ?? 'MUSICIAN');
      final userName = name ?? (user.userMetadata?['name']?.toString() ?? '');

      await _remoteDataSource.createUser(
        email: email,
        supabaseId: user.id,
        name: userName,
        role: userRole,
      );
    }

    return response;
  }

  Future<void> signOut() async {
    await _supabase.auth.signOut();
  }

  Session? get currentSession => _supabase.auth.currentSession;
  User? get currentUser => _supabase.auth.currentUser;
}

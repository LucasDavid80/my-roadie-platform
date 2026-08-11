// lib/data/datasources/auth_remote_datasource.dart
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/config/app_config.dart';
import 'remote_datasource.dart';

class AuthRemoteDataSource {
  final SupabaseClient? _supabase;
  final RemoteDataSource? _remoteDataSource;

  AuthRemoteDataSource(this._supabase, [this._remoteDataSource]);

  Future<AuthResponse?> signIn({required String email, required String password}) async {
    if (_supabase == null || !AppConfig.isConfigured) {
      final mockId = 'mock-user-1';
      return AuthResponse(
        user: User(
          id: mockId,
          appMetadata: {},
          userMetadata: {'name': 'Usuário Teste', 'role': 'MUSICIAN'},
          aud: 'authenticated',
          createdAt: DateTime.now().toIso8601String(),
        ),
      );
    }
    return await _supabase.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  Future<AuthResponse?> signUp({
    required String email,
    required String password,
    String? name,
    String? role,
    Map<String, dynamic>? data,
  }) async {
    if (_supabase == null || !AppConfig.isConfigured) {
      final mockId = 'mock-user-${DateTime.now().millisecondsSinceEpoch}';
      final userRole = role ?? 'MUSICIAN';
      final userName = name ?? '';

      if (_remoteDataSource != null) {
        await _remoteDataSource.createUser(
          email: email,
          supabaseId: mockId,
          name: userName,
          role: userRole,
        );
      }

      return AuthResponse(
        user: User(
          id: mockId,
          appMetadata: {},
          userMetadata: {'name': userName, 'role': userRole},
          aud: 'authenticated',
          createdAt: DateTime.now().toIso8601String(),
        ),
      );
    }

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
    if (_supabase == null) return;
    await _supabase.auth.signOut();
  }

  Session? get currentSession {
    if (_supabase == null) return null;
    try {
      return _supabase.auth.currentSession;
    } catch (_) {
      return null;
    }
  }

  User? get currentUser {
    if (_supabase == null) return null;
    try {
      return _supabase.auth.currentUser;
    } catch (_) {
      return null;
    }
  }
}

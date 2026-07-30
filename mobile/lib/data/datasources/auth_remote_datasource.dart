// lib/data/datasources/auth_remote_datasource.dart
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthRemoteDataSource {
  final SupabaseClient? _supabase;

  AuthRemoteDataSource(this._supabase);

  Future<AuthResponse?> signIn({required String email, required String password}) async {
    if (_supabase == null) return null;
    return await _supabase.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  Future<AuthResponse?> signUp({required String email, required String password}) async {
    if (_supabase == null) return null;
    return await _supabase.auth.signUp(
      email: email,
      password: password,
    );
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

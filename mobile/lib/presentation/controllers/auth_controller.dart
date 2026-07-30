// lib/presentation/controllers/auth_controller.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../domain/interfaces/i_auth_repository.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../data/datasources/auth_remote_datasource.dart';

// Providers para injeção
final supabaseClientProvider = Provider<SupabaseClient?>((ref) {
  try {
    return Supabase.instance.client;
  } catch (_) {
    return null;
  }
});
final authRemoteDataSourceProvider = Provider((ref) => AuthRemoteDataSource(ref.watch(supabaseClientProvider)));
final authRepositoryProvider = Provider<IAuthRepository>((ref) => AuthRepositoryImpl(ref.watch(authRemoteDataSourceProvider)));

class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;

  AuthState({this.user, this.isLoading = false, this.error});

  AuthState copyWith({User? user, bool? isLoading, String? error}) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class AuthController extends Notifier<AuthState> {
  IAuthRepository get _repository => ref.read(authRepositoryProvider);

  @override
  AuthState build() {
    return AuthState(user: _repository.currentUser);
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final user = await _repository.signIn(email, password);
      if (user != null) {
        state = state.copyWith(user: user, isLoading: false);
        return true;
      }
      state = state.copyWith(
        isLoading: false,
        error: 'E-mail ou senha incorretos. Verifique suas credenciais.',
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Falha na autenticação. Verifique seu e-mail e senha.',
      );
      return false;
    }
  }

  Future<void> logout() async {
    await _repository.signOut();
    state = AuthState(user: null);
  }
}

final authProvider = NotifierProvider<AuthController, AuthState>(() {
  return AuthController();
});

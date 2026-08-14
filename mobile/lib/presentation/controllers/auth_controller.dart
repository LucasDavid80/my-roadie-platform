// lib/presentation/controllers/auth_controller.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../domain/interfaces/i_auth_repository.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/datasources/remote_datasource.dart';

import '../../core/config/app_config.dart';

// Providers para injeção
final supabaseClientProvider = Provider<SupabaseClient?>((ref) {
  try {
    return Supabase.instance.client;
  } catch (_) {
    return SupabaseClient(
      AppConfig.supabaseUrl.isNotEmpty
          ? AppConfig.supabaseUrl
          : 'https://placeholder.supabase.co',
      AppConfig.supabaseAnonKey.isNotEmpty
          ? AppConfig.supabaseAnonKey
          : 'placeholder-anon-key',
      authOptions: const FlutterAuthClientOptions(
        authFlowType: AuthFlowType.implicit,
      ),
    );
  }
});

final remoteDataSourceProvider = Provider<RemoteDataSource>((ref) {
  return RemoteDataSource(
    client: http.Client(),
    supabase: ref.read(supabaseClientProvider),
  );
});

final authRemoteDataSourceProvider = Provider((ref) => AuthRemoteDataSource(
      ref.read(supabaseClientProvider),
      ref.read(remoteDataSourceProvider),
    ));
final authRepositoryProvider = Provider<IAuthRepository>((ref) => AuthRepositoryImpl(ref.read(authRemoteDataSourceProvider)));

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
      String errorMessage = 'Falha na autenticação. Verifique suas credenciais.';
      if (e is AuthException) {
        final msgLower = e.message.toLowerCase();
        if (msgLower.contains('invalid login credentials') ||
            msgLower.contains('invalid credentials')) {
          errorMessage = 'E-mail ou senha incorretos. Verifique suas credenciais.';
        } else if (msgLower.contains('email not confirmed')) {
          errorMessage = 'E-mail não confirmado. Por favor, verifique sua caixa de entrada.';
        } else {
          errorMessage = e.message;
        }
      } else if (e is UnauthorizedException) {
        errorMessage = e.message.isNotEmpty
            ? e.message
            : 'Sessão inválida ou expirada. Faça login novamente.';
      } else if (e is NetworkException) {
        errorMessage = e.message.isNotEmpty
            ? e.message
            : 'Erro de conexão com o servidor. Verifique sua internet.';
      } else if (e is ServerException) {
        errorMessage = e.message.isNotEmpty
            ? e.message
            : 'Erro no servidor. Tente novamente mais tarde.';
      } else {
        final errStr = e.toString().replaceFirst(RegExp(r'^Exception:\s*'), '');
        if (errStr.isNotEmpty) {
          errorMessage = errStr;
        }
      }

      state = state.copyWith(
        isLoading: false,
        error: errorMessage,
      );
      return false;
    }
  }

  Future<bool> signUp({
    required String email,
    required String password,
    String? name,
    String? role,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final user = await _repository.signUp(
        email,
        password,
        name: name,
        role: role,
      );
      state = state.copyWith(user: user, isLoading: false);
      return user != null;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      rethrow;
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

// lib/domain/interfaces/i_auth_repository.dart
import 'package:supabase_flutter/supabase_flutter.dart';

abstract class IAuthRepository {
  Future<User?> signIn(String email, String password);
  Future<User?> signUp(String email, String password);
  Future<void> signOut();
  User? get currentUser;
  String? get currentToken;
}

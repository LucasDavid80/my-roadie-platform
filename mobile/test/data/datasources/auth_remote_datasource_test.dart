import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:agenda_musical/core/config/app_config.dart';
import 'package:agenda_musical/data/datasources/auth_remote_datasource.dart';
import 'package:agenda_musical/data/datasources/remote_datasource.dart';
import 'package:agenda_musical/data/models/user_model.dart';

class MockSupabaseClient extends Mock implements SupabaseClient {}
class MockGoTrueClient extends Mock implements GoTrueClient {}
class MockRemoteDataSource extends Mock implements RemoteDataSource {}

void main() {
  late MockSupabaseClient mockSupabaseClient;
  late MockGoTrueClient mockGoTrueClient;
  late MockRemoteDataSource mockRemoteDataSource;
  late AuthRemoteDataSource authRemoteDataSource;

  setUp(() {
    mockSupabaseClient = MockSupabaseClient();
    mockGoTrueClient = MockGoTrueClient();
    mockRemoteDataSource = MockRemoteDataSource();

    when(() => mockSupabaseClient.auth).thenReturn(mockGoTrueClient);

    authRemoteDataSource = AuthRemoteDataSource(
      mockSupabaseClient,
      mockRemoteDataSource,
    );
  });

  group('AuthRemoteDataSource - signUp', () {
    final tUserModel = UserModel(
      id: 'backend-user-1',
      name: 'Lucas Teste',
      experience: 'PRO',
      phone: '11999999999',
      instagram: '@lucas',
      city: 'São Paulo',
      federativeUnit: 'SP',
      minCache: 500,
      youtubeLink: '',
      bio: '',
      instruments: const ['Guitar'],
      styles: const ['Rock'],
      isAvailable: true,
    );

    test('should return AuthResponse and call remoteDataSource in mock mode when AppConfig is not configured (positive)', () async {
      AppConfig.supabaseUrl = '';
      AppConfig.supabaseAnonKey = '';

      when(() => mockRemoteDataSource.createUser(
            email: any(named: 'email'),
            supabaseId: any(named: 'supabaseId'),
            name: any(named: 'name'),
            role: any(named: 'role'),
          )).thenAnswer((_) async => tUserModel);

      final result = await authRemoteDataSource.signUp(
        email: 'lucas@test.com',
        password: 'password123',
        name: 'Lucas Teste',
        role: 'MUSICIAN',
      );

      expect(result.user, isNotNull);
      expect(result.user?.userMetadata?['name'], 'Lucas Teste');
      expect(result.user?.userMetadata?['role'], 'MUSICIAN');

      verify(() => mockRemoteDataSource.createUser(
            email: 'lucas@test.com',
            supabaseId: any(named: 'supabaseId'),
            name: 'Lucas Teste',
            role: 'MUSICIAN',
          )).called(1);
    });

    test('should call Supabase auth.signUp and remoteDataSource.createUser when AppConfig is configured (positive)', () async {
      AppConfig.supabaseUrl = 'https://mock.supabase.co';
      AppConfig.supabaseAnonKey = 'mock-key';

      final mockUser = User(
        id: 'supa-user-123',
        appMetadata: {},
        userMetadata: {'name': 'Roadie Teste', 'role': 'ROADIE'},
        aud: 'authenticated',
        createdAt: DateTime.now().toIso8601String(),
      );

      when(() => mockGoTrueClient.signUp(
            email: any(named: 'email'),
            password: any(named: 'password'),
            data: any(named: 'data'),
          )).thenAnswer((_) async => AuthResponse(user: mockUser));

      when(() => mockRemoteDataSource.createUser(
            email: any(named: 'email'),
            supabaseId: any(named: 'supabaseId'),
            name: any(named: 'name'),
            role: any(named: 'role'),
          )).thenAnswer((_) async => tUserModel);

      final result = await authRemoteDataSource.signUp(
        email: 'roadie@test.com',
        password: 'password123',
        name: 'Roadie Teste',
        role: 'ROADIE',
      );

      expect(result.user?.id, 'supa-user-123');

      verify(() => mockGoTrueClient.signUp(
            email: 'roadie@test.com',
            password: 'password123',
            data: {'name': 'Roadie Teste', 'role': 'ROADIE'},
          )).called(1);

      verify(() => mockRemoteDataSource.createUser(
            email: 'roadie@test.com',
            supabaseId: 'supa-user-123',
            name: 'Roadie Teste',
            role: 'ROADIE',
          )).called(1);
    });

    test('should throw AuthException when Supabase auth.signUp fails (negative)', () async {
      AppConfig.supabaseUrl = 'https://mock.supabase.co';
      AppConfig.supabaseAnonKey = 'mock-key';

      when(() => mockGoTrueClient.signUp(
            email: any(named: 'email'),
            password: any(named: 'password'),
            data: any(named: 'data'),
          )).thenThrow(const AuthException('User already registered'));

      expect(
        () => authRemoteDataSource.signUp(
          email: 'duplicado@test.com',
          password: 'password123',
          name: 'Duplicado',
          role: 'MUSICIAN',
        ),
        throwsA(isA<AuthException>()),
      );

      verifyNever(() => mockRemoteDataSource.createUser(
            email: any(named: 'email'),
            supabaseId: any(named: 'supabaseId'),
            name: any(named: 'name'),
            role: any(named: 'role'),
          ));
    });

    test('should propagate error when remoteDataSource.createUser fails after Supabase signUp (negative)', () async {
      AppConfig.supabaseUrl = 'https://mock.supabase.co';
      AppConfig.supabaseAnonKey = 'mock-key';

      final mockUser = User(
        id: 'supa-user-456',
        appMetadata: {},
        userMetadata: {'name': 'Erro Backend', 'role': 'MUSICIAN'},
        aud: 'authenticated',
        createdAt: DateTime.now().toIso8601String(),
      );

      when(() => mockGoTrueClient.signUp(
            email: any(named: 'email'),
            password: any(named: 'password'),
            data: any(named: 'data'),
          )).thenAnswer((_) async => AuthResponse(user: mockUser));

      when(() => mockRemoteDataSource.createUser(
            email: any(named: 'email'),
            supabaseId: any(named: 'supabaseId'),
            name: any(named: 'name'),
            role: any(named: 'role'),
          )).thenThrow(Exception('Backend API Error 400'));

      expect(
        () => authRemoteDataSource.signUp(
          email: 'erro@test.com',
          password: 'password123',
          name: 'Erro Backend',
          role: 'MUSICIAN',
        ),
        throwsA(isA<Exception>()),
      );
    });
  });

  group('AuthRemoteDataSource - signIn', () {
    test('should call Supabase auth.signInWithPassword with email and password (positive)', () async {
      final mockUser = User(
        id: 'user-789',
        appMetadata: {},
        userMetadata: {},
        aud: 'authenticated',
        createdAt: DateTime.now().toIso8601String(),
      );

      when(() => mockGoTrueClient.signInWithPassword(
            email: 'user@test.com',
            password: 'password123',
          )).thenAnswer((_) async => AuthResponse(user: mockUser));

      final result = await authRemoteDataSource.signIn(
        email: 'user@test.com',
        password: 'password123',
      );

      expect(result.user?.id, 'user-789');
    });

    test('should throw AuthException on invalid credentials (negative)', () async {
      when(() => mockGoTrueClient.signInWithPassword(
            email: 'wrong@test.com',
            password: 'wrongpassword',
          )).thenThrow(const AuthException('Invalid login credentials'));

      expect(
        () => authRemoteDataSource.signIn(
          email: 'wrong@test.com',
          password: 'wrongpassword',
        ),
        throwsA(isA<AuthException>()),
      );
    });
  });
}

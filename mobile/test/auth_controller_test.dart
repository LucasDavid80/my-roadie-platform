import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide AuthState;
import 'package:agenda_musical/presentation/controllers/auth_controller.dart';
import 'package:agenda_musical/domain/interfaces/i_auth_repository.dart';
import 'package:agenda_musical/data/datasources/remote_datasource.dart';

class MockAuthRepository extends Mock implements IAuthRepository {}
class MockUser extends Mock implements User {}

void main() {
  late ProviderContainer container;
  late MockAuthRepository mockAuthRepository;
  late MockUser mockUser;

  setUp(() {
    mockAuthRepository = MockAuthRepository();
    mockUser = MockUser();

    when(() => mockUser.id).thenReturn('user-123');
    when(() => mockUser.email).thenReturn('test@roadie.com');
    when(() => mockAuthRepository.currentUser).thenReturn(null);

    container = ProviderContainer(
      overrides: [
        authRepositoryProvider.overrideWithValue(mockAuthRepository),
      ],
    );
  });

  tearDown(() {
    container.dispose();
  });

  group('AuthController - Casos Positivos', () {
    test('1. Login efetuado com sucesso atualiza AuthState com o usuario e limpa erros (Positivo 1)', () async {
      when(() => mockAuthRepository.signIn('test@roadie.com', '123456'))
          .thenAnswer((_) async => mockUser);

      final controller = container.read(authProvider.notifier);
      final result = await controller.login('test@roadie.com', '123456');

      expect(result, isTrue);
      final state = container.read(authProvider);
      expect(state.user, equals(mockUser));
      expect(state.isLoading, isFalse);
      expect(state.error, isNull);
    });

    test('2. Inicializacao do AuthController carrega a sessao persistida do repositório (Positivo 2)', () {
      when(() => mockAuthRepository.currentUser).thenReturn(mockUser);

      final newContainer = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(mockAuthRepository),
        ],
      );

      final state = newContainer.read(authProvider);
      expect(state.user, equals(mockUser));
      expect(state.error, isNull);

      newContainer.dispose();
    });

    test('3. SignUp efetuado com sucesso cria novo usuario e atualiza AuthState (Positivo 3)', () async {
      when(() => mockAuthRepository.signUp('new@roadie.com', '123456', name: 'Novo Musico', role: 'MUSICIAN'))
          .thenAnswer((_) async => mockUser);

      final controller = container.read(authProvider.notifier);
      final result = await controller.signUp(
        email: 'new@roadie.com',
        password: '123456',
        name: 'Novo Musico',
        role: 'MUSICIAN',
      );

      expect(result, isTrue);
      final state = container.read(authProvider);
      expect(state.user, equals(mockUser));
      expect(state.isLoading, isFalse);
    });
  });

  group('AuthController - Casos Negativos', () {
    test('1. Credenciais invalidas no AuthException disparam erro amigavel de credencial (Negativo 1)', () async {
      when(() => mockAuthRepository.signIn('wrong@roadie.com', 'badpass'))
          .thenThrow(const AuthException('Invalid login credentials'));

      final controller = container.read(authProvider.notifier);
      final result = await controller.login('wrong@roadie.com', 'badpass');

      expect(result, isFalse);
      final state = container.read(authProvider);
      expect(state.user, isNull);
      expect(state.isLoading, isFalse);
      expect(state.error, equals('E-mail ou senha incorretos. Verifique suas credenciais.'));
    });

    test('2. Retorno 401 UnauthorizedException define mensagem tratada de sessao/token expirado (Negativo 2)', () async {
      when(() => mockAuthRepository.signIn('expired@roadie.com', '123456'))
          .thenThrow(UnauthorizedException('TOKEN_EXPIRED: O token de autenticação expirou. Faça login novamente.'));

      final controller = container.read(authProvider.notifier);
      final result = await controller.login('expired@roadie.com', '123456');

      expect(result, isFalse);
      final state = container.read(authProvider);
      expect(state.user, isNull);
      expect(state.error, contains('TOKEN_EXPIRED'));
    });

    test('3. Falha de conexao NetworkException ou ServerException define mensagem amigavel sem crashar a UI (Negativo 3)', () async {
      when(() => mockAuthRepository.signIn('net@roadie.com', '123456'))
          .thenThrow(NetworkException('Erro de conexão com o servidor. Verifique sua internet.'));

      final controller = container.read(authProvider.notifier);
      final result = await controller.login('net@roadie.com', '123456');

      expect(result, isFalse);
      final state = container.read(authProvider);
      expect(state.user, isNull);
      expect(state.error, equals('Erro de conexão com o servidor. Verifique sua internet.'));
    });
  });
}

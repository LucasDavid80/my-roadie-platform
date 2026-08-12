import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide AuthState;
import 'package:agenda_musical/presentation/controllers/user_controller.dart';
import 'package:agenda_musical/presentation/controllers/auth_controller.dart';
import 'package:agenda_musical/domain/entities/user_entity.dart';
import 'package:agenda_musical/domain/interfaces/i_user_repository.dart';
import 'package:agenda_musical/data/datasources/remote_datasource.dart';


class MockUserRepository extends Mock implements IUserRepository {}
class MockUser extends Mock implements User {}

class FakeAuthController extends AuthController {
  final User? _user;
  FakeAuthController(this._user);

  @override
  AuthState build() {
    return AuthState(user: _user);
  }
}

void main() {
  late ProviderContainer container;
  late MockUserRepository mockUserRepository;
  late MockUser mockUser;

  setUpAll(() {
    registerFallbackValue(
      UserEntity(id: '1'),
    );
  });

  setUp(() async {
    mockUserRepository = MockUserRepository();
    mockUser = MockUser();
    when(() => mockUser.id).thenReturn('1');

    when(() => mockUserRepository.getUser('1')).thenAnswer((_) async => UserEntity(id: '1'));
    when(() => mockUserRepository.updateUser('1', any())).thenAnswer((invocation) async {
      return invocation.positionalArguments[1] as UserEntity;
    });

    container = ProviderContainer(
      overrides: [
        authProvider.overrideWith(() => FakeAuthController(mockUser)),
        userRepositoryProvider.overrideWithValue(mockUserRepository),
      ],
    );

    // Wait for the initial async fetchProfile to finish before tests start
    await container.read(userProvider.notifier).fetchProfile('1');
  });

  tearDown(() {
    container.dispose();
  });

  test('Should start with a default user', () {
    final user = container.read(userProvider);
    expect(user.id, '1');
    expect(user.instruments, isEmpty);
  });

  test('Should update user name', () {
    container.read(userProvider.notifier).updateName('New Name');
    final user = container.read(userProvider);
    expect(user.name, 'New Name');
  });

  test('Should update availability', () {
    container.read(userProvider.notifier).updateAvailability(true);
    expect(container.read(userProvider).isAvailable, isTrue);

    container.read(userProvider.notifier).updateAvailability(false);
    expect(container.read(userProvider).isAvailable, isFalse);
  });

  test('Should toggle instruments', () {
    final instrument = 'Guitar';
    
    // Add
    container.read(userProvider.notifier).toggleInstrument(instrument);
    expect(container.read(userProvider).instruments, contains(instrument));

    // Remove
    container.read(userProvider.notifier).toggleInstrument(instrument);
    expect(container.read(userProvider).instruments, isNot(contains(instrument)));
  });

  test('Should toggle musical styles', () {
    final style = 'Rock';
    
    // Add
    container.read(userProvider.notifier).toggleStyle(style);
    expect(container.read(userProvider).styles, contains(style));

    // Remove
    container.read(userProvider.notifier).toggleStyle(style);
    expect(container.read(userProvider).styles, isNot(contains(style)));
  });

  test('Should update multiple fields and keep consistency', () {
    final notifier = container.read(userProvider.notifier);
    
    notifier.updateCity('São Paulo');
    notifier.updateFederativeUnit('SP');
    notifier.updateMinimumFee(1000.0);
    
    final user = container.read(userProvider);
    expect(user.city, 'São Paulo');
    expect(user.federativeUnit, 'SP');
    expect(user.minCache, 1000.0);
    expect(user.id, '1'); // Should still be '1'
  });

  test('Should update experience, phone, instagram, video link and bio', () {
    final notifier = container.read(userProvider.notifier);

    notifier.updateExperience('PRO');
    notifier.updatePhone('11999999999');
    notifier.updateInstagram('@musico.teste');
    notifier.updateVideoLink('https://youtube.com/watch?v=123');
    notifier.updateBio('Bio do musico');

    final user = container.read(userProvider);
    expect(user.experience, 'PRO');
    expect(user.phone, '11999999999');
    expect(user.instagram, '@musico.teste');
    expect(user.youtubeLink, 'https://youtube.com/watch?v=123');
    expect(user.bio, 'Bio do musico');
  });

  group('saveProfile', () {
    test('Should return success result and update state when saveProfile succeeds', () async {
      container.read(userProvider.notifier).updateName('Updated Name');

      final result = await container.read(userProvider.notifier).saveProfile();

      expect(result.isSuccess, isTrue);
      expect(result.errorMessage, isNull);
      expect(container.read(userProvider).name, 'Updated Name');
      verify(() => mockUserRepository.updateUser('1', any())).called(1);
    });

    test('Should return failure result with exact message when repository throws UnauthorizedException', () async {
      when(() => mockUserRepository.updateUser('1', any()))
          .thenThrow(UnauthorizedException('Sessão expirada'));

      final result = await container.read(userProvider.notifier).saveProfile();

      expect(result.isSuccess, isFalse);
      expect(result.errorMessage, 'Sessão expirada');
    });

    test('Should return failure result with exact message when repository throws NetworkException', () async {
      when(() => mockUserRepository.updateUser('1', any()))
          .thenThrow(NetworkException('Erro de conexão com o servidor'));

      final result = await container.read(userProvider.notifier).saveProfile();

      expect(result.isSuccess, isFalse);
      expect(result.errorMessage, 'Erro de conexão com o servidor');
    });

    test('Should return failure result when user id is empty', () async {
      container.read(userProvider.notifier).state = UserEntity(id: '');

      final result = await container.read(userProvider.notifier).saveProfile();

      expect(result.isSuccess, isFalse);
      expect(result.errorMessage, 'ID do usuário não fornecido');
    });
  });

  group('fetchProfile', () {
    test('Should populate state with empty/default fields for new account without saved profile data', () async {
      final newProfile = UserEntity(
        id: 'user_new',
        name: '',
        phone: '',
        instruments: const [],
        styles: const [],
      );
      when(() => mockUserRepository.getUser('user_new')).thenAnswer((_) async => newProfile);

      await container.read(userProvider.notifier).fetchProfile('user_new');

      final user = container.read(userProvider);
      expect(user.id, 'user_new');
      expect(user.name, isEmpty);
      expect(user.phone, isEmpty);
      expect(user.instruments, isEmpty);
      expect(user.styles, isEmpty);
    });


    test('Should populate state with existing profile data when account has saved data', () async {
      final existingProfile = UserEntity(
        id: 'user_existing',
        name: 'Maria Silva',
        phone: '11988887777',
        city: 'Campinas',
        federativeUnit: 'SP',
        minCache: 800.0,
        instruments: const ['Vocal', 'Violão'],
        styles: const ['MPB', 'Samba'],
        isAvailable: true,
      );
      when(() => mockUserRepository.getUser('user_existing')).thenAnswer((_) async => existingProfile);

      await container.read(userProvider.notifier).fetchProfile('user_existing');

      final user = container.read(userProvider);
      expect(user.id, 'user_existing');
      expect(user.name, 'Maria Silva');
      expect(user.phone, '11988887777');
      expect(user.city, 'Campinas');
      expect(user.federativeUnit, 'SP');
      expect(user.minCache, 800.0);
      expect(user.instruments, equals(['Vocal', 'Violão']));
      expect(user.styles, equals(['MPB', 'Samba']));
      expect(user.isAvailable, isTrue);
    });

    test('Should catch exception gracefully when fetchProfile repository call fails', () async {
      when(() => mockUserRepository.getUser('user_error'))
          .thenThrow(ServerException('Erro no servidor'));

      await expectLater(
        container.read(userProvider.notifier).fetchProfile('user_error', true),
        completes,
      );
    });

    test('Should ignore redundant consecutive calls to fetchProfile for the same user ID (deduplication T3.1)', () async {
      final dedupeProfile = UserEntity(id: 'user_dedupe', name: 'João Dedupe');
      when(() => mockUserRepository.getUser('user_dedupe')).thenAnswer((_) async => dedupeProfile);

      final notifier = container.read(userProvider.notifier);

      final future1 = notifier.fetchProfile('user_dedupe');
      final future2 = notifier.fetchProfile('user_dedupe');
      final future3 = notifier.fetchProfile('user_dedupe');

      await Future.wait([future1, future2, future3]);

      await notifier.fetchProfile('user_dedupe');

      verify(() => mockUserRepository.getUser('user_dedupe')).called(1);
    });
  });
}



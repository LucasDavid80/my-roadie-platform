import 'package:agenda_musical/core/constants/app_colors.dart';
import 'package:agenda_musical/domain/entities/event_entity.dart';
import 'package:agenda_musical/domain/entities/user_entity.dart';
import 'package:agenda_musical/domain/interfaces/i_agenda_repository.dart';
import 'package:agenda_musical/domain/interfaces/i_auth_repository.dart';
import 'package:agenda_musical/domain/interfaces/i_user_repository.dart';
import 'package:agenda_musical/presentation/controllers/agenda_controller.dart';
import 'package:agenda_musical/presentation/controllers/auth_controller.dart';
import 'package:agenda_musical/presentation/controllers/user_controller.dart';
import 'package:agenda_musical/presentation/screens/auth/login_page.dart';
import 'package:agenda_musical/presentation/screens/person/person_screen.dart';
import 'package:agenda_musical/presentation/screens/principal/principal_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mocktail/mocktail.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide AuthState;

import 'test_seed_data.dart';

// Mocks do Mocktail para casos onde mocks diretos sao preferidos
class MockAuthRepository extends Mock implements IAuthRepository {}

class MockUserRepository extends Mock implements IUserRepository {}

class MockAgendaRepository extends Mock implements IAgendaRepository {}

class MockSupabaseUser extends Mock implements User {}

/// Repositório falso de autenticação em memória para testes herméticos.
class FakeAuthRepository implements IAuthRepository {
  User? _currentUser;
  String? _currentToken;
  final String validEmail;
  final String validPassword;
  final User defaultUser;

  FakeAuthRepository({
    this.validEmail = TestSeedData.testUserEmail,
    this.validPassword = TestSeedData.testUserPassword,
    User? initialUser,
    User? defaultUser,
  })  : _currentUser = initialUser,
        defaultUser = defaultUser ?? _createDefaultMockUser();

  static User _createDefaultMockUser() {
    final mockUser = MockSupabaseUser();
    when(() => mockUser.id).thenReturn(TestSeedData.testUserId);
    when(() => mockUser.email).thenReturn(TestSeedData.testUserEmail);
    return mockUser;
  }

  @override
  User? get currentUser => _currentUser;

  @override
  String? get currentToken => _currentToken;

  @override
  Future<User?> signIn(String email, String password) async {
    if (email == validEmail && password == validPassword) {
      _currentUser = defaultUser;
      _currentToken = 'fake_jwt_token_for_e2e';
      return _currentUser;
    }
    throw const AuthException('Invalid login credentials');
  }

  @override
  Future<User?> signUp(
    String email,
    String password, {
    String? name,
    String? role,
  }) async {
    _currentUser = defaultUser;
    _currentToken = 'fake_jwt_token_for_e2e';
    return _currentUser;
  }

  @override
  Future<void> signOut() async {
    _currentUser = null;
    _currentToken = null;
  }
}

/// Repositório falso de usuário em memória para testes herméticos.
class FakeUserRepository implements IUserRepository {
  UserEntity user;

  FakeUserRepository({UserEntity? initialUser})
      : user = initialUser ?? TestSeedData.defaultUserEntity;

  @override
  Future<UserEntity> getUser(String id) async {
    return user;
  }

  @override
  Future<UserEntity> updateUser(String id, UserEntity updatedUser) async {
    user = updatedUser;
    return user;
  }
}

/// Repositório falso de agenda em memória para testes herméticos.
class FakeAgendaRepository implements IAgendaRepository {
  final List<EventEntity> events;

  FakeAgendaRepository({List<EventEntity>? initialEvents})
      : events = initialEvents != null
            ? List<EventEntity>.from(initialEvents)
            : [];

  @override
  Future<List<EventEntity>> getEvents() async {
    return List<EventEntity>.unmodifiable(events);
  }

  @override
  Future<EventEntity> saveEvent(EventEntity event) async {
    final eventToSave = event.id.isEmpty
        ? EventEntity(
            id: 'event_${DateTime.now().millisecondsSinceEpoch}',
            title: event.title,
            type: event.type,
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location,
            fee: event.fee,
            notes: event.notes,
            bandId: event.bandId,
          )
        : event;

    final index = events.indexWhere((e) => e.id == eventToSave.id);
    if (index != -1) {
      events[index] = eventToSave;
    } else {
      events.add(eventToSave);
    }
    return eventToSave;
  }

  @override
  Future<void> deleteEvent(String id) async {
    events.removeWhere((e) => e.id == id);
  }
}

/// Contexto de teste hermético agrupando repositórios em memória.
class HermeticTestContext {
  final FakeAuthRepository authRepository;
  final FakeUserRepository userRepository;
  final FakeAgendaRepository agendaRepository;

  HermeticTestContext({
    required this.authRepository,
    required this.userRepository,
    required this.agendaRepository,
  });

  Widget buildApp({
    String initialLocation = '/login',
    List<dynamic> additionalOverrides = const [],
  }) {
    return createTestAppWidget(
      authRepository: authRepository,
      userRepository: userRepository,
      agendaRepository: agendaRepository,
      initialLocation: initialLocation,
      additionalOverrides: additionalOverrides,
    );
  }
}

/// Cria um contexto hermético configurado com sementes padrão.
HermeticTestContext createHermeticTestContext({
  User? initialAuthUser,
  UserEntity? initialUserProfile,
  List<EventEntity>? initialEvents,
}) {
  final authRepo = FakeAuthRepository(initialUser: initialAuthUser);
  final userRepo = FakeUserRepository(initialUser: initialUserProfile);
  final agendaRepo = FakeAgendaRepository(initialEvents: initialEvents);

  return HermeticTestContext(
    authRepository: authRepo,
    userRepository: userRepo,
    agendaRepository: agendaRepo,
  );
}

/// Cria o widget raiz encapsulado para testes E2E.
Widget createTestAppWidget({
  IAuthRepository? authRepository,
  IUserRepository? userRepository,
  IAgendaRepository? agendaRepository,
  List<dynamic> additionalOverrides = const [],
  String initialLocation = '/login',
  GoRouter? customRouter,
}) {
  final effectiveRouter = customRouter ??
      GoRouter(
        initialLocation: initialLocation,
        routes: <RouteBase>[
          GoRoute(
            path: '/login',
            builder: (context, state) => const LoginPage(),
          ),
          GoRoute(
            path: '/',
            name: 'home',
            builder: (BuildContext context, GoRouterState state) {
              return const PrincipalScreen();
            },
            routes: [
              GoRoute(
                path: 'profile',
                name: 'profile',
                builder: (BuildContext context, GoRouterState state) {
                  return const PersonScreen();
                },
              ),
            ],
          ),
        ],
      );

  return ProviderScope(
    overrides: [
      if (authRepository != null)
        authRepositoryProvider.overrideWithValue(authRepository),
      if (userRepository != null)
        userRepositoryProvider.overrideWithValue(userRepository),
      if (agendaRepository != null)
        agendaRepositoryProvider.overrideWithValue(agendaRepository),
      ...additionalOverrides,
    ],
    child: MaterialApp.router(
      title: 'MyRoadie',
      debugShowCheckedModeBanner: false,
      routerConfig: effectiveRouter,
      locale: const Locale('pt', 'BR'),
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('pt', 'BR')],
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          primary: AppColors.primary,
          secondary: AppColors.secondary,
          surface: AppColors.background,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.background,
          surfaceTintColor: Colors.transparent,
          centerTitle: false,
          elevation: 0,
          iconTheme: IconThemeData(color: AppColors.secondary),
          titleTextStyle: TextStyle(
            color: AppColors.secondary,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.background,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 14,
          ),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.primary, width: 2),
          ),
          labelStyle: const TextStyle(color: AppColors.textDark),
          hintStyle: const TextStyle(color: AppColors.textGrey, fontSize: 14),
        ),
      ),
    ),
  );
}

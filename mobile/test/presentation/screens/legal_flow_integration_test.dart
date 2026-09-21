import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:mocktail/mocktail.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide AuthState;
import 'package:intl/date_symbol_data_local.dart';

import 'package:agenda_musical/domain/entities/user_entity.dart';
import 'package:agenda_musical/domain/interfaces/i_agenda_repository.dart';
import 'package:agenda_musical/domain/interfaces/i_auth_repository.dart';
import 'package:agenda_musical/domain/interfaces/i_user_repository.dart';
import 'package:agenda_musical/domain/interfaces/i_legal_repository.dart';

import 'package:agenda_musical/presentation/controllers/agenda_controller.dart';
import 'package:agenda_musical/presentation/controllers/auth_controller.dart';
import 'package:agenda_musical/presentation/controllers/user_controller.dart';
import 'package:agenda_musical/core/guards/legal_guard.dart';

import 'package:agenda_musical/presentation/screens/auth/login_page.dart';
import 'package:agenda_musical/presentation/screens/principal/principal_screen.dart';

class MockAuthRepository extends Mock implements IAuthRepository {}
class MockUserRepository extends Mock implements IUserRepository {}
class MockAgendaRepository extends Mock implements IAgendaRepository {}
class MockLegalRepository extends Mock implements ILegalRepository {}
class MockUser extends Mock implements User {}

void main() {
  late MockAuthRepository mockAuthRepository;
  late MockUserRepository mockUserRepository;
  late MockAgendaRepository mockAgendaRepository;
  late MockLegalRepository mockLegalRepository;
  late MockUser mockUser;

  setUpAll(() async {
    await initializeDateFormatting('pt_BR', null);
    registerFallbackValue(UserEntity(id: '1'));
  });

  setUp(() {
    mockAuthRepository = MockAuthRepository();
    mockUserRepository = MockUserRepository();
    mockAgendaRepository = MockAgendaRepository();
    mockLegalRepository = MockLegalRepository();
    mockUser = MockUser();

    when(() => mockUser.id).thenReturn('user_123');
    when(() => mockUser.email).thenReturn('musico@teste.com');

    when(() => mockAuthRepository.currentUser).thenReturn(null);
    when(() => mockAuthRepository.signIn('musico@teste.com', '123456'))
        .thenAnswer((_) async => mockUser);

    when(() => mockAgendaRepository.getEvents()).thenAnswer((_) async => []);

    when(() => mockLegalRepository.getCurrentTermsVersion()).thenAnswer((_) async => 'v1.0.0');
    when(() => mockLegalRepository.acceptTerms(any())).thenAnswer((_) async => Future.value());
  });

  Widget createTestWidget({required String? termsAcceptedVersion}) {
    when(() => mockUserRepository.getUser(any())).thenAnswer(
      (_) async => UserEntity(
        id: 'user_123',
        name: 'Músico de Teste',
        termsAcceptedVersion: termsAcceptedVersion,
      ),
    );

    final router = GoRouter(
      initialLocation: '/login',
      routes: [
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginPage(),
        ),
        GoRoute(
          path: '/',
          name: 'home',
          builder: (context, state) => const LegalGuard(child: PrincipalScreen()),
        ),
      ],
    );

    return ProviderScope(
      overrides: [
        authRepositoryProvider.overrideWithValue(mockAuthRepository),
        userRepositoryProvider.overrideWithValue(mockUserRepository),
        agendaRepositoryProvider.overrideWithValue(mockAgendaRepository),
        legalRepositoryProvider.overrideWithValue(mockLegalRepository),
      ],
      child: MaterialApp.router(
        routerConfig: router,
      ),
    );
  }

  testWidgets(
      '1 - Melhor caso: Usuário já tem os termos atualizados aceitos, modal NÃO aparece',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(800, 1000);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(createTestWidget(termsAcceptedVersion: 'v1.0.0'));
    await tester.pumpAndSettle();

    // Login
    final tapToStart = find.text('Toque para entrar');
    await tester.tap(tapToStart);
    await tester.pumpAndSettle();

    final textFields = find.byType(TextFormField);
    await tester.enterText(textFields.at(0), 'musico@teste.com');
    await tester.enterText(textFields.at(1), '123456');

    final loginButton = find.text('ENTRAR');
    await tester.ensureVisible(loginButton);
    await tester.tap(loginButton);
    await tester.pumpAndSettle();

    // Verifica que está na PrincipalScreen
    expect(find.byType(PrincipalScreen), findsOneWidget);

    // Modal de termos NÃO deve aparecer
    expect(find.text('Atualização dos Termos'), findsNothing);
  });

  testWidgets(
      '2 - Caso de bloqueio: Usuário com termos desatualizados, modal aparece e requer aceite',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(800, 1000);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    // Versão anterior ou nula
    await tester.pumpWidget(createTestWidget(termsAcceptedVersion: null));
    await tester.pumpAndSettle();

    // Login
    final tapToStart = find.text('Toque para entrar');
    await tester.tap(tapToStart);
    await tester.pumpAndSettle();

    final textFields = find.byType(TextFormField);
    await tester.enterText(textFields.at(0), 'musico@teste.com');
    await tester.enterText(textFields.at(1), '123456');

    final loginButton = find.text('ENTRAR');
    await tester.ensureVisible(loginButton);
    await tester.tap(loginButton);
    await tester.pumpAndSettle();

    // Verifica que o Modal APARECEU
    expect(find.text('Atualização dos Termos'), findsOneWidget);
    
    // Toca em "Li e aceito os termos"
    final acceptButton = find.text('Li e aceito os termos');
    expect(acceptButton, findsOneWidget);
    
    // Altera o mock para que a próxima chamada de getUser retorne o usuário já atualizado
    when(() => mockUserRepository.getUser(any())).thenAnswer(
      (_) async => UserEntity(
        id: 'user_123',
        name: 'Músico de Teste',
        termsAcceptedVersion: 'v1.0.0', // Atualizado
      ),
    );

    await tester.tap(acceptButton);
    await tester.pumpAndSettle();

    // Verifica que a API acceptTerms foi chamada
    verify(() => mockLegalRepository.acceptTerms('v1.0.0')).called(1);

    // Verifica que o modal fechou e a Dashboard está visível
    expect(find.text('Atualização dos Termos'), findsNothing);
    expect(find.byType(PrincipalScreen), findsOneWidget);
  });
}

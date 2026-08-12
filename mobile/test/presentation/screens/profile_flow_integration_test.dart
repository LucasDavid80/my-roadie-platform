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
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mocktail/mocktail.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide AuthState;

class MockAuthRepository extends Mock implements IAuthRepository {}
class MockUserRepository extends Mock implements IUserRepository {}
class MockAgendaRepository extends Mock implements IAgendaRepository {}
class MockUser extends Mock implements User {}

void main() {
  late MockAuthRepository mockAuthRepository;
  late MockUserRepository mockUserRepository;
  late MockAgendaRepository mockAgendaRepository;
  late MockUser mockUser;

  setUpAll(() async {
    await initializeDateFormatting('pt_BR', null);
    registerFallbackValue(UserEntity(id: '1'));
    registerFallbackValue(
      EventEntity(
        id: '1',
        title: 'Test Event',
        type: 'Show',
        date: DateTime(2026, 7, 16),
        startTime: '10:00',
        endTime: '12:00',
        location: 'Test Location',
        fee: 100.0,
      ),
    );
  });

  setUp(() {
    mockAuthRepository = MockAuthRepository();
    mockUserRepository = MockUserRepository();
    mockAgendaRepository = MockAgendaRepository();
    mockUser = MockUser();

    when(() => mockUser.id).thenReturn('user_123');
    when(() => mockUser.email).thenReturn('musico@teste.com');

    when(() => mockAuthRepository.currentUser).thenReturn(null);
    when(() => mockAuthRepository.signIn('musico@teste.com', '123456'))
        .thenAnswer((_) async => mockUser);

    when(() => mockAgendaRepository.getEvents()).thenAnswer((_) async => []);

    when(() => mockUserRepository.getUser(any())).thenAnswer(
      (_) async => UserEntity(
        id: 'user_123',
        name: 'Músico de Teste',
        phone: '11988887777',
        city: 'São Paulo',
        federativeUnit: 'SP',
        instruments: const ['Guitarra'],
        styles: const ['Rock'],
      ),
    );

    when(() => mockUserRepository.updateUser(any(), any())).thenAnswer(
      (invocation) async => invocation.positionalArguments[1] as UserEntity,
    );
  });

  Widget createTestWidget() {
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
          builder: (context, state) => const PrincipalScreen(),
          routes: [
            GoRoute(
              path: 'profile',
              name: 'profile',
              builder: (context, state) => const PersonScreen(),
            ),
          ],
        ),
      ],
    );

    return ProviderScope(
      overrides: [
        authRepositoryProvider.overrideWithValue(mockAuthRepository),
        userRepositoryProvider.overrideWithValue(mockUserRepository),
        agendaRepositoryProvider.overrideWithValue(mockAgendaRepository),
      ],
      child: MaterialApp.router(
        routerConfig: router,
      ),
    );
  }

  testWidgets(
      '1 - Usuário faz login, navega até a página de perfil e verifica pelo menos 3 campos preenchidos',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(800, 1000);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    // 1. Verifica se está na página de login e toca para abrir o formulário
    expect(find.byType(LoginPage), findsOneWidget);
    final tapToStart = find.text('Toque para entrar');
    expect(tapToStart, findsOneWidget);
    await tester.tap(tapToStart);
    await tester.pumpAndSettle();

    // 2. Preenche os campos de e-mail e senha
    final textFields = find.byType(TextFormField);
    await tester.enterText(textFields.at(0), 'musico@teste.com');
    await tester.enterText(textFields.at(1), '123456');

    // 3. Rola e clica no botão de entrar
    final loginButton = find.text('ENTRAR');
    await tester.ensureVisible(loginButton);
    await tester.tap(loginButton);
    await tester.pumpAndSettle();

    // 4. Verifica se navegou para a página inicial (PrincipalScreen)
    expect(find.byType(PrincipalScreen), findsOneWidget);

    // 5. Clica no ícone de perfil na AppBar para navegar para a tela de perfil
    final profileIcon = find.byIcon(Icons.person);
    expect(profileIcon, findsOneWidget);
    await tester.tap(profileIcon);
    await tester.pumpAndSettle();

    // 6. Verifica se está na tela de perfil (PersonScreen)
    expect(find.byType(PersonScreen), findsOneWidget);

    // 7. Valida que pelo menos 3 campos preenchidos aparecem corretamente na tela
    expect(find.text('Músico de Teste'), findsOneWidget); // Campo 1: Nome
    expect(find.text('11988887777'), findsOneWidget);     // Campo 2: Telefone
    expect(find.text('São Paulo'), findsOneWidget);        // Campo 3: Cidade
  });

  testWidgets(
      '2 - Usuário faz login, vai até a página de perfil com 3 campos preenchidos, altera um campo e salva com sucesso',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(800, 1000);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    // 1. Toca para abrir formulário de login e faz login
    final tapToStart = find.text('Toque para entrar');
    expect(tapToStart, findsOneWidget);
    await tester.tap(tapToStart);
    await tester.pumpAndSettle();

    final textFields = find.byType(TextFormField);
    await tester.enterText(textFields.at(0), 'musico@teste.com');
    await tester.enterText(textFields.at(1), '123456');

    final loginButton = find.text('ENTRAR');
    await tester.ensureVisible(loginButton);
    await tester.tap(loginButton);
    await tester.pumpAndSettle();

    // 2. Navegar para o perfil
    final profileIcon = find.byIcon(Icons.person);
    expect(profileIcon, findsOneWidget);
    await tester.tap(profileIcon);
    await tester.pumpAndSettle();

    // 3. Confirmar que os 3 campos iniciais estão preenchidos
    expect(find.text('Músico de Teste'), findsOneWidget);
    expect(find.text('11988887777'), findsOneWidget);
    expect(find.text('São Paulo'), findsOneWidget);

    // 4. Alterar um dos campos (Cidade de 'São Paulo' para 'Campinas')
    final cityField = find.widgetWithText(TextFormField, 'São Paulo');
    expect(cityField, findsOneWidget);
    await tester.ensureVisible(cityField);
    await tester.enterText(cityField, 'Campinas');
    await tester.pumpAndSettle();

    // 5. Clicar no botão 'Salvar Perfil'
    final saveButton = find.text('Salvar Perfil');
    await tester.ensureVisible(saveButton);
    await tester.tap(saveButton);
    await tester.pumpAndSettle();

    // 6. Verificar exibição de SnackBar de sucesso
    expect(find.text('Perfil salvo com sucesso!'), findsOneWidget);

    // 7. Verificar que o repositório updateUser foi chamado com o campo Cidade alterado para 'Campinas'
    verify(
      () => mockUserRepository.updateUser(
        'user_123',
        any(
          that: isA<UserEntity>().having((u) => u.city, 'city', 'Campinas'),
        ),
      ),
    ).called(1);

    // 8. Verificar que o novo valor 'Campinas' permanece renderizado na tela
    expect(find.text('Campinas'), findsOneWidget);
  });

}


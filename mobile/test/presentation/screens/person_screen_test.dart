import 'package:agenda_musical/domain/entities/user_entity.dart';
import 'package:agenda_musical/domain/interfaces/i_user_repository.dart';
import 'package:agenda_musical/presentation/controllers/auth_controller.dart';
import 'package:agenda_musical/presentation/controllers/user_controller.dart';
import 'package:agenda_musical/presentation/screens/person/person_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide AuthState;

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
  late MockUserRepository mockUserRepository;
  late MockUser mockUser;

  setUpAll(() {
    registerFallbackValue(
      UserEntity(id: '1'),
    );
  });

  setUp(() {
    mockUserRepository = MockUserRepository();
    mockUser = MockUser();
    when(() => mockUser.id).thenReturn('1');

    when(() => mockUserRepository.getUser('1')).thenAnswer(
      (_) async => UserEntity(
        id: '1',
        name: 'Músico de Teste',
        experience: '3',
        phone: '11988887777',
        instagram: '@musico_teste',
        city: 'São Paulo',
        federativeUnit: 'SP',
        minCache: 450.0,
        youtubeLink: 'https://youtube.com/watch?v=123',
        bio: 'Biografia de teste do músico',
        instruments: const ['Guitarra'],
        styles: const ['Rock'],
        isAvailable: true,
      ),
    );

    when(() => mockUserRepository.updateUser(any(), any())).thenAnswer(
      (invocation) async => invocation.positionalArguments[1] as UserEntity,
    );
  });

  Widget createTestWidget() {
    return ProviderScope(
      overrides: [
        authProvider.overrideWith(() => FakeAuthController(mockUser)),
        userRepositoryProvider.overrideWithValue(mockUserRepository),
      ],
      child: const MaterialApp(
        home: PersonScreen(),
      ),
    );
  }

  testWidgets('Should render PersonScreen completely under ProviderScope without red screen or errors',
      (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    expect(find.byType(PersonScreen), findsOneWidget);
    expect(find.text('Foto de Perfil'), findsOneWidget);
    expect(find.text('Informações Básicas'), findsOneWidget);
    expect(find.text('Guitarra'), findsOneWidget);
    expect(find.text('Rock'), findsOneWidget);
    expect(find.text('Salvar Perfil'), findsOneWidget);
  });

  testWidgets('Should interact with fields and display SnackBar when tapping Salvar Perfil',
      (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    final saveButton = find.text('Salvar Perfil');
    expect(saveButton, findsOneWidget);

    await tester.ensureVisible(saveButton);
    await tester.tap(saveButton);
    await tester.pumpAndSettle();

    expect(find.text('Perfil salvo com sucesso!'), findsOneWidget);
    verify(() => mockUserRepository.updateUser('1', any())).called(1);
  });

  testWidgets('Should toggle instrument and style chips when tapped without throwing exceptions',
      (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    final violaoChip = find.text('Violão');
    expect(violaoChip, findsOneWidget);

    await tester.ensureVisible(violaoChip);
    await tester.tap(violaoChip);
    await tester.pumpAndSettle();

    final mpbChip = find.text('MPB');
    expect(mpbChip, findsOneWidget);

    await tester.ensureVisible(mpbChip);
    await tester.tap(mpbChip);
    await tester.pumpAndSettle();
  });
}

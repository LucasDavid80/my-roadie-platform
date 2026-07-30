import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:agenda_musical/presentation/screens/auth/widgets/signup_bottom_sheet.dart';
import 'package:agenda_musical/presentation/controllers/auth_controller.dart';
import 'package:agenda_musical/domain/interfaces/i_auth_repository.dart';

class MockAuthRepository extends Mock implements IAuthRepository {}

void main() {
  late MockAuthRepository mockAuthRepository;

  setUp(() {
    mockAuthRepository = MockAuthRepository();
    when(() => mockAuthRepository.currentUser).thenReturn(null);
  });

  Widget createTestWidget() {
    return ProviderScope(
      overrides: [
        authRepositoryProvider.overrideWithValue(mockAuthRepository),
      ],
      child: const MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: SignupBottomSheet(),
          ),
        ),
      ),
    );
  }

  group('SignupBottomSheet - Render (positive)', () {
    testWidgets('Should render all registration fields and button', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.text('Crie sua conta'), findsOneWidget);
      expect(find.text('Junte-se ao MyRoadie hoje!'), findsOneWidget);
      expect(find.text('Nome Completo'), findsOneWidget);
      expect(find.text('E-mail'), findsOneWidget);
      expect(find.text('Perfil / Cargo'), findsOneWidget);
      expect(find.text('Senha'), findsOneWidget);
      expect(find.text('Confirmar Senha'), findsOneWidget);
      expect(find.text('CADASTRAR'), findsOneWidget);
    });

    testWidgets('Should submit form successfully when fields are filled properly', (WidgetTester tester) async {
      final mockUser = User(
        id: 'user-123',
        appMetadata: {},
        userMetadata: {'name': 'Lucas Silva', 'role': 'ROADIE'},
        aud: 'authenticated',
        createdAt: DateTime.now().toIso8601String(),
      );

      when(() => mockAuthRepository.signUp(
            any(),
            any(),
            name: any(named: 'name'),
            role: any(named: 'role'),
          )).thenAnswer((_) async => mockUser);

      await tester.pumpWidget(createTestWidget());

      // Preenche os campos
      final textFields = find.byType(TextField);
      await tester.enterText(textFields.at(0), 'Lucas Silva');
      await tester.enterText(textFields.at(1), 'lucas@test.com');
      await tester.enterText(textFields.at(2), '123456');
      await tester.enterText(textFields.at(3), '123456');

      // Clica em cadastrar
      await tester.tap(find.text('CADASTRAR'));
      await tester.pumpAndSettle();

      verify(() => mockAuthRepository.signUp(
            'lucas@test.com',
            '123456',
            name: 'Lucas Silva',
            role: 'MUSICIAN',
          )).called(1);
    });
  });

  group('SignupBottomSheet - Validation & Error Handling (negative)', () {
    testWidgets('Should show error message when required fields are empty', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());

      await tester.tap(find.text('CADASTRAR'));
      await tester.pump();

      expect(find.text('Por favor, preencha todos os campos obrigatórios'), findsOneWidget);
    });

    testWidgets('Should show error when email is invalid', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());

      final textFields = find.byType(TextField);
      await tester.enterText(textFields.at(0), 'Lucas Silva');
      await tester.enterText(textFields.at(1), 'emailinvalido');
      await tester.enterText(textFields.at(2), '123456');
      await tester.enterText(textFields.at(3), '123456');

      await tester.tap(find.text('CADASTRAR'));
      await tester.pump();

      expect(find.text('Por favor, informe um e-mail válido'), findsOneWidget);
    });

    testWidgets('Should show error when password is less than 6 characters', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());

      final textFields = find.byType(TextField);
      await tester.enterText(textFields.at(0), 'Lucas Silva');
      await tester.enterText(textFields.at(1), 'lucas@test.com');
      await tester.enterText(textFields.at(2), '123');
      await tester.enterText(textFields.at(3), '123');

      await tester.tap(find.text('CADASTRAR'));
      await tester.pump();

      expect(find.text('A senha deve ter pelo menos 6 caracteres'), findsOneWidget);
    });

    testWidgets('Should show error when passwords do not match', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());

      final textFields = find.byType(TextField);
      await tester.enterText(textFields.at(0), 'Lucas Silva');
      await tester.enterText(textFields.at(1), 'lucas@test.com');
      await tester.enterText(textFields.at(2), '123456');
      await tester.enterText(textFields.at(3), '654321');

      await tester.tap(find.text('CADASTRAR'));
      await tester.pump();

      expect(find.text('As senhas não coincidem'), findsOneWidget);
    });

    testWidgets('Should display error banner when repository throws exception', (WidgetTester tester) async {
      when(() => mockAuthRepository.signUp(
            any(),
            any(),
            name: any(named: 'name'),
            role: any(named: 'role'),
          )).thenThrow(const AuthException('User already registered'));

      await tester.pumpWidget(createTestWidget());

      final textFields = find.byType(TextField);
      await tester.enterText(textFields.at(0), 'Lucas Silva');
      await tester.enterText(textFields.at(1), 'existente@test.com');
      await tester.enterText(textFields.at(2), '123456');
      await tester.enterText(textFields.at(3), '123456');

      await tester.tap(find.text('CADASTRAR'));
      await tester.pumpAndSettle();

      expect(find.text('E-mail já cadastrado'), findsOneWidget);
    });
  });
}

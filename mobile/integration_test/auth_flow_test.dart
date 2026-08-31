import 'package:agenda_musical/presentation/screens/principal/principal_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'test_helpers/e2e_binding.dart';
import 'test_helpers/test_app_wrapper.dart';
import 'test_helpers/test_seed_data.dart';

void main() {
  E2EBindingHelper.ensureInitialized();

  setUpAll(() async {
    await initializeDateFormatting('pt_BR', null);
  });

  group('Fluxo E2E - Autenticação', () {
    testWidgets(
      'deve realizar login com sucesso e navegar para a tela principal (T2.1)',
      (WidgetTester tester) async {
        E2EBindingHelper.setupTestViewport(tester);

        final context = createHermeticTestContext();
        final app = context.buildApp(initialLocation: '/login');

        await tester.pumpWidget(app);
        await tester.pump(const Duration(milliseconds: 600));
        await tester.pumpAndSettle();

        // 1. Localiza o botão "Toque para entrar" e toca para abrir o formulário
        final startButtonFinder =
            find.byKey(const ValueKey('login_start_button'));
        expect(startButtonFinder, findsOneWidget);
        await tester.tap(startButtonFinder);
        await tester.pumpAndSettle();

        // 2. Preenche os campos de e-mail e senha com credenciais válidas
        final emailFinder = find.byKey(const ValueKey('login_email_field'));
        final passwordFinder =
            find.byKey(const ValueKey('login_password_field'));
        expect(emailFinder, findsOneWidget);
        expect(passwordFinder, findsOneWidget);

        await tester.enterText(emailFinder, TestSeedData.testUserEmail);
        await tester.enterText(passwordFinder, TestSeedData.testUserPassword);
        await tester.pumpAndSettle();

        // 3. Clica no botão "ENTRAR"
        final submitFinder = find.byKey(const ValueKey('login_submit_button'));
        expect(submitFinder, findsOneWidget);
        await tester.tap(submitFinder);
        await tester.pumpAndSettle();

        // 4. Valida que navegou para a PrincipalScreen com os elementos esperados
        expect(find.byType(PrincipalScreen), findsOneWidget);
        expect(
          find.byKey(const ValueKey('calendar_appbar_button')),
          findsOneWidget,
        );
        expect(
          find.byKey(const ValueKey('profile_appbar_button')),
          findsOneWidget,
        );
        expect(
          find.byKey(const ValueKey('agenda_add_button')),
          findsOneWidget,
        );
      },
    );
  });
}

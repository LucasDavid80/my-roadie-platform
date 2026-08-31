import 'package:agenda_musical/presentation/screens/person/person_screen.dart';
import 'package:agenda_musical/presentation/screens/principal/principal_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mocktail/mocktail.dart';

import 'test_helpers/e2e_binding.dart';
import 'test_helpers/test_app_wrapper.dart';
import 'test_helpers/test_seed_data.dart';

void main() {
  E2EBindingHelper.ensureInitialized();

  setUpAll(() async {
    await initializeDateFormatting('pt_BR', null);
  });

  group('Fluxo E2E - Perfil', () {
    testWidgets(
      'deve navegar da tela principal para o perfil e inspecionar os dados carregados (T3.1)',
      (WidgetTester tester) async {
        E2EBindingHelper.setupTestViewport(tester);

        final mockUser = MockSupabaseUser();
        when(() => mockUser.id).thenReturn(TestSeedData.testUserId);
        when(() => mockUser.email).thenReturn(TestSeedData.testUserEmail);

        final context = createHermeticTestContext(
          initialAuthUser: mockUser,
          initialUserProfile: TestSeedData.defaultUserEntity,
        );
        final app = context.buildApp(initialLocation: '/');

        await tester.pumpWidget(app);
        await tester.pump(const Duration(milliseconds: 600));
        await tester.pumpAndSettle();

        // 1. Valida que a aplicação inicia na tela principal
        expect(find.byType(PrincipalScreen), findsOneWidget);

        // 2. Toca no ícone de perfil na AppBar para navegar até a rota /profile
        final profileButtonFinder =
            find.byKey(const ValueKey('profile_appbar_button'));
        expect(profileButtonFinder, findsOneWidget);
        await tester.tap(profileButtonFinder);
        await tester.pumpAndSettle();

        // 3. Valida que navegou para a PersonScreen
        expect(find.byType(PersonScreen), findsOneWidget);

        // 4. Inspeciona a presença dos campos preenchidos com os dados do perfil
        expect(find.byKey(const ValueKey('profile_name_field')), findsOneWidget);
        expect(find.text(TestSeedData.testUserName), findsOneWidget);

        expect(
          find.byKey(const ValueKey('profile_phone_field')),
          findsOneWidget,
        );
        expect(find.text(TestSeedData.testUserPhone), findsOneWidget);

        expect(find.byKey(const ValueKey('profile_city_field')), findsOneWidget);
        expect(find.text(TestSeedData.testUserCity), findsOneWidget);

        expect(
          find.byKey(const ValueKey('profile_state_field')),
          findsOneWidget,
        );
        expect(find.text(TestSeedData.testUserUF), findsOneWidget);
      },
    );
  });
}

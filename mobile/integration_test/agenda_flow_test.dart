import 'package:agenda_musical/presentation/screens/principal/principal_screen.dart';
import 'package:agenda_musical/presentation/screens/principal/widgets/commitment_card.dart';
import 'package:agenda_musical/presentation/widgets/new_appointment_widget.dart';
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

  group('Fluxo E2E - Agenda', () {
    testWidgets(
      'deve criar um novo compromisso e exibi-lo na listagem da agenda (T4.1)',
      (WidgetTester tester) async {
        E2EBindingHelper.setupTestViewport(tester);

        final mockUser = MockSupabaseUser();
        when(() => mockUser.id).thenReturn(TestSeedData.testUserId);
        when(() => mockUser.email).thenReturn(TestSeedData.testUserEmail);

        final context = createHermeticTestContext(
          initialAuthUser: mockUser,
          initialUserProfile: TestSeedData.defaultUserEntity,
          initialEvents: [],
        );
        final app = context.buildApp(initialLocation: '/');

        await tester.pumpWidget(app);
        await tester.pump(const Duration(milliseconds: 600));
        await tester.pumpAndSettle();

        // 1. Valida que a aplicação inicia na tela principal e a lista está vazia
        expect(find.byType(PrincipalScreen), findsOneWidget);
        expect(find.text('Nenhum compromisso para este dia.'), findsOneWidget);

        // 2. Toca no FloatingActionButton para abrir o modal de novo compromisso
        final addButtonFinder = find.byKey(const ValueKey('agenda_add_button'));
        expect(addButtonFinder, findsOneWidget);
        await tester.tap(addButtonFinder);
        await tester.pumpAndSettle();

        // 3. Valida que o modal NewAppointmentWidget foi aberto
        expect(find.byType(NewAppointmentWidget), findsOneWidget);
        expect(find.text('Novo Compromisso'), findsOneWidget);

        // 4. Preenche o formulário: Título
        final titleField = find.byKey(
          const ValueKey('appointment_title_field'),
        );
        expect(titleField, findsOneWidget);
        await tester.enterText(titleField, TestSeedData.testEventTitle);
        await tester.pumpAndSettle();

        // 5. Seleciona a data no DatePicker
        final dateSelector = find.text('Selecionar');
        expect(dateSelector, findsOneWidget);
        await tester.tap(dateSelector);
        await tester.pumpAndSettle();

        final okButton = find.text('OK');
        expect(okButton, findsOneWidget);
        await tester.tap(okButton);
        await tester.pumpAndSettle();

        // 6. Preenche o Local e o Cachê
        final locationField = find.byKey(
          const ValueKey('appointment_location_field'),
        );
        final feeField = find.byKey(const ValueKey('appointment_fee_field'));
        expect(locationField, findsOneWidget);
        expect(feeField, findsOneWidget);

        await tester.enterText(locationField, TestSeedData.testEventLocation);
        await tester.enterText(feeField, '3500,00');
        await tester.pumpAndSettle();

        // 7. Clica no botão de criar compromisso
        final confirmButton = find.byKey(
          const ValueKey('appointment_confirm_button'),
        );
        expect(confirmButton, findsOneWidget);
        await tester.tap(confirmButton);
        await tester.pumpAndSettle();

        // 8. Valida que o modal fechou e o novo card está renderizado na lista da agenda
        expect(find.byType(NewAppointmentWidget), findsNothing);
        expect(find.byType(CommitmentCard), findsOneWidget);
        expect(find.text(TestSeedData.testEventTitle), findsOneWidget);
        expect(find.text(TestSeedData.testEventLocation), findsOneWidget);
        expect(find.text('R\$ 3500.00'), findsOneWidget);
      },
    );

    testWidgets(
      'deve editar um compromisso existente e atualizar a listagem da agenda (T4.2)',
      (WidgetTester tester) async {
        E2EBindingHelper.setupTestViewport(tester);

        final mockUser = MockSupabaseUser();
        when(() => mockUser.id).thenReturn(TestSeedData.testUserId);
        when(() => mockUser.email).thenReturn(TestSeedData.testUserEmail);

        final context = createHermeticTestContext(
          initialAuthUser: mockUser,
          initialUserProfile: TestSeedData.defaultUserEntity,
          initialEvents: [TestSeedData.defaultEventEntity],
        );
        final app = context.buildApp(initialLocation: '/');

        await tester.pumpWidget(app);
        await tester.pump(const Duration(milliseconds: 600));
        await tester.pumpAndSettle();

        // 1. Valida que a aplicação inicia na tela principal com o card existente
        expect(find.byType(PrincipalScreen), findsOneWidget);
        expect(find.byType(CommitmentCard), findsOneWidget);
        expect(find.text(TestSeedData.testEventTitle), findsOneWidget);
        expect(find.text('R\$ 3500.00'), findsOneWidget);

        // 2. Clica no botão de edição no CommitmentCard
        final editButtonFinder = find.byKey(
          const ValueKey('commitment_card_edit_button'),
        );
        expect(editButtonFinder, findsOneWidget);
        await tester.tap(editButtonFinder);
        await tester.pumpAndSettle();

        // 3. Valida reabertura do modal no modo de edição
        expect(find.byType(NewAppointmentWidget), findsOneWidget);
        expect(find.text('Editar Compromisso'), findsOneWidget);

        // 4. Altera o título e o cachê
        final titleField = find.byKey(
          const ValueKey('appointment_title_field'),
        );
        final feeField = find.byKey(const ValueKey('appointment_fee_field'));
        expect(titleField, findsOneWidget);
        expect(feeField, findsOneWidget);

        await tester.enterText(titleField, TestSeedData.updatedEventTitle);
        await tester.enterText(feeField, '4000,00');
        await tester.pumpAndSettle();

        // 5. Clica no botão de salvar/confirmar alterações
        final confirmButton = find.byKey(
          const ValueKey('appointment_confirm_button'),
        );
        expect(confirmButton, findsOneWidget);
        await tester.tap(confirmButton);
        await tester.pumpAndSettle();

        // 6. Valida que o modal fechou e a listagem reflete os novos dados
        expect(find.byType(NewAppointmentWidget), findsNothing);
        expect(find.byType(CommitmentCard), findsOneWidget);
        expect(find.text(TestSeedData.updatedEventTitle), findsOneWidget);
        expect(find.text('R\$ 4000.00'), findsOneWidget);
        expect(find.text(TestSeedData.testEventTitle), findsNothing);
      },
    );
  });
}

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:agenda_musical/presentation/widgets/legal_consent_modal.dart';

void main() {
  testWidgets('LegalConsentModal deve renderizar os textos e botão (caso de sucesso de renderização)', (WidgetTester tester) async {
    // act
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: LegalConsentModal(
            onAccept: () {},
          ),
        ),
      ),
    );

    // assert
    expect(find.text('Atualização dos Termos'), findsOneWidget);
    expect(find.text('Li e aceito os termos'), findsOneWidget);
  });

  testWidgets('LegalConsentModal deve disparar onAccept ao tocar no botão (caso de sucesso de callback)', (WidgetTester tester) async {
    bool onAcceptCalled = false;

    // act
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: LegalConsentModal(
            onAccept: () {
              onAcceptCalled = true;
            },
          ),
        ),
      ),
    );

    await tester.tap(find.text('Li e aceito os termos'));
    await tester.pump();

    // assert
    expect(onAcceptCalled, isTrue);
  });

  testWidgets('LegalConsentModal deve mostrar CircularProgressIndicator e desabilitar botão quando isLoading for true (caso de borda)', (WidgetTester tester) async {
    // act
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: LegalConsentModal(
            isLoading: true,
            onAccept: () {},
          ),
        ),
      ),
    );

    // assert
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(find.text('Li e aceito os termos'), findsNothing);

    // O botão deve estar desabilitado
    final button = tester.widget<ElevatedButton>(find.byType(ElevatedButton));
    expect(button.enabled, isFalse);
  });
}

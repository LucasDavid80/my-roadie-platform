import 'package:agenda_musical/presentation/screens/auth/widgets/login_form.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget createTestWidget() {
    return const MaterialApp(
      home: Scaffold(
        body: SingleChildScrollView(
          child: LoginForm(),
        ),
      ),
    );
  }

  testWidgets('Should show error messages when fields are empty', (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget());

    // Encontra o botão de entrar e clica
    final loginButton = find.text('ENTRAR');
    await tester.tap(loginButton);
    await tester.pump(); // Reconstrói o widget com os erros

    // Verifica se as mensagens de erro de validação aparecem
    expect(find.text('E-mail inválido'), findsOneWidget);
    expect(find.text('Senha muito curta'), findsOneWidget);
  });

  testWidgets('Should show error for invalid email', (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget());

    // Digita um e-mail sem @
    await tester.enterText(find.byType(TextFormField).first, 'emailinvalido');
    await tester.enterText(find.byType(TextFormField).last, '123456');
    
    await tester.tap(find.text('ENTRAR'));
    await tester.pump();

    expect(find.text('E-mail inválido'), findsOneWidget);
    expect(find.text('Senha muito curta'), findsNothing);
  });

  testWidgets('Should show error for short password', (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget());

    // Digita e-mail válido mas senha curta
    await tester.enterText(find.byType(TextFormField).first, 'teste@roadie.com');
    await tester.enterText(find.byType(TextFormField).last, '123');
    
    await tester.tap(find.text('ENTRAR'));
    await tester.pump();

    expect(find.text('E-mail inválido'), findsNothing);
    expect(find.text('Senha muito curta'), findsOneWidget);
  });
}

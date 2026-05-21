import 'package:agenda_musical/presentation/widgets/custom_text_field.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget createTestWidget({
    required String label,
    required String hint,
    bool isRequired = false,
    Function(String)? onChanged,
  }) {
    return MaterialApp(
      home: Scaffold(
        body: CustomTextField(
          label: label,
          hint: hint,
          isRequired: isRequired,
          onChanged: onChanged,
        ),
      ),
    );
  }

  testWidgets('Should display label and hint', (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget(
      label: 'Nome Artístico',
      hint: 'Digite seu nome...',
    ));

    expect(find.text('Nome Artístico'), findsOneWidget);
    expect(find.text('Digite seu nome...'), findsOneWidget);
  });

  testWidgets('Should show asterisk when field is required', (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget(
      label: 'Campo Obrigatório',
      hint: '',
      isRequired: true,
    ));

    // O CustomTextField concatena o '*' ao label no texto
    expect(find.text('Campo Obrigatório *'), findsOneWidget);
  });

  testWidgets('Should call onChanged when typing', (WidgetTester tester) async {
    String typedValue = '';
    await tester.pumpWidget(createTestWidget(
      label: 'Teste',
      hint: 'Hint',
      onChanged: (val) => typedValue = val,
    ));

    await tester.enterText(find.byType(TextField), 'Gemini');
    expect(typedValue, 'Gemini');
  });
}

import 'package:agenda_musical/presentation/screens/principal/widgets/infos_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget createTestWidget({
    required int total,
    required int completed,
    required int shows,
    required double revenue,
  }) {
    return MaterialApp(
      home: Scaffold(
        body: InfosWidget(
          compromissosTotal: total,
          compromissosConcluidos: completed,
          shows: shows,
          faturamento: revenue,
        ),
      ),
    );
  }

  testWidgets('Should display correct values in all cards', (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget(
      total: 10,
      completed: 4,
      shows: 5,
      revenue: 2500.0,
    ));

    // Verifica se os valores passados aparecem
    expect(find.text('10'), findsOneWidget); // Total do Mês
    expect(find.text('5'), findsOneWidget);  // Shows/Mês
    expect(find.text('2500.0'), findsOneWidget); // Cachê/Mês
  });

  testWidgets('Should calculate and display upcoming appointments correctly', (WidgetTester tester) async {
    // Total (10) - Concluídos (4) = Próximos (6)
    await tester.pumpWidget(createTestWidget(
      total: 10,
      completed: 4,
      shows: 5,
      revenue: 2500.0,
    ));

    // Verifica se o valor calculado (6) aparece no card de "Próximos"
    expect(find.text('6'), findsOneWidget);
  });

  testWidgets('Should show 0 for upcoming if all are completed', (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget(
      total: 5,
      completed: 5,
      shows: 2,
      revenue: 1000.0,
    ));

    // Próximos deve ser 0
    expect(find.text('0'), findsOneWidget);
  });
}

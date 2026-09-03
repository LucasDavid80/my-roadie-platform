import 'package:agenda_musical/presentation/screens/principal/widgets/infos_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/intl.dart';

void main() {
  final currencyFormatter = NumberFormat.currency(
    locale: 'pt_BR',
    symbol: r'R$',
  );

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
    expect(find.text(currencyFormatter.format(2500.0)), findsOneWidget); // Cachê/Mês formatado
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

  testWidgets('Should display formatted zero currency when revenue is 0', (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget(
      total: 5,
      completed: 2,
      shows: 2,
      revenue: 0.0,
    ));

    expect(find.text(currencyFormatter.format(0.0)), findsOneWidget);
  });

  testWidgets('Should render high revenue within FittedBox without overflow', (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget(
      total: 10,
      completed: 2,
      shows: 3,
      revenue: 150000.0,
    ));

    expect(find.text(currencyFormatter.format(150000.0)), findsOneWidget);
    final fittedBoxes = tester.widgetList<FittedBox>(find.byType(FittedBox));
    expect(fittedBoxes, isNotEmpty);
    expect(
      fittedBoxes.any((box) => box.fit == BoxFit.scaleDown && box.alignment == Alignment.centerLeft),
      isTrue,
    );
  });
}

import 'package:agenda_musical/presentation/screens/person/widgets/availability_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget createTestWidget({
    required bool isAvailable,
    required Function(bool?) onChanged,
  }) {
    return MaterialApp(
      home: Scaffold(
        body: AvailabilityWidget(
          isAvailable: isAvailable,
          onChanged: onChanged,
        ),
      ),
    );
  }

  testWidgets('Should display correct initial state', (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget(
      isAvailable: true,
      onChanged: (_) {},
    ));

    final checkbox = tester.widget<Checkbox>(find.byType(Checkbox));
    expect(checkbox.value, isTrue);
    expect(find.text('Estou disponível para contratação'), findsOneWidget);
  });

  testWidgets('Should call onChanged when checkbox is tapped', (WidgetTester tester) async {
    bool? newValue;
    await tester.pumpWidget(createTestWidget(
      isAvailable: false,
      onChanged: (val) => newValue = val,
    ));

    await tester.tap(find.byType(Checkbox));
    await tester.pump();

    expect(newValue, isTrue);
  });
}

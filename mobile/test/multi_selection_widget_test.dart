import 'package:agenda_musical/presentation/screens/person/widgets/multi_selection_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:agenda_musical/core/constants/app_colors.dart';

void main() {
  Widget createTestWidget({
    required List<String> options,
    required List<String> selectedItems,
    required Function(String) onToggle,
  }) {
    return MaterialApp(
      home: Scaffold(
        body: MultiSelectionWidget(
          title: 'Teste',
          options: options,
          selectedItems: selectedItems,
          onToggle: onToggle,
        ),
      ),
    );
  }

  testWidgets('Should render all options', (WidgetTester tester) async {
    final options = ['Opção 1', 'Opção 2', 'Opção 3'];
    await tester.pumpWidget(createTestWidget(
      options: options,
      selectedItems: [],
      onToggle: (_) {},
    ));

    for (final option in options) {
      expect(find.text(option), findsOneWidget);
    }
  });

  testWidgets('Should show check icon only for selected items', (WidgetTester tester) async {
    final options = ['Rock', 'Jazz', 'Samba'];
    final selected = ['Rock'];

    await tester.pumpWidget(createTestWidget(
      options: options,
      selectedItems: selected,
      onToggle: (_) {},
    ));

    // 'Rock' deve ter o ícone de check
    expect(find.byIcon(Icons.check_circle_outline), findsOneWidget);
    
    // Verificando se o container do 'Rock' tem a cor primária (selecionado)
    final rockDecoration = tester.widget<AnimatedContainer>(
      find.ancestor(of: find.text('Rock'), matching: find.byType(AnimatedContainer))
    ).decoration as BoxDecoration;
    
    expect(rockDecoration.color, AppColors.primary);

    // Verificando se o container do 'Jazz' tem a cor de borda (não selecionado)
    final jazzDecoration = tester.widget<AnimatedContainer>(
      find.ancestor(of: find.text('Jazz'), matching: find.byType(AnimatedContainer))
    ).decoration as BoxDecoration;
    
    expect(jazzDecoration.color, AppColors.inputBorder);
  });

  testWidgets('Should call onToggle when a chip is tapped', (WidgetTester tester) async {
    String tappedItem = '';
    final options = ['Guitarra', 'Baixo'];

    await tester.pumpWidget(createTestWidget(
      options: options,
      selectedItems: [],
      onToggle: (val) => tappedItem = val,
    ));

    await tester.tap(find.text('Baixo'));
    await tester.pump();

    expect(tappedItem, 'Baixo');
  });
}

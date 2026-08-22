import 'package:agenda_musical/domain/entities/event_entity.dart';
import 'package:agenda_musical/presentation/screens/principal/widgets/commitment_card.dart';
import 'package:agenda_musical/presentation/widgets/new_appointment_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final testEvent = EventEntity(
    id: '1',
    title: 'Show de Rock',
    type: 'Show',
    date: DateTime(2026, 5, 21),
    startTime: '20:00',
    endTime: '22:00',
    location: 'Bar do Rock',
    fee: 500.0,
    notes: 'Levar cabos',
  );

  Widget createTestWidget({required EventEntity event, required Future<void> Function(EventEntity) onConfirm}) {
    return MaterialApp(
      home: Scaffold(
        body: CommitmentCard(
          event: event,
          onConfirm: onConfirm,
        ),
      ),
    );
  }

  testWidgets('Should display event information correctly', (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget(
      event: testEvent,
      onConfirm: (e) async {},
    ));

    expect(find.text('Show de Rock'), findsOneWidget);
    expect(find.text('20:00 - 22:00'), findsOneWidget);
    expect(find.text('Bar do Rock'), findsOneWidget);
    expect(find.text('R\$ 500.00'), findsOneWidget);
    expect(find.text('Show'), findsOneWidget); // Type tag
  });

  testWidgets('Should open edit modal when edit button is tapped', (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget(
      event: testEvent,
      onConfirm: (e) async {},
    ));

    // Encontra o botão de editar (ícone edit_outlined)
    final editButton = find.byIcon(Icons.edit_outlined);
    await tester.tap(editButton);
    await tester.pump(); // Inicia a animação do diálogo
    await tester.pump(const Duration(milliseconds: 500)); // Espera o diálogo abrir

    // Verifica se o widget de edição apareceu
    expect(find.byType(NewAppointmentWidget), findsOneWidget);
    expect(find.text('Editar Compromisso'), findsOneWidget);
  });

  testWidgets('Should show confirmation dialog when delete button is tapped', (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget(
      event: testEvent,
      onConfirm: (e) async {},
    ));

    final deleteButton = find.byIcon(Icons.delete_outline);
    await tester.tap(deleteButton);
    await tester.pumpAndSettle();

    expect(find.text('Excluir Compromisso'), findsOneWidget);
    expect(find.text('Tem certeza de que deseja excluir este compromisso? Esta ação não pode ser desfeita.'), findsOneWidget);
    expect(find.text('Cancelar'), findsOneWidget);
    expect(find.text('Excluir'), findsOneWidget);
  });

  testWidgets('Should dismiss confirmation dialog and not call onDelete when Cancelar is tapped', (WidgetTester tester) async {
    bool deleteCalled = false;
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: CommitmentCard(
          event: testEvent,
          onConfirm: (e) async {},
          onDelete: (id) async {
            deleteCalled = true;
          },
        ),
      ),
    ));

    final deleteButton = find.byIcon(Icons.delete_outline);
    await tester.tap(deleteButton);
    await tester.pumpAndSettle();

    await tester.tap(find.text('Cancelar'));
    await tester.pumpAndSettle();

    expect(deleteCalled, isFalse);
    expect(find.text('Excluir Compromisso'), findsNothing);
  });

  testWidgets('Should call onDelete and show success SnackBar when Excluir is confirmed', (WidgetTester tester) async {
    String? deletedId;
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: CommitmentCard(
          event: testEvent,
          onConfirm: (e) async {},
          onDelete: (id) async {
            deletedId = id;
          },
        ),
      ),
    ));

    final deleteButton = find.byIcon(Icons.delete_outline);
    await tester.tap(deleteButton);
    await tester.pumpAndSettle();

    await tester.tap(find.text('Excluir'));
    await tester.pumpAndSettle();

    expect(deletedId, '1');
    expect(find.text('Compromisso excluído com sucesso!'), findsOneWidget);
  });

  testWidgets('Should show error SnackBar when onDelete throws exception', (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: CommitmentCard(
          event: testEvent,
          onConfirm: (e) async {},
          onDelete: (id) async {
            throw Exception('Falha ao excluir');
          },
        ),
      ),
    ));

    final deleteButton = find.byIcon(Icons.delete_outline);
    await tester.tap(deleteButton);
    await tester.pumpAndSettle();

    await tester.tap(find.text('Excluir'));
    await tester.pumpAndSettle();

    expect(find.textContaining('Erro ao excluir compromisso'), findsOneWidget);
  });
}

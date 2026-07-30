import 'package:agenda_musical/domain/entities/event_entity.dart';
import 'package:agenda_musical/presentation/widgets/new_appointment_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget createTestWidget({
    required Future<void> Function(EventEntity) onConfirm,
    EventEntity? event,
  }) {
    return MaterialApp(
      home: Scaffold(
        body: NewAppointmentWidget(
          onConfirm: onConfirm,
          event: event,
        ),
      ),
    );
  }

  testWidgets('Should show validation error if title is empty on confirm', (WidgetTester tester) async {
    bool confirmed = false;
    await tester.pumpWidget(createTestWidget(onConfirm: (e) async { confirmed = true; }));

    // Clica no botão de confirmar (Criar Compromisso)
    final confirmButton = find.text('Criar Compromisso');
    await tester.tap(confirmButton, warnIfMissed: false);
    await tester.pump();

    // Como o título está vazio, o onConfirm não deve ser chamado
    expect(confirmed, isFalse);
  });

  testWidgets('Should call onConfirm and close modal on confirm when editing (T2.1)', (WidgetTester tester) async {
    bool confirmed = false;
    EventEntity? submittedEvent;

    final existingEvent = EventEntity(
      id: '123',
      title: 'Show Antigo',
      type: 'Ensaio',
      date: DateTime(2026, 5, 25),
      startTime: '14:00',
      endTime: '16:00',
      location: 'Estúdio X',
      fee: 200.0,
      notes: 'Levar cabos',
    );

    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: Builder(
          builder: (context) => ElevatedButton(
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => Dialog(
                  child: NewAppointmentWidget(
                    event: existingEvent,
                    onConfirm: (e) async {
                      confirmed = true;
                      submittedEvent = e;
                    },
                  ),
                ),
              );
            },
            child: const Text('Open Modal'),
          ),
        ),
      ),
    ));

    // Opens dialog
    await tester.tap(find.text('Open Modal'));
    await tester.pumpAndSettle();

    expect(find.byType(NewAppointmentWidget), findsOneWidget);

    // Click 'Salvar Alterações'
    final saveButton = find.text('Salvar Alterações');
    await tester.ensureVisible(saveButton);
    await tester.tap(saveButton);
    await tester.pumpAndSettle();

    expect(confirmed, isTrue);
    expect(submittedEvent?.id, '123');
    expect(find.byType(NewAppointmentWidget), findsNothing);
  });

  testWidgets('Should load existing event data when editing', (WidgetTester tester) async {
    final existingEvent = EventEntity(
      id: '123',
      title: 'Show Antigo',
      type: 'Ensaio',
      date: DateTime(2026, 5, 25),
      startTime: '14:00',
      endTime: '16:00',
      location: 'Estúdio X',
      fee: 200.0,
      notes: 'Levar cabos',
    );

    await tester.pumpWidget(createTestWidget(
      onConfirm: (e) async {},
      event: existingEvent,
    ));

    // Verifica se os campos foram preenchidos corretamente
    expect(find.text('Show Antigo'), findsOneWidget);
    expect(find.text('Estúdio X'), findsOneWidget);
    expect(find.text('200,00'), findsOneWidget);
    expect(find.text('Levar cabos'), findsOneWidget);
    expect(find.text('Ensaio'), findsOneWidget);
  });
}

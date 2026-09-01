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
    await tester.ensureVisible(confirmButton);
    await tester.tap(confirmButton);
    await tester.pumpAndSettle();

    // Como o título está vazio, o onConfirm não deve ser chamado e o SnackBar deve ser exibido
    expect(confirmed, isFalse);
    expect(find.text('Por favor, preencha o título e selecione uma data.'), findsOneWidget);
  });

  testWidgets('Should show error SnackBar and keep form open with input data when onConfirm throws exception', (WidgetTester tester) async {
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
                      throw Exception('Banda não encontrada');
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

    // O SnackBar com o erro deve ser exibido, o modal permanece aberto e os dados persistem no formulário
    expect(find.textContaining('Banda não encontrada'), findsOneWidget);
    expect(find.byType(NewAppointmentWidget), findsOneWidget);
    expect(find.text('Show Antigo'), findsOneWidget);
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

  testWidgets('Should load existing event data when editing (type Show with fee)', (WidgetTester tester) async {
    final existingEvent = EventEntity(
      id: '123',
      title: 'Show Antigo',
      type: 'Show',
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
    expect(find.text('Show'), findsOneWidget);
  });

  testWidgets('Should hide fee input when event type is Ensaio or Reuniao (T3.4 dynamic fee)', (WidgetTester tester) async {
    final existingEvent = EventEntity(
      id: '124',
      title: 'Ensaio Geral',
      type: 'Ensaio',
      date: DateTime(2026, 5, 25),
      startTime: '14:00',
      endTime: '16:00',
      location: 'Estúdio X',
      fee: 0.0,
      notes: 'Levar partituras',
    );

    await tester.pumpWidget(createTestWidget(
      onConfirm: (e) async {},
      event: existingEvent,
    ));

    expect(find.text('Ensaio Geral'), findsOneWidget);
    expect(find.text('Estúdio X'), findsOneWidget);
    expect(find.text('Ensaio'), findsOneWidget);
    // Campo Cachê não deve ser renderizado para Ensaio
    expect(find.text('Cachê'), findsNothing);
  });

  testWidgets('Should reset fee to 0.0 when changing type from Show to Ensaio (T3.4 dynamic fee switch)', (WidgetTester tester) async {
    EventEntity? submittedEvent;

    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: NewAppointmentWidget(
          onConfirm: (e) async {
            submittedEvent = e;
          },
        ),
      ),
    ));

    // Preenche título e data
    await tester.enterText(find.widgetWithText(TextField, 'Ex: Pagode na Adega'), 'Ensaio de Domingo');
    await tester.tap(find.text('Selecionar'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('OK'));
    await tester.pumpAndSettle();

    // Digita um cachê enquanto está como 'Show'
    await tester.enterText(find.widgetWithText(TextField, '0,00'), '500,00');

    // Altera o tipo para 'Ensaio'
    await tester.tap(find.text('Show'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Ensaio').last);
    await tester.pumpAndSettle();

    // Campo Cachê deve sumir da árvore de widgets
    expect(find.text('Cachê'), findsNothing);

    // Submete o formulário
    final submitButton = find.text('Criar Compromisso');
    await tester.ensureVisible(submitButton);
    await tester.tap(submitButton);
    await tester.pumpAndSettle();

    expect(submittedEvent, isNotNull);
    expect(submittedEvent!.type, 'Ensaio');
    expect(submittedEvent!.fee, 0.0);
  });

  testWidgets('Should create new event with full data, call onConfirm and close modal (T3.1 positive)', (WidgetTester tester) async {
    bool confirmed = false;
    EventEntity? createdEvent;

    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: Builder(
          builder: (context) => ElevatedButton(
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => Dialog(
                  child: NewAppointmentWidget(
                    onConfirm: (e) async {
                      confirmed = true;
                      createdEvent = e;
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
    expect(find.text('Novo Compromisso'), findsOneWidget);

    // Fill Title
    await tester.enterText(find.widgetWithText(TextField, 'Ex: Pagode na Adega'), 'Show no Parque');

    // Pick Date
    await tester.tap(find.text('Selecionar'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('OK'));
    await tester.pumpAndSettle();

    // Fill Location, Fee and Notes
    await tester.enterText(find.widgetWithText(TextField, 'Endereço...'), 'Parque Ibirapuera');
    await tester.enterText(find.widgetWithText(TextField, '0,00'), '1500,50');
    await tester.enterText(find.widgetWithText(TextField, 'Anotações, setlist...'), 'Setlist de Rock');

    // Click 'Criar Compromisso'
    final createButton = find.text('Criar Compromisso');
    await tester.ensureVisible(createButton);
    await tester.tap(createButton);
    await tester.pumpAndSettle();

    expect(confirmed, isTrue);
    expect(createdEvent, isNotNull);
    expect(createdEvent!.title, 'Show no Parque');
    expect(createdEvent!.location, 'Parque Ibirapuera');
    expect(createdEvent!.fee, 1500.50);
    expect(createdEvent!.notes, 'Setlist de Rock');
    expect(createdEvent!.type, 'Show');
    expect(createdEvent!.id.isNotEmpty, isTrue);
    expect(find.byType(NewAppointmentWidget), findsNothing);
  });

  testWidgets('Should show validation error if title is filled but date is not selected (T3.1 validation)', (WidgetTester tester) async {
    bool confirmed = false;

    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: NewAppointmentWidget(
          onConfirm: (e) async {
            confirmed = true;
          },
        ),
      ),
    ));

    // Fill Title only (no date selected)
    await tester.enterText(find.widgetWithText(TextField, 'Ex: Pagode na Adega'), 'Show Sem Data');

    final createButton = find.text('Criar Compromisso');
    await tester.ensureVisible(createButton);
    await tester.tap(createButton);
    await tester.pumpAndSettle();

    expect(confirmed, isFalse);
    expect(find.text('Por favor, preencha o título e selecione uma data.'), findsOneWidget);
  });

  testWidgets('Should show error SnackBar and preserve form input when creating new appointment fails (T3.1 error)', (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: Builder(
          builder: (context) => ElevatedButton(
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => Dialog(
                  child: NewAppointmentWidget(
                    onConfirm: (e) async {
                      throw Exception('Falha de conexão com o servidor');
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

    // Fill fields
    await tester.enterText(find.widgetWithText(TextField, 'Ex: Pagode na Adega'), 'Show Festival');
    await tester.tap(find.text('Selecionar'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('OK'));
    await tester.pumpAndSettle();

    await tester.enterText(find.widgetWithText(TextField, 'Endereço...'), 'Arena Show');
    await tester.enterText(find.widgetWithText(TextField, '0,00'), '800,00');

    // Click 'Criar Compromisso'
    final createButton = find.text('Criar Compromisso');
    await tester.ensureVisible(createButton);
    await tester.tap(createButton);
    await tester.pumpAndSettle();

    // Verify error message and form state
    expect(find.textContaining('Falha de conexão com o servidor'), findsOneWidget);
    expect(find.byType(NewAppointmentWidget), findsOneWidget);
    expect(find.text('Show Festival'), findsOneWidget);
    expect(find.text('Arena Show'), findsOneWidget);
  });

  testWidgets('Should close modal when clicking Cancelar button (T4.1)', (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: Builder(
          builder: (context) => ElevatedButton(
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => Dialog(
                  child: NewAppointmentWidget(
                    onConfirm: (e) async {},
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

    final cancelButton = find.widgetWithText(OutlinedButton, 'Cancelar');
    await tester.ensureVisible(cancelButton);
    await tester.tap(cancelButton);
    await tester.pumpAndSettle();

    expect(find.byType(NewAppointmentWidget), findsNothing);
  });

  testWidgets('Should handle high fee values (e.g. 12500,00) and parse accurately on submission (T4.1)', (WidgetTester tester) async {
    EventEntity? createdEvent;

    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: NewAppointmentWidget(
          onConfirm: (e) async {
            createdEvent = e;
          },
        ),
      ),
    ));

    // Fill Title
    await tester.enterText(find.byKey(const ValueKey('appointment_title_field')), 'Mega Show Festival');

    // Pick Date
    await tester.tap(find.text('Selecionar'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('OK'));
    await tester.pumpAndSettle();

    // Enter high fee value
    final feeFinder = find.byKey(const ValueKey('appointment_fee_field'));
    await tester.ensureVisible(feeFinder);
    await tester.enterText(feeFinder, '12500,00');

    // Verify prefix R$ is shown and input text is 12500,00
    expect(find.text('R\$ '), findsOneWidget);
    expect(find.text('12500,00'), findsOneWidget);

    // Submit form
    final confirmButton = find.byKey(const ValueKey('appointment_confirm_button'));
    await tester.ensureVisible(confirmButton);
    await tester.tap(confirmButton);
    await tester.pumpAndSettle();

    expect(createdEvent, isNotNull);
    expect(createdEvent!.fee, 12500.0);
    expect(createdEvent!.title, 'Mega Show Festival');
  });

  testWidgets('Should display and update high fee value when editing existing event (T4.1)', (WidgetTester tester) async {
    EventEntity? updatedEvent;

    final existingEvent = EventEntity(
      id: 'evt-high-fee-999',
      title: 'Festival Internacional',
      type: 'Show',
      date: DateTime(2026, 8, 15),
      startTime: '20:00',
      endTime: '23:30',
      location: 'Estádio Municipal',
      fee: 10000.0,
      notes: 'Palco principal',
    );

    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: NewAppointmentWidget(
          event: existingEvent,
          onConfirm: (e) async {
            updatedEvent = e;
          },
        ),
      ),
    ));

    // Verify initial high fee is loaded formatted as '10000,00'
    expect(find.text('10000,00'), findsOneWidget);
    expect(find.text('R\$ '), findsOneWidget);

    // Update fee to 15000,50
    final feeFinder = find.byKey(const ValueKey('appointment_fee_field'));
    await tester.ensureVisible(feeFinder);
    await tester.enterText(feeFinder, '15000,50');

    // Submit form
    final saveButton = find.byKey(const ValueKey('appointment_confirm_button'));
    await tester.ensureVisible(saveButton);
    await tester.tap(saveButton);
    await tester.pumpAndSettle();

    expect(updatedEvent, isNotNull);
    expect(updatedEvent!.id, 'evt-high-fee-999');
    expect(updatedEvent!.fee, 15000.50);
  });

  testWidgets('Should select and format start and end times properly (T4.1)', (WidgetTester tester) async {
    EventEntity? createdEvent;

    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: NewAppointmentWidget(
          onConfirm: (e) async {
            createdEvent = e;
          },
        ),
      ),
    ));

    // Pick Start Time
    final startField = find.byKey(const ValueKey('appointment_start_time_field'));
    await tester.ensureVisible(startField);
    await tester.tap(startField);
    await tester.pumpAndSettle();
    await tester.tap(find.text('OK'));
    await tester.pumpAndSettle();

    // Pick End Time
    final endField = find.byKey(const ValueKey('appointment_end_time_field'));
    await tester.ensureVisible(endField);
    await tester.tap(endField);
    await tester.pumpAndSettle();
    await tester.tap(find.text('OK'));
    await tester.pumpAndSettle();

    // Fill required title and date
    final titleField = find.byKey(const ValueKey('appointment_title_field'));
    await tester.ensureVisible(titleField);
    await tester.enterText(titleField, 'Ensaio com Horário');

    final datePicker = find.text('Selecionar');
    await tester.ensureVisible(datePicker);
    await tester.tap(datePicker);
    await tester.pumpAndSettle();
    await tester.tap(find.text('OK'));
    await tester.pumpAndSettle();

    final confirmButton = find.byKey(const ValueKey('appointment_confirm_button'));
    await tester.ensureVisible(confirmButton);
    await tester.tap(confirmButton);
    await tester.pumpAndSettle();

    expect(createdEvent, isNotNull);
    expect(createdEvent!.startTime, isNot('--:--'));
    expect(createdEvent!.endTime, isNot('--:--'));
    expect(createdEvent!.startTime.contains(':'), isTrue);
    expect(createdEvent!.endTime.contains(':'), isTrue);
  });

  testWidgets('Should render action buttons with consistent styling and equal widths (T4.1)', (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: NewAppointmentWidget(
          onConfirm: (e) async {},
        ),
      ),
    ));

    final cancelButton = find.widgetWithText(OutlinedButton, 'Cancelar');
    final confirmButton = find.byKey(const ValueKey('appointment_confirm_button'));

    expect(cancelButton, findsOneWidget);
    expect(confirmButton, findsOneWidget);

    await tester.ensureVisible(cancelButton);
    await tester.ensureVisible(confirmButton);

    final cancelSize = tester.getSize(cancelButton);
    final confirmSize = tester.getSize(confirmButton);

    // Both buttons should have the exact same full width in the form
    expect(cancelSize.width, equals(confirmSize.width));
    expect(cancelSize.height, greaterThanOrEqualTo(48.0));
    expect(confirmSize.height, greaterThanOrEqualTo(48.0));
  });
}


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
}

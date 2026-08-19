import 'package:agenda_musical/domain/entities/event_entity.dart';
import 'package:agenda_musical/presentation/screens/principal/widgets/commitment_card.dart';
import 'package:agenda_musical/presentation/screens/principal/widgets/commitments_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';

void main() {
  setUpAll(() async {
    await initializeDateFormatting('pt_BR', null);
  });
  Widget createTestWidget({
    required List<EventEntity> events,
    Future<void> Function(String)? onDelete,
  }) {
    return MaterialApp(
      home: Scaffold(
        body: SingleChildScrollView(
          child: CommitmentsWidget(
            commitments: events,
            onConfirm: (e) async {},
            onDelete: onDelete ?? (id) async {},
          ),
        ),
      ),
    );
  }

  testWidgets('Should show empty message when there are no events', (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget(events: []));

    expect(find.text('Nenhum compromisso para este dia.'), findsOneWidget);
    expect(find.byType(CommitmentCard), findsNothing);
  });

  testWidgets('Should render list of CommitmentCards when events exist', (WidgetTester tester) async {
    final events = [
      EventEntity(
        id: '1',
        title: 'Show 1',
        type: 'Show',
        date: DateTime.now(),
        startTime: '20:00',
        endTime: '22:00',
        location: 'Local 1',
        fee: 500.0,
        notes: '',
      ),
      EventEntity(
        id: '2',
        title: 'Show 2',
        type: 'Ensaio',
        date: DateTime.now(),
        startTime: '14:00',
        endTime: '16:00',
        location: 'Local 2',
        fee: 0.0,
        notes: '',
      ),
    ];

    await tester.pumpWidget(createTestWidget(events: events));

    // Verifica se os títulos aparecem
    expect(find.text('Show 1'), findsOneWidget);
    expect(find.text('Show 2'), findsOneWidget);
    
    // Verifica se dois cards foram criados
    expect(find.byType(CommitmentCard), findsNWidgets(2));
  });
}

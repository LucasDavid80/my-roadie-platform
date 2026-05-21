import 'package:agenda_musical/presentation/widgets/my_roadie_app_bar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:agenda_musical/core/constants/app_colors.dart';

void main() {
  Widget createTestWidget({String selectedScreen = ''}) {
    return MaterialApp(
      home: Scaffold(
        appBar: MyRoadieAppBar(selectedScreen: selectedScreen),
        body: const Center(child: Text('Corpo')),
      ),
    );
  }

  testWidgets('Should render icons correctly', (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget());

    expect(find.byIcon(Icons.calendar_today), findsOneWidget);
    expect(find.byIcon(Icons.person), findsOneWidget);
    expect(find.byIcon(Icons.logout), findsOneWidget);
  });

  testWidgets('Should highlight calendar icon when selected', (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget(selectedScreen: 'calendar'));

    final calendarIcon = tester.widget<IconButton>(find.widgetWithIcon(IconButton, Icons.calendar_today));
    final profileIcon = tester.widget<IconButton>(find.widgetWithIcon(IconButton, Icons.person));

    expect(calendarIcon.color, AppColors.primary);
    expect(profileIcon.color, AppColors.secondary);
  });

  testWidgets('Should highlight profile icon when selected', (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget(selectedScreen: 'profile'));

    final calendarIcon = tester.widget<IconButton>(find.widgetWithIcon(IconButton, Icons.calendar_today));
    final profileIcon = tester.widget<IconButton>(find.widgetWithIcon(IconButton, Icons.person));

    expect(calendarIcon.color, AppColors.secondary);
    expect(profileIcon.color, AppColors.primary);
  });
}

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:auth/widgets/security_widgets.dart';

void main() {
  testWidgets('Security panel renders child content', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: SecurityPanel(child: Text('Auth ready')),
        ),
      ),
    );

    expect(find.text('Auth ready'), findsOneWidget);
  });
}

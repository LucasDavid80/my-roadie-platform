import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

/// Utilitários e inicialização de bindings para testes de integração E2E.
class E2EBindingHelper {
  /// Garante que o binding do integration_test esteja inicializado.
  static IntegrationTestWidgetsFlutterBinding ensureInitialized() {
    return IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  }

  /// Configura uma viewport consistente para os testes E2E.
  static void setupTestViewport(
    WidgetTester tester, {
    Size size = const Size(800, 1200),
    double pixelRatio = 1.0,
  }) {
    tester.view.physicalSize = size;
    tester.view.devicePixelRatio = pixelRatio;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });
  }

  /// Executa `pumpAndSettle` com limite de tempo e passo controlado para evitar loops infinitos com animações contínuas.
  static Future<void> pumpAndSettleWithTimeout(
    WidgetTester tester, {
    Duration timeout = const Duration(seconds: 10),
    Duration step = const Duration(milliseconds: 100),
  }) async {
    final end = DateTime.now().add(timeout);
    while (DateTime.now().isBefore(end)) {
      await tester.pump(step);
      if (!tester.binding.hasScheduledFrame) {
        await tester.pump(step);
        return;
      }
    }
  }

  /// Bombeia a interface até que o [finder] seja encontrado ou ocorra timeout.
  static Future<void> pumpUntilFound(
    WidgetTester tester,
    Finder finder, {
    Duration timeout = const Duration(seconds: 10),
    Duration step = const Duration(milliseconds: 100),
  }) async {
    final end = DateTime.now().add(timeout);
    while (DateTime.now().isBefore(end)) {
      await tester.pump(step);
      if (finder.evaluate().isNotEmpty) {
        return;
      }
    }
    throw TimeoutException(
      'Elemento $finder não foi encontrado no tempo limite de ${timeout.inSeconds}s.',
    );
  }
}

import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:agenda_musical/core/utils/app_logger.dart';

void main() {
  group('AppLogger', () {
    late List<String> logs;
    late DebugPrintCallback originalDebugPrint;

    setUp(() {
      logs = [];
      originalDebugPrint = debugPrint;
      debugPrint = (String? message, {int? wrapWidth}) {
        if (message != null) {
          logs.add(message);
        }
      };
    });

    tearDown(() {
      debugPrint = originalDebugPrint;
    });

    test('info logs message with [INFO] prefix in debug mode', () {
      AppLogger.info('Test info message');
      expect(logs, contains('[INFO] Test info message'));
    });

    test('warning logs message with [WARNING] prefix in debug mode', () {
      AppLogger.warning('Test warning message');
      expect(logs, contains('[WARNING] Test warning message'));
    });

    test('error logs message with [ERROR] prefix in debug mode without error/stack', () {
      AppLogger.error('Test error message');
      expect(logs, contains('[ERROR] Test error message'));
      expect(logs.length, 1);
    });

    test('error logs message and error details when error is provided', () {
      final exception = Exception('Something went wrong');
      AppLogger.error('Test error with exception', exception);
      expect(logs, contains('[ERROR] Test error with exception'));
      expect(logs, contains('[ERROR DETAILS] Exception: Something went wrong'));
    });

    test('error executes safely when stackTrace is provided', () {
      final stack = StackTrace.current;
      expect(
        () => AppLogger.error('Test error with stack', 'CustomError', stack),
        returnsNormally,
      );
      expect(logs, contains('[ERROR] Test error with stack'));
      expect(logs, contains('[ERROR DETAILS] CustomError'));
    });
  });
}

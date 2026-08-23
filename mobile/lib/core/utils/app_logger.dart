import 'package:flutter/foundation.dart';

/// Utilitário centralizado para logs na aplicação mobile.
///
/// Todas as saídas são protegidas por [kDebugMode] para garantir que,
/// em compilações de Release, o código de log seja completamente ignorado
/// pelo compilador, evitando vazamento de dados sensíveis ou impacto em performance.
class AppLogger {
  /// Registra uma mensagem informativa.
  static void info(String message) {
    if (kDebugMode) {
      debugPrint('[INFO] $message');
    }
  }

  /// Registra uma mensagem de aviso.
  static void warning(String message) {
    if (kDebugMode) {
      debugPrint('[WARNING] $message');
    }
  }

  /// Registra uma mensagem de erro com objetos de erro e stack trace opcionais.
  static void error(String message, [Object? error, StackTrace? stackTrace]) {
    if (kDebugMode) {
      debugPrint('[ERROR] $message');
      if (error != null) {
        debugPrint('[ERROR DETAILS] $error');
      }
      if (stackTrace != null) {
        debugPrintStack(stackTrace: stackTrace);
      }
    }
  }
}

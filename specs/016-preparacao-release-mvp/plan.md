# Plan — 016: Preparação para Release do MVP & Padronização de Logs (AppLogger)

## Visão Geral da Solução

1. **Utilitário de Logging (`mobile/lib/core/utils/app_logger.dart`)**:
   - Implementação de `AppLogger` utilizando `flutter/foundation.dart` (`kDebugMode`).
   - Métodos estáticos:
     - `AppLogger.info(String message)`
     - `AppLogger.warning(String message)`
     - `AppLogger.error(String message, [Object? error, StackTrace? stackTrace])`
   - Otimização para compilador Dart: em modo de release, `kDebugMode` é avaliado como `false` em tempo de compilação, eliminando o corpo dos logs sem custo de processamento nem vazamento em `logcat`.

2. **Sanitização de Chamadas de Log**:
   - Substituição de chamadas diretas de `debugPrint` e `debugPrintStack` em:
     - `mobile/lib/data/datasources/remote_datasource.dart`
     - `mobile/lib/main.dart`
     - `mobile/lib/presentation/controllers/user_controller.dart`
     - `mobile/lib/presentation/widgets/new_appointment_widget.dart`

3. **Configuração de Identidade da Aplicação**:
   - Atualização de `android:label` em `mobile/android/app/src/main/AndroidManifest.xml` para `"My Roadie"`.

4. **Testes**:
   - Teste unitário em `mobile/test/core/utils/app_logger_test.dart` verificando execução segura e compatibilidade.
   - Execução de `flutter test` e `flutter analyze`.

## Conformidade com a Constituição (`constitution.md`)

- **§1 Stack**: Mantida sem alterações.
- **§5 Qualidade e Testes**: Cobertura mantida e testes executados.
- **§6 Segurança**: Eliminação de logs de tokens e dados sensíveis no cliente em ambiente de release.

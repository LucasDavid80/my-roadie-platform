# Spec — 016: Preparação para Release do MVP & Padronização de Logs (AppLogger)

## Objetivo

Preparar o ecossistema do aplicativo móvel (Flutter) e do backend para o lançamento da primeira versão de testes fechados (MVP) para usuários reais (amigos músicos e roadies). Isto envolve:
1. Padronizar o sistema de telemetria/logs no app mobile através de um utilitário centralizado `AppLogger` baseado em `kDebugMode`, eliminando chamadas dispersas a `debugPrint`/`print` que expõem dados sensíveis (tokens JWT, URLs internas, payloads) em builds de Release.
2. Ajustar a identidade do aplicativo no Android (`android:label="My Roadie"`).
3. Documentar e estruturar o roteiro de deploy do backend em nuvem e a compilação do APK de release (`flutter build apk --release`).

## Por quê

- **Segurança e Privacidade em Produção (LGPD/Segurança)**: Chamadas diretas a `debugPrint` deixam rastros no log do dispositivo (`logcat`), permitindo a inspeção de tokens de autenticação Bearer ou dados de usuários quando o app roda em produção.
- **Preparação para Telemetria Profissional**: Uma classe centralizada `AppLogger` permite plugar futuramente serviços como Firebase Crashlytics ou Sentry em um único ponto.
- **Experiência do Usuário (Identidade do MVP)**: O aplicativo deve ser instalado no celular dos testadores com o nome oficial "My Roadie" e comportamento estável.

## Escopo

1. **Mobile (`mobile/lib/core/utils/app_logger.dart`)**:
   - Criar a classe utilitária `AppLogger` com métodos `info`, `warning`, `error`.
   - Garantir que as saídas para console sejam executadas estritamente quando `kDebugMode == true`.
   - Sanitizar qualquer informação sensível (ex.: mascarar tokens).
2. **Refatoração dos Logs Dispersos no Mobile**:
   - `lib/data/datasources/remote_datasource.dart`: substituir `debugPrint` pelo `AppLogger` estruturado e sanitizado.
   - `lib/main.dart`: tratar falhas de inicialização com `AppLogger.error`.
   - `lib/presentation/controllers/user_controller.dart`: substituir `debugPrint` por `AppLogger.error`.
   - `lib/presentation/widgets/new_appointment_widget.dart`: substituir `debugPrint` por `AppLogger.error`.
3. **Identidade do Aplicativo (`mobile/android/app/src/main/AndroidManifest.xml`)**:
   - Garantir `android:label="My Roadie"`.
4. **Testes Automatizados**:
   - Criar testes unitários para o `AppLogger` (`mobile/test/core/utils/app_logger_test.dart`).
   - Garantir que todas as suítes do Flutter passem com 100% de sucesso.

## Fora de Escopo

- Configuração de pipeline de CI/CD para lojas Google Play / App Store (fase de publicação em loja).
- Integração com SDKs externos pesados como Firebase Crashlytics / Sentry nesta spec (preparar apenas a interface `AppLogger`).

## Critérios de Sucesso

- [ ] Utilitário `AppLogger` implementado em `mobile/lib/core/utils/app_logger.dart`.
- [ ] Todas as chamadas de `debugPrint` e logs sensíveis no mobile refatoradas para usar `AppLogger`.
- [ ] Testes unitários para `AppLogger` criados e aprovados.
- [ ] `AndroidManifest.xml` configurado com `android:label="My Roadie"`.
- [ ] Suíte de testes do mobile e backend passando com 100% de sucesso e zero issues no linter/analyzer.

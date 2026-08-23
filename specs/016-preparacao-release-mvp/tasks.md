# Tasks — 016: Preparação para Release do MVP & Padronização de Logs (AppLogger)

## Fase 0 — Diagnóstico & Mapeamento de Logs

- [x] T0.1 — Mapear todas as ocorrências de `debugPrint` e logs sensíveis no projeto mobile (`mobile/lib`).
- [x] T0.2 — Inspecionar `mobile/android/app/src/main/AndroidManifest.xml` para validação de `android:label`.

## Fase 1 — Implementação do AppLogger & Sanitização de Logs

- [ ] T1.1 — Criar o utilitário `mobile/lib/core/utils/app_logger.dart` com proteção via `kDebugMode`.
- [ ] T1.2 — Refatorar `mobile/lib/data/datasources/remote_datasource.dart`, `mobile/lib/main.dart`, `mobile/lib/presentation/controllers/user_controller.dart` e `mobile/lib/presentation/widgets/new_appointment_widget.dart` para utilizar `AppLogger`.
- [ ] T1.3 — Criar testes unitários para o `AppLogger` em `mobile/test/core/utils/app_logger_test.dart`.

## Fase 2 — Identidade do Aplicativo & Configuração de Release

- [ ] T2.1 — Atualizar `android:label` em `mobile/android/app/src/main/AndroidManifest.xml` para `"My Roadie"`.

## Fase 3 — Validação Automatizada & Fechamento

- [ ] T3.1 — Executar suíte de testes do mobile (`flutter test`) e análise estática (`flutter analyze`).
- [ ] T3.2 — Executar suíte de testes do backend (`npm test` e `npm run test:e2e`).
- [ ] T3.3 — Atualizar `backlog.md`, `spec.md` e `plan.md` com a entrega da spec 016.

## Checklist de fechamento da feature

- [ ] `AppLogger` criado e operacional com proteção `kDebugMode`
- [ ] Todos os `debugPrint` residuais e logs sensíveis refatorados
- [ ] Testes unitários do `AppLogger` passando
- [ ] Nome do app no `AndroidManifest.xml` definido como "My Roadie"
- [ ] Suítes de testes automatizados do mobile e backend passando 100%

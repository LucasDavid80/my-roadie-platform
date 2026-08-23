# Tasks — 016: Preparação e Publicação do MVP para Testes Fechados

## Fase 0 — Diagnóstico & Mapeamento

- [x] T0.1 — Mapear todas as ocorrências de `debugPrint` e logs sensíveis no projeto mobile (`mobile/lib`).
- [x] T0.2 — Inspecionar `mobile/android/app/src/main/AndroidManifest.xml` para validação de `android:label`.
- [x] T0.3 — Confirmar se o banco de produção será o mesmo projeto Supabase de desenvolvimento ou um projeto separado (Decisão: mesmo projeto Supabase de desenvolvimento).

## Fase 1 — Implementação do AppLogger & Sanitização de Logs (Mobile)

- [ ] T1.1 — Criar o utilitário `mobile/lib/core/utils/app_logger.dart` com proteção via `kDebugMode`.
- [ ] T1.2 — Refatorar `mobile/lib/data/datasources/remote_datasource.dart`, `mobile/lib/main.dart`, `mobile/lib/presentation/controllers/user_controller.dart` e `mobile/lib/presentation/widgets/new_appointment_widget.dart` para utilizar `AppLogger`.
- [ ] T1.3 — Remover especificamente o log parcial do token JWT em `remote_datasource.dart` (não substituir por versão mascarada — remover a informação do token do log por completo).
- [ ] T1.4 — Criar testes unitários para o `AppLogger` em `mobile/test/core/utils/app_logger_test.dart`.

## Fase 2 — Identidade do Aplicativo (Mobile)

- [ ] T2.1 — Atualizar `android:label` em `mobile/android/app/src/main/AndroidManifest.xml` para `"My Roadie"`.

## Fase 3 — Backend em Produção

- [ ] T3.1 — Alterar `backend/src/main.ts` para `app.enableCors({ origin: process.env.FRONTEND_URL })`.
- [ ] T3.2 — Criar conta e projeto na plataforma de hospedagem escolhida (Railway Hobby ou Render Starter).
- [ ] T3.3 — Configurar variáveis de ambiente de produção: `DATABASE_URL` (pooler), chaves do Supabase, `FRONTEND_URL`.
- [ ] T3.4 — Rodar `npx prisma migrate deploy` contra o banco de produção.
- [ ] T3.5 — Publicar o backend e validar que responde publicamente (`GET` de um endpoint simples).

## Fase 4 — Frontend-web em Produção

- [ ] T4.1 — Criar conta e projeto na plataforma de hospedagem escolhida (ex.: Vercel).
- [ ] T4.2 — Configurar variável de ambiente com a URL pública do backend.
- [ ] T4.3 — Publicar o frontend-web e validar login/cadastro contra o backend de produção.

## Fase 5 — Página de Distribuição para Testers (Frontend-web)

- [ ] T5.1 — Criar a rota `frontend-web/src/app/testers/page.tsx`, sem link na navegação principal.
- [ ] T5.2 — Adicionar seção Android com botão de download do `.apk` e instrução de "fontes desconhecidas".
- [ ] T5.3 — Adicionar seção iOS com link do `.ipa` e passo a passo do sideload (Sideloadly/AltStore), incluindo o aviso de expiração em 7 dias.
- [ ] T5.4 — Decidir e configurar onde os arquivos `.apk`/`.ipa` ficam hospedados (assets estáticos do frontend-web ou storage separado).

## Fase 6 — Builds de Release (Mobile)

- [ ] T6.1 — Gerar o APK de release com `flutter build apk --release --dart-define=BACKEND_URL=<url-producao>`.
- [ ] T6.2 — Zipar a pasta `mobile/` e subir no FlutLab.io.
- [ ] T6.3 — Configurar o `BACKEND_URL` de produção no build do FlutLab.
- [ ] T6.4 — Gerar certificado a partir de um Apple ID gratuito e configurar no FlutLab para obter um `.ipa` assinado.
- [ ] T6.5 — Testar o sideload do `.ipa` em ao menos um dispositivo iOS real via Sideloadly ou AltStore.

## Fase 7 — Validação Automatizada & Fechamento

- [ ] T7.1 — Executar suíte de testes do mobile (`flutter test`) e análise estática (`flutter analyze`).
- [ ] T7.2 — Executar suíte de testes do backend (`npm test` e `npm run test:e2e`), validando que a mudança de CORS não quebrou nada.
- [ ] T7.3 — Atualizar `backlog.md`, `spec.md` e `plan.md` raiz com a entrega da spec 016.

## Checklist de fechamento da feature

- [ ] `AppLogger` criado e operacional com proteção `kDebugMode`
- [ ] Todos os `debugPrint` residuais e logs sensíveis refatorados, incluindo o token JWT
- [ ] Testes unitários do `AppLogger` passando
- [ ] Nome do app no `AndroidManifest.xml` definido como "My Roadie"
- [ ] Backend com CORS restrito, publicado, sem cold start, com migrations aplicadas
- [ ] Frontend-web publicado e funcional contra o backend de produção
- [ ] Rota `/testers` no ar com instruções Android e iOS
- [ ] APK de release gerado apontando para produção
- [ ] `.ipa` gerado via FlutLab e validado via sideload em dispositivo real
- [ ] Suítes de testes automatizados do mobile e backend passando 100%

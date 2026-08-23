# Plan — 016: Preparação e Publicação do MVP para Testes Fechados

## Visão Geral da Solução

### 1. Mobile — Logging (`mobile/lib/core/utils/app_logger.dart`)
- Implementação de `AppLogger` utilizando `flutter/foundation.dart` (`kDebugMode`).
- Métodos estáticos:
  - `AppLogger.info(String message)`
  - `AppLogger.warning(String message)`
  - `AppLogger.error(String message, [Object? error, StackTrace? stackTrace])`
- Otimização para compilador Dart: em modo de release, `kDebugMode` é avaliado como `false` em tempo de compilação, eliminando o corpo dos logs sem custo de processamento nem vazamento em `logcat`.
- Em `remote_datasource.dart`, remover por completo o trecho que loga os primeiros 20 caracteres do token — não substituir por uma versão "mascarada" do próprio token, apenas logar presença/ausência (`token != null`) quando `AppLogger.info` for chamado.

### 2. Mobile — Sanitização de Chamadas de Log
- Substituição de chamadas diretas de `debugPrint` e `debugPrintStack` em:
  - `mobile/lib/data/datasources/remote_datasource.dart`
  - `mobile/lib/main.dart`
  - `mobile/lib/presentation/controllers/user_controller.dart`
  - `mobile/lib/presentation/widgets/new_appointment_widget.dart`

### 3. Mobile — Identidade da Aplicação
- Atualização de `android:label` em `mobile/android/app/src/main/AndroidManifest.xml` para `"My Roadie"`.

### 4. Backend — Configuração de Produção
- `backend/src/main.ts`: trocar `app.enableCors()` por `app.enableCors({ origin: process.env.FRONTEND_URL })`, lendo a origem permitida de uma variável de ambiente em vez de hardcode, para facilitar trocar o domínio sem novo deploy de código.
- Variáveis de ambiente de produção a configurar na plataforma de hospedagem:
  - `DATABASE_URL` — connection string do **pooler** (pgbouncer) do Supabase, não a direta.
  - Chaves do Supabase (as mesmas já usadas em desenvolvimento, mas do projeto de produção se for um projeto separado).
  - `FRONTEND_URL` — domínio publicado do frontend-web.
  - `PORT` — geralmente já definido automaticamente pela plataforma de hospedagem.
- Rodar `npx prisma migrate deploy` (não `migrate dev`) contra o banco de produção antes do primeiro deploy do backend.
- Hospedagem: Railway Hobby (~US$5/mês) ou Render Starter (~US$7/mês) — qualquer um dos dois evita cold start, importante para não confundir os testers com uma primeira resposta lenta.

### 5. Frontend-web — Publicação
- Deploy em uma plataforma com suporte nativo a Next.js e tier gratuito (ex.: Vercel).
- Variável de ambiente apontando para a URL pública do backend (equivalente ao `BACKEND_URL` usado no mobile).

### 6. Frontend-web — Página de Distribuição para Testers
- Nova rota `frontend-web/src/app/testers/page.tsx`, **sem link na navegação principal** (não referenciada em `page.tsx` nem em nenhum componente de menu).
- Conteúdo da página:
  - Seção Android: botão de download direto do `.apk` + instrução curta sobre habilitar "instalar de fontes desconhecidas".
  - Seção iOS: link de download do `.ipa` + passo a passo resumido do processo de sideload via Sideloadly ou AltStore, incluindo o aviso de que a instalação expira em 7 dias e precisa ser refeita.
- Os arquivos `.apk`/`.ipa` podem ficar hospedados como assets estáticos do próprio frontend-web (`public/downloads/`) ou em um storage separado (ex.: bucket do Supabase Storage), a decidir na implementação.

### 7. Mobile — Geração dos Builds de Release
- **Android**: `flutter build apk --release --dart-define=BACKEND_URL=<url-producao-do-backend>`.
- **iOS**: build via FlutLab.io (upload do `.zip` da pasta `mobile/`, configuração do mesmo `--dart-define=BACKEND_URL`, certificado gerado a partir de um Apple ID gratuito). Resultado: `.ipa` assinado, válido por 7 dias, pronto para sideload.

### 8. Testes
- Teste unitário em `mobile/test/core/utils/app_logger_test.dart` verificando execução segura e compatibilidade.
- Execução de `flutter test` e `flutter analyze`.
- Execução de `npm test` e `npm run test:e2e` no backend, contra a configuração de CORS restrito, para garantir que nada quebrou com a mudança de `enableCors()`.

## Conformidade com a Constituição (`constitution.md`)

- **§1 Stack**: Mantida sem alterações.
- **§5 Qualidade e Testes**: Cobertura mantida e testes executados, incluindo verificação pós-mudança de CORS.
- **§6 Segurança**: Eliminação de logs de tokens e dados sensíveis no cliente em ambiente de release; CORS do backend deixa de ser aberto (`enableCors()` sem parâmetros) e passa a validar origem.
- **§10 LGPD**: gaps já documentados como débito técnico permanecem fora de escopo desta spec — teste fechado com usuários conhecidos, não lançamento público.

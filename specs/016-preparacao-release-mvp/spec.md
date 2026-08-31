# Spec — 016: Preparação e Publicação do MVP para Testes Fechados

## Objetivo

Preparar e colocar no ar a primeira versão de testes fechados (MVP) do My Roadie para usuários reais (amigos músicos e roadies), cobrindo os três apps do monorepo:

1. **Mobile (Flutter)**: padronizar telemetria/logs via `AppLogger`, remover vazamento de dados sensíveis em builds de Release, ajustar identidade do app, e gerar builds de instalação (Android via APK, iOS via processo sem Mac) apontando para o backend em produção.
2. **Backend (NestJS)**: preparar configuração de produção (variáveis de ambiente, CORS restrito, migrations aplicadas) e publicá-lo em um serviço de hospedagem acessível pela internet.
3. **Frontend-web (Next.js)**: publicar o site e criar uma página não-listada de distribuição para testers, com os links/instruções de instalação para Android e iOS.

## Por quê

- **Segurança e Privacidade em Produção (LGPD/Segurança)**: chamadas diretas a `debugPrint` deixam rastros no log do dispositivo (`logcat`), permitindo a inspeção de tokens de autenticação Bearer ou dados de usuários quando o app roda em produção. Isso inclui o log parcial do JWT hoje presente em `remote_datasource.dart`.
- **Backend exposto publicamente pela primeira vez**: hoje o `main.ts` chama `app.enableCors()` sem restrição de origem — aceitável em desenvolvimento local, mas precisa ser resolvido antes do backend ficar acessível publicamente.
- **Preparação para Telemetria Profissional**: uma classe centralizada `AppLogger` permite plugar futuramente serviços como Firebase Crashlytics ou Sentry em um único ponto.
- **Experiência do Usuário (Identidade do MVP)**: o aplicativo deve ser instalado no celular dos testadores com o nome oficial "My Roadie" e comportamento estável.
- **Distribuição sem custo (orçamento zero no momento)**: testers usam majoritariamente iOS; sem verba disponível para a Apple Developer Program agora, o fluxo de distribuição precisa funcionar via sideload gratuito (Sideloadly/AltStore) e builds gerados sem Mac local (FlutLab.io).
- **Ponto único de distribuição**: como o build iOS expira a cada 7 dias (assinatura via Apple ID gratuito), os testers precisam de um link estável para sempre encontrar a versão mais recente, em vez de reenvio manual repetido por WhatsApp/Drive.

## Resultados do Diagnóstico (Fase 0)

### 1. Mapeamento de Logs e Vazamento de Dados Sensíveis (T0.1)
- **`mobile/lib/data/datasources/remote_datasource.dart`**:
  - Linha 62: `debugPrint('DEBUG AUTH TOKEN PRESENTE: ...')`
  - Linha 64: `debugPrint('DEBUG AUTH TOKEN (início): ...')` *(Crítico: vazamento parcial de JWT)*
  - Linhas 184–185: `debugPrint('DEBUG REQUEST URL: ...')` e `debugPrint('DEBUG REQUEST HEADERS: ...')` *(Alto: exposição de headers com Bearer token)*
  - Linhas 192–193: `debugPrint('DEBUG RESPONSE STATUS: ...')` e `debugPrint('DEBUG RESPONSE BODY: ...')` *(Alto: exposição de corpo de resposta com PII)*
- **`mobile/lib/main.dart`**:
  - Linha 21: `debugPrint('Erro ao inicializar Supabase: $e')`
- **`mobile/lib/presentation/controllers/user_controller.dart`**:
  - Linhas 75–76: `debugPrint('fetchProfile ERRO: $e')` e `debugPrintStack(stackTrace: stack)`
  - Linhas 92–93: `debugPrint('saveProfile ERRO: $e')` e `debugPrintStack(stackTrace: stack)`
- **`mobile/lib/presentation/widgets/new_appointment_widget.dart`**:
  - Linhas 451 e 454: `debugPrint('Erro ao salvar compromisso: $error')` e `debugPrintStack(stackTrace: stackTrace)`
- Nenhuma outra chamada direta a `print()` ou logs não controlados foi encontrada no `mobile/lib`.

### 2. Identidade da Aplicação (T0.2)
- **`mobile/android/app/src/main/AndroidManifest.xml`**:
  - Linha 3: `android:label="agenda_musical"` confirmada para atualização para `"My Roadie"`.

### 3. Estratégia de Banco de Dados Supabase (T0.3)
- Decisão confirmada: o MVP de testes fechados utilizará o **mesmo projeto Supabase de desenvolvimento**, mantendo as credenciais existentes e simplificando a infraestrutura inicial.

### 4. Avaliação do FlutLab.io e Migração para GitHub Actions (T6.2 / Decisão Arquitetural)
- **Diagnóstico do FlutLab.io**: Durante a execução da Fase 6, verificou-se que o FlutLab.io disponibiliza compilação apenas para *Web, Android APK, App Bundle (Android AAB)* e testes, não possuindo infraestrutura macOS para geração nativa de arquivos `.ipa` instaláveis no iOS.
- **Decisão e Pivô**: Desistência do uso do FlutLab.io e adoção dos **runners `macos-latest` do GitHub Actions** (disponíveis gratuitamente). O pipeline do repositório compila o app com `flutter build ios --release --no-codesign`, empacota o bundle em formato `.ipa` e disponibiliza o binário para download direto via artefatos do GitHub Actions, mantendo o processo 100% gratuito e sem necessidade de Mac físico local.

## Escopo

### 1. Mobile — Logging e Identidade
- Criar a classe utilitária `AppLogger` (`mobile/lib/core/utils/app_logger.dart`) com métodos `info`, `warning`, `error`, ativos apenas quando `kDebugMode == true`.
- Sanitizar qualquer informação sensível (ex.: mascarar tokens — nunca logar nem os primeiros caracteres do JWT).
- Substituir `debugPrint`/`debugPrintStack` por `AppLogger` em:
  - `lib/data/datasources/remote_datasource.dart` (inclui remoção do log parcial do token de autenticação)
  - `lib/main.dart`
  - `lib/presentation/controllers/user_controller.dart`
  - `lib/presentation/widgets/new_appointment_widget.dart`
- Atualizar `android:label` em `mobile/android/app/src/main/AndroidManifest.xml` para `"My Roadie"`.

### 2. Backend — Preparação para Produção
- Restringir `app.enableCors()` em `backend/src/main.ts` para aceitar apenas a origem do frontend-web publicado (não wildcard).
- Definir variáveis de ambiente de produção: `DATABASE_URL` (via connection string do pooler/pgbouncer do Supabase, não a direta), chaves do Supabase, `PORT`.
- Rodar `npx prisma migrate deploy` contra o banco de produção (não `migrate dev`).
- Publicar o backend em um serviço de hospedagem com plano sempre ativo (Railway Hobby ou Render Starter) para evitar cold start durante os testes.

### 3. Frontend-web — Publicação e Página de Distribuição
- Publicar o `frontend-web` (ex.: Vercel, tier gratuito) apontando para a API do backend em produção.
- Criar uma rota não-listada (ex.: `/testers`), sem link na navegação pública, contendo:
  - Link de download direto do `.apk` (Android).
  - Instruções + link de download do `.ipa` para iOS, com passo a passo do processo de sideload (Sideloadly/AltStore).

### 4. Mobile — Build de Release
- Gerar o APK de release: `flutter build apk --release --dart-define=BACKEND_URL=<url-producao>`.
- Gerar o `.ipa` via GitHub Actions (`macos-latest`, sem necessidade de Mac local), preparado para assinatura com Apple ID gratuito via sideload (Sideloadly/AltStore). (Nota: FlutLab.io foi descontinuado do fluxo por falta de suporte a IPA).

## Fora de Escopo

- Configuração de pipeline de CI/CD para lojas Google Play / App Store (fase de publicação em loja).
- Integração com SDKs externos pesados como Firebase Crashlytics / Sentry nesta spec (preparar apenas a interface `AppLogger`).
- Assinatura via Apple Developer Program paga (TestFlight) — fica para quando houver orçamento; o fluxo desta spec usa apenas o caminho gratuito.
- Resolução dos gaps de LGPD já documentados como débito técnico no `plan.md` raiz (consentimento, portabilidade, log de auditoria) — não bloqueantes para um teste fechado com poucos usuários conhecidos.

## Critérios de Sucesso

- [x] Utilitário `AppLogger` implementado em `mobile/lib/core/utils/app_logger.dart`.
- [x] Todas as chamadas de `debugPrint` e logs sensíveis no mobile refatoradas para usar `AppLogger`, incluindo a remoção do log parcial do token JWT.
- [x] Testes unitários para `AppLogger` criados e aprovados.
- [x] `AndroidManifest.xml` configurado com `android:label="My Roadie"`.
- [x] Backend com CORS restrito ao domínio do frontend-web (sem wildcard).
- [x] Migrations aplicadas no banco de produção via `prisma migrate deploy`.
- [x] Backend publicado e acessível publicamente, sem cold start (plano sempre ativo).
- [x] Frontend-web publicado e acessível publicamente.
- [x] Rota `/testers` criada, não-listada, com instruções e links de instalação Android e iOS.
- [x] APK de release gerado e apontando para o backend de produção.
- [x] `.ipa` gerado via pipeline do GitHub Actions (`macos-latest`) e testado via sideload em ao menos um dispositivo iOS.
- [x] Suíte de testes do mobile e backend passando com 100% de sucesso e zero issues no linter/analyzer.

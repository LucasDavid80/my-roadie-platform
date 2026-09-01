# 🗺️ Plan — Baseline v1

> Complementa o `spec.md`: aqui entra o **como técnico** do estado atual, não o *o quê*. Serve de referência para os `plan.md` de features futuras não reinventarem decisões já tomadas.

## 1. Arquitetura (C4 — nível 1)

```
Músico/Roadie → frontend-web (Next.js) ┐
Músico/Roadie → mobile (Flutter)       ├→ backend (NestJS) → Supabase (Postgres + Auth)
```

- `frontend-web` e `mobile` são clientes independentes do mesmo backend — nenhum dos dois fala direto com o Supabase para dados de domínio (só para Auth).
- Ver diagrama completo em `docs/architecture/overview.md`.

## 2. Backend

- Estrutura: `src/modules/<dominio>` (hoje: `auth`, `users`, `events`, `tasks`, `repertoire`, `transactions`, `band-access`).
- Persistência: Prisma Client sobre Postgres (Supabase). `DATABASE_URL` via env.
- Fluxo de schema: editar `prisma/schema.prisma` → migration → `npx prisma generate` → atualizar `docs/database/erd.md`.
- Autenticação e Autorização: Supabase Auth emite identidade; backend valida via estratégia JWT (`jwt.strategy.ts` com suporte dinâmico a ES256 via JWKS do Supabase e HS256 em dev local), guards (`JwtAuthGuard` com logs detalhados e exceções descritivas como `TOKEN_EXPIRED`, `INVALID_SIGNATURE`, `MALFORMED_TOKEN`, `MISSING_BEARER`, `OwnershipGuard`) e `BandAccessService` (`getUserBandIds`, `assertMembership`) para verificação de pertencimento via `BandMember` nos módulos de `tasks`, `repertoire` e `transactions` (Spec 011, Spec 012). Módulo `events` autenticado e ativo com `EventsController` e `EventsService` integrados ao Prisma, suporte a Workspace Unificado para músicos solo, novos campos (`startTime`, `endTime`, `type`, `fee`), sincronização automática com `Transaction` (`INCOME` para `fee > 0`) e integridade referencial `onDelete: Cascade` (Spec 014, Spec 015).
- Configuração de Produção & CORS: `backend/src/main.ts` restringe CORS à origem definida em `process.env.FRONTEND_URL`, eliminando permissões abertas de wildcard para segurança em produção; script `"start:prod": "node dist/src/main"` em `backend/package.json` mapeia corretamente o ponto de entrada compilado no monorepo (Spec 016).

**Lacunas de módulos e autorização por banda zeradas:** módulos `Task` (spec 004), `RepertoireSong` (spec 005) e `Transaction` (spec 006) entregues e com autorização por banda fechada via `BandAccessService` (spec 011); módulo `Event` ativo com endpoints REST completos, suporte a workspace solo, extensão de campos, sincronização financeira e testes unitários/E2E (spec 014, spec 015).

## 3. Frontend Web

- Next.js App Router, Route Groups `(auth)`, `(dashboard)` e `(admin)`.
- `src/services/` concentra chamadas HTTP; sempre remover `id`/`createdAt`/`updatedAt` antes de `POST`/`PATCH`.
- Tipos de `src/types/` devem espelhar os DTOs do backend (como `src/types/event.ts` para `EventEntity` - Spec 015).
- Instância centralizada do Supabase em `src/lib/supabase.ts`. Autenticação integrada ao Supabase Auth via `signInWithPassword` no `AuthContext` (Spec 008) e cadastro integrado ao Supabase Auth + API NestJS (`POST /users`) no `RegisterForm` (Spec 010). `AuthContext` com trava `useRef` garantindo disparo único de `fetchProfile` e tratamento amigável de erros de autenticação na UI (Spec 012).
- Página de Distribuição & Resiliência: Rota `/testers` (`src/app/testers/page.tsx`) com interface resiliente contra links ausentes/404, validação dinâmica de URLs externas (`NEXT_PUBLIC_APK_DOWNLOAD_URL` e `NEXT_PUBLIC_IPA_DOWNLOAD_URL`), badge informativo de status ("Em breve / Aguardando build"), link alternativo para GitHub Releases e exibição da versão ativa via `NEXT_PUBLIC_APP_VERSION` (Spec 016, Spec 018).

**Decisão fechada:** A stack do frontend-web foi confirmada e documentada em `docs/architecture/frontend.md` (Tailwind CSS, Context API e Axios).


## 4. Mobile

- Clean Architecture: `domain/` → `data/` → `presentation/`.
- Estado atual: as telas de auth, agenda e perfil estão conectadas à API real do backend através do `remote_datasource` e dos repositories.
- Cadastro sincronizado: `AuthRemoteDataSource.signUp` registra as credenciais no Supabase Auth e em seguida invoca `RemoteDataSource.createUser` (`POST /users`), garantindo a criação de usuário no PostgreSQL com feedback de erro amigável na UI (Spec 010).
- Atualização reativa de compromissos: `AgendaController` sincroniza eventos retornados da API e notifica a UI de forma imutável após criação/edição (Spec 007).
- ✅ **Correção de Carregamento e Salvamento do Perfil (`PersonScreen`):** Solucionada causa raiz de erros HTTP 401 Unauthorized com injeção do JWT de sessão do Supabase em `RemoteDataSource._getHeaders()`. `UserNotifier` refatorado para propagar mensagens de erro reais (`errorMessage`) na UI via SnackBar. Adicionados testes unitários, de widget e de integração (`profile_flow_integration_test.dart`) cobrindo o ciclo completo de visualização e edição do perfil (Spec 009).
- ✅ **Deduplicação de `fetchProfile` e Tratamento Visual de Erros:** `UserNotifier` refatorado com trava de requisição prevenindo execuções síncronas redundantes de `fetchProfile`, com exibição visual de feedbacks de erro da API na UI (Spec 012).
- ✅ **Rolagem da Agenda sobre o calendário:** `CustomCalendar` configura o `TableCalendar` com `AvailableGestures.horizontalSwipe`, para que o gesto vertical seja tratado pelo `SingleChildScrollView` da `PrincipalScreen`. O teste de widget em `principal_screen_test.dart` confirma que um arraste iniciado sobre o calendário desloca a tela, sem alterar a seleção de dia, os marcadores de eventos ou a navegação mensal (Spec 013).
- ✅ **Criação de Compromissos e Feedback Visual na UI (`NewAppointmentWidget`):** `RemoteDataSource.saveEvent` sanitiza o payload de criação (removendo `id` local autogerado antes do `POST`), `AgendaController.addOrUpdateEvent` propaga exceções e `NewAppointmentWidget` exibe `SnackBar` com mensagens informativas de erro (rede, validação 400, auth 401 ou servidor 500) mantendo o formulário preenchido para reenvio. Compatibilidade com dispositivos físicos validada via `adb reverse tcp:3000 tcp:3000` ou `--dart-define=BACKEND_URL` (Spec 014).
- ✅ **Extensão do Modelo de Eventos, Exclusão de Compromisso e Layout (`CommitmentCard` / `NewAppointmentWidget`):** `EventModel` serializa e desserializa `startTime`, `endTime`, `type` e `fee`. `CommitmentCard` substitui o ícone estático por um `IconButton` funcional com diálogo de confirmação chamando `AgendaController.deleteEvent(id)` e feedback visual via `SnackBar`. `NewAppointmentWidget` com renderização dinâmica do campo Cachê (exibido apenas para `Show` e `Gravação`), expansão do input `Local` para `Ensaio`/`Reunião`, layout ajustado e botão de submissão centralizado (Spec 015).
- ✅ **Logging Centralizado via `AppLogger` & Identidade do App:** Utilitário `AppLogger` (`mobile/lib/core/utils/app_logger.dart`) implementado com `kDebugMode`, eliminando em builds de release qualquer vazamento de tokens de autenticação ou dados sensíveis em `logcat`. Logs diretos de `debugPrint` refatorados em todo o app (`remote_datasource.dart`, `user_controller.dart`, `main.dart`, `new_appointment_widget.dart`), remoção completa de rastros do JWT, testes unitários em `app_logger_test.dart`, e nome de exibição do app alterado para "My Roadie" (`android:label`) (Spec 016).
- ✅ **Suíte de Testes de Integração Ponta a Ponta (`mobile/integration_test/`):** Estrutura padronizada de testes E2E com Flutter SDK `integration_test`. Helpers dedicados: `e2e_binding.dart` (gerenciamento de binding e espera assíncrona resiliente), `test_seed_data.dart` (sementes determinísticas de usuário e compromissos) e `test_app_wrapper.dart` (configuração do `ProviderScope` e `GoRouter` com repositórios parametrizáveis para execução determinística/hermética e real). Cobertura completa de Autenticação (`auth_flow_test.dart`), Perfil (`profile_flow_test.dart`), Ciclo da Agenda (`agenda_flow_test.dart`) e runner unificado (`app_test.dart`), com identificadores semânticos `ValueKey` em todos os pontos de interação (Spec 019).
- ✅ **Correção de UX no Modal de Compromissos (`NewAppointmentWidget`):** Otimização de margens do `Dialog` (`insetPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 24)`) e remoção de margens aninhadas do `Container`, reestruturação do formulário para campos de 100% de largura em "Local" e "Cachê" (com máscara `CurrencyInputFormatter` deslocando centavos automaticamente da direita para a esquerda e teclado numérico), botões de ação estruturados sob `Column(crossAxisAlignment: CrossAxisAlignment.stretch)` ocupando largura total com altura consistente e sem sobreposição, e seletores de horário com `showTimePicker` temático e persistência no formato `"HH:mm"` (Spec 020).

## 5. Testes

- Backend: Jest, `NestJS TestingModule`; testes unitários colocados junto do código (`*.spec.ts`), e2e em `backend/test/`.
- Frontend Web: Vitest e Playwright (E2E cobrindo rotas principais e `/testers`).
- Mobile: `flutter_test` (testes unitários e de widget em `mobile/test/`) e `integration_test` (testes E2E ponta a ponta dos fluxos de auth, perfil e agenda em `mobile/integration_test/`).
- Banco de teste isolado (`DATABASE_URL_TEST`) para integração/e2e; migrations aplicadas antes de rodar.

### Cobertura de Testes (Medição de 12/08/2026 — Spec 012)

| App | % Statements | % Branches | % Functions | % Lines |
|---|---|---|---|---|
| Backend | 92.83% | 71.76% | 92.10% | 92.04% |
| Frontend Web | 81.08% | 54.37% | 88.88% | 81.42% |
| Mobile | - | - | - | 83.67% |

## 6. CI/CD

- Definido centralmente em `.github/workflows/ci.yml`, estruturado com grafo de 16 jobs interdependentes (DAG) executando sobre Node 22 (`ubuntu-latest`) e macOS (`macos-latest`).
- **Gatilhos de Execução:** Pushes em branches (`main`, `master`), Tags de release (`v*`), Pull Requests e disparo manual (`workflow_dispatch`).
- **Detecção Inteligente de Caminhos (`dorny/paths-filter@v3`):** Job inicial `changes` mapeia alterações por pasta (`backend/**`, `frontend-web/**`, `mobile/**`). Configurado com `base: ${{ github.base_ref }}` para que em pull requests compare com a branch alvo e em pushes compare com `github.event.before`, evitando diffs vazios e garantindo execuções de pipeline em merges para a `main` (Spec 018).
- **Disparo Manual Sob Demanda (`workflow_dispatch`):** Suporta parâmetros configuráveis na UI do GitHub Actions:
  - `scope`: `auto` (default), `all`, `backend`, `frontend`, `mobile`.
  - `backend_url`: URL injetada nos builds mobile (prioriza input, fallback para `secrets.BACKEND_URL`).
  - `run_mobile_e2e`: flag booleana (default: `false`) para ativação sob demanda de testes em emuladores mobile.
  - `publish_release`: flag booleana (default: `false`) para forçar publicação de GitHub Release.
- **Testes Automatizados (Lints, Unitários & E2E):**
  - Backend: `backend-lint` → `backend-test` (Jest unitários) → `backend-e2e` (Jest E2E com mock de JWKS em `test/__mocks__/jwks-rsa.js` e Prisma Client gerado).
  - Frontend Web: `frontend-lint` → `frontend-test` (Vitest com `pool: threads`) → `frontend-e2e` (Playwright com browser headless Chromium validando rotas públicas, privadas e `/testers`).
  - Mobile: `mobile-lint` (`flutter analyze`) → `mobile-test` (`flutter test` cobrindo testes unitários e de widget) → `mobile-e2e-emulator` (executa a suíte E2E `flutter test integration_test/app_test.dart` no runner `macos-latest` condicionado a `run_mobile_e2e == true` — Spec 019).
- **Compilação e Padronização de Nomenclatura dos Binários Mobile:**
  - `mobile-android-build`: Compila `app-release.apk` com Java 17 Zulu, Android SDK, Gradle cache e `--dart-define=BACKEND_URL=${{ inputs.backend_url || secrets.BACKEND_URL }}`, renomeia o binário para `my-roadie-release.apk` (simetria com o iOS) e publica artefato `my-roadie-android-release-apk` via `actions/upload-artifact@v4`.
  - `mobile-ios-build`: Compila iOS no runner `macos-latest` com `--no-codesign` e `--dart-define=BACKEND_URL=${{ inputs.backend_url || secrets.BACKEND_URL }}`, empacota em `my-roadie-release.ipa` e publica artefato `my-roadie-ios-release-ipa` via `actions/upload-artifact@v4`.
- **Publicação Automatizada de Releases (`publish-github-release`):**
  - Acionado automaticamente na criação de tags `v*` ou via `publish_release == 'true'`, depende da compilação bem-sucedida de Android e iOS, baixa os artefatos gerados e cria a GitHub Release pública permanente anexando `my-roadie-release.apk` e `my-roadie-release.ipa` via `softprops/action-gh-release@v2` (Spec 018).
- **Distribuição de Binários para Testers (Spec 018):** a rota `/testers` usa URL pública estável por tag/latest em GitHub Releases, valida a presença das variáveis de ambiente `NEXT_PUBLIC_APK_DOWNLOAD_URL` / `NEXT_PUBLIC_IPA_DOWNLOAD_URL` / `NEXT_PUBLIC_APP_VERSION` e exibe estado seguro quando a build ainda não está disponível, evitando cliques cegos que resultam em 404.
- **Caching Multi-Camadas:** Caching de npm para backend e frontend (`actions/setup-node@v4`), caching de SDK/pub para Flutter (`subosito/flutter-action@v2`) e caching de Gradle para Android (`actions/setup-java@v4`).
- **Continuous Deployment (`deploy-production`):** Disparado automaticamente em pushes/merges na branch `main` ou via `workflow_dispatch`, condicionado ao sucesso dos jobs de build (`frontend-build` e `backend-build`), realizando chamadas `POST` seguras aos webhooks do Render (`RENDER_DEPLOY_HOOK`) e Vercel (`VERCEL_DEPLOY_HOOK`).
- Simulação local recomendada via `act --secret-file .secrets` antes de abrir PR.
- Procedimentos de release documentados em `docs/operations/release-runbook.md` e URLs em `docs/distribution/download-urls.md`.

## 7. Ambientes e variáveis

| Variável / Secret | Onde | Descrição |
|---|---|---|
| `DATABASE_URL`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_KEY`, `FRONTEND_URL` | backend (.env / Render) | Configurações do servidor e banco de dados |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | frontend-web (.env.local / Vercel) | Credenciais públicas do Supabase Auth |
| `NEXT_PUBLIC_APK_DOWNLOAD_URL`, `NEXT_PUBLIC_IPA_DOWNLOAD_URL` | frontend-web (.env.local / Vercel) | URLs públicas de download dos binários de release |
| `NEXT_PUBLIC_APP_VERSION` | frontend-web (.env.local / Vercel) | Versão semântica exibida na rota `/testers` |
| `SUPABASE_SERVICE_ROLE` | backend apenas | Chave privilegiada (nunca no cliente) |
| `BACKEND_URL` | GitHub Secrets / .secrets | URL da API injetada nos binários mobile de release |
| `RENDER_DEPLOY_HOOK`, `VERCEL_DEPLOY_HOOK` | GitHub Secrets / .secrets | Webhooks para deploy contínuo de produção |

## 8. Débito técnico a considerar antes/junto das próximas features

1. Módulos ausentes: nenhum (módulos Task, RepertoireSong, Transaction e Event entregues nas specs 004, 005, 006 e 014).
2. Mobile com camada de dados implementada e conectada (resolvido na spec 003).
3. Decisões de stack do frontend-web não fechadas na documentação (resolvido na spec 001).
4. Nenhum `spec.md`/`plan.md`/`tasks.md` formal existia antes desta migração — daqui em diante, toda feature nova segue o fluxo descrito em `constitution.md` §8.
5. **Rotas admin não isoladas** — Resolvido na spec 002 (rotas movidas para o Route Group `(admin)` com layout guard dedicado).
6. **Cobertura de testes não medida contra a meta atual** — Resolvido na spec 001 (ver tabela de medição na seção 5).
7. **Gaps de LGPD listados em `constitution.md` §10** (consentimento no cadastro, política de exclusão de conta, exportação de dados, log de acesso a dados sensíveis, confirmação de região/criptografia do Supabase) — nenhum desses está implementado hoje; são debt novo, não regressão.

> O item 7 nasceu de uma atualização da `constitution.md` feita **depois** desta baseline ter sido escrita — por isso o código ainda não reflete essas regras. Quando for resolvido, atualizar este arquivo.

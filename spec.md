# 📋 Spec — Baseline v1 (estado atual do projeto)

> Este spec não descreve uma feature nova: ele documenta **o que já existe hoje**, para servir de linha de base a partir da qual as próximas specs vão evoluir. Foi montado a partir de `docs/business-rules/rules.md`, `docs/database/erd.md`, `docs/auth/roles-permissions.md` e conferido contra o código real do `backend/src/modules` e do `mobile/lib`.

## 1. Objetivo do produto

Plataforma para músicos e roadies organizarem agendas, eventos, tarefas, repertório e finanças de suas bandas, com três frentes: web (gestão), mobile (uso em campo) e uma API central.

## 2. Atores

| Papel | Pode |
|---|---|
| **MUSICIAN** | Criar/editar eventos, tarefas e repertório da própria banda; ver transações e eventos das bandas em que participa |
| **ROADIE** | Permissões parecidas com MUSICIAN; costuma ser responsável por tarefas/logística de eventos |
| **ADMIN** | Acesso global: CRUD irrestrito de usuários, bandas, eventos e transações |

## 3. Entidades de dados (modeladas no Prisma)

- **User** — email (único), nome, role, `supabaseId` (único), telefone, instagram, cidade/UF, cachê mínimo, link do YouTube, bio, instrumentos, estilos, disponibilidade.
- **Band** — nome; tem membros, eventos, repertório e transações.
- **BandMember** — vincula User↔Band, com papel dentro da banda (ex.: owner/member), único por `[userId, bandId]`.
- **Event** — título, data, horários (`startTime`, `endTime`), tipo (`type`, default `"Show"`), cachê (`fee`), local, descrição, status (`PENDING`, `CONFIRMED`, `FINISHED`, `CANCELLED`), pertence a uma Band, tem um criador (User) e relação em cascata com `Transaction`.
- **Task** — descrição, `isDone`, pertence a um Event (cascade delete).
- **RepertoireSong** — título, artista, tom, posição, notas; pertence a uma Band.
- **Transaction** — descrição, valor (decimal), tipo (`INCOME`/`EXPENSE`), data; vinculada a Band, opcionalmente a Event (com `onDelete: Cascade`), e a um User.

## 4. O que está de fato implementado hoje (verificado no código)

### Backend (`backend/src/modules/`)
- ✅ **auth** — login via Supabase Auth, estratégia JWT com validação dinâmica de algoritmos ES256 (JWKS) e HS256 em `JwtStrategy`, `JwtAuthGuard` com logs estruturados e exceções 401 descritivas (`TOKEN_EXPIRED`, `INVALID_SIGNATURE`, `MALFORMED_TOKEN`, `MISSING_BEARER`) (Spec 012).
- ✅ **users** — CRUD completo (`POST /users`, `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id`), com testes unitários e e2e.
- ✅ **events** — CRUD completo de eventos (`POST /events`, `GET /events`, `GET /events/:id`, `PATCH /events/:id`, `DELETE /events/:id`), com DTOs validados via `class-validator` (`CreateEventDto` com `bandId` opcional, horários `startTime`/`endTime`, tipo `type` e cachê `fee`, `UpdateEventDto`), persistência completa dos novos campos, sincronização automática de `Transaction` do tipo `INCOME` quando `fee > 0`, suporte ao modelo de Workspace Unificado para músicos solo (resolução de banda existente ou auto-provisionamento de banda padrão em `EventsService.create`), autenticação via `JwtAuthGuard` vinculando `createdById` e `bandId` via Prisma, exclusão segura com integridade referencial em cascata (`onDelete: Cascade` em `Transaction`), e cobertura de testes unitários e E2E (Spec 014, Spec 015).
- ✅ **tasks** — CRUD completo de tarefas (`POST /tasks`, `GET /tasks`, `GET /tasks/:id`, `PATCH /tasks/:id`, `DELETE /tasks/:id`), com DTOs validados via `class-validator`, autorização por banda via `BandAccessService`, e cobertura de testes unitários e E2E.
- ✅ **repertoire** — CRUD completo de músicas do repertório (`POST /repertoire`, `GET /repertoire`, `GET /repertoire/:id`, `PATCH /repertoire/:id`, `DELETE /repertoire/:id`), com DTOs validados via `class-validator`, autorização por banda via `BandAccessService`, e cobertura de testes unitários e E2E.
- ✅ **transactions** — CRUD completo de lançamentos financeiros (`POST /transactions`, `GET /transactions`, `GET /transactions/:id`, `PATCH /transactions/:id`, `DELETE /transactions/:id`), com DTOs validados via `class-validator`, autorização por banda via `BandAccessService`, e cobertura de testes unitários e E2E.
- ✅ **band-access** — Módulo reutilizável `BandAccessModule` / `BandAccessService` com `getUserBandIds` e `assertMembership`, garantindo autorização restrita por associação em `BandMember` nos módulos `tasks`, `repertoire` e `transactions` (Spec 011).
- ✅ **cors-producao** — Configuração de CORS restrito por ambiente via `process.env.FRONTEND_URL` em `backend/src/main.ts`, eliminando wildcard em produção (Spec 016).

### Frontend Web (`frontend-web/src/`)
- Rotas presentes: `(auth)/login`, `(auth)/register`, `(dashboard)/dashboard`, `(dashboard)/profile`, `(admin)/admin`, `/testers`.
- Serviços de API e contexto de autenticação (`AuthContext`) existem na estrutura.
- A stack do frontend-web foi confirmada e documentada em `docs/architecture/frontend.md` (Tailwind CSS, Context API e Axios), eliminando os placeholders.
- ✅ **Autenticação e Cadastro via Supabase Auth:** Módulo `src/lib/supabase.ts` centraliza a instância do Supabase. `AuthContext` efetua autenticação real via `supabase.auth.signInWithPassword`, e `LoginForm` exibe mensagens de erro amigáveis (Spec 008). Rota `/register` acessível e integrada ao `supabase.auth.signUp` e à API do backend NestJS (`POST /users`) com mensagens de erro (Spec 010).
- ✅ **Deduplicação de `fetchProfile` e Mensagens 401:** `AuthContext` deduplica o carregamento de perfil via `useRef` garantindo disparo único de `fetchProfile`, com `LoginForm` exibindo feedbacks descritivos de erro da API (Spec 012).
- ✅ **Tipagem de Eventos:** Interface `EventEntity` em `src/types/event.ts` refletindo `startTime`, `endTime`, `type`, `fee` e metadados de compromissos para consistência dos contratos do monorepo (Spec 015).
- ✅ **Página de Distribuição para Testers & Resiliência:** Rota não-listada `/testers` criada com layout temático, validação dinâmica de integridade de links (`isValidDownloadUrl`), tratamento resiliente contra links ausentes com exibição de badge informativo ("Em breve / Aguardando build") eliminando erros 404, suporte a variáveis de ambiente (`NEXT_PUBLIC_APK_DOWNLOAD_URL`, `NEXT_PUBLIC_IPA_DOWNLOAD_URL`, `NEXT_PUBLIC_APP_VERSION`), link alternativo para GitHub Releases, e instruções completas de instalação para Android (.apk com fontes desconhecidas) e iOS (.ipa via sideload AltStore/Sideloadly com aviso de renovação de 7 dias) (Spec 016, Spec 018).

### Mobile (`mobile/lib/`)
- Telas presentes e com bastante conteúdo: login/signup (`presentation/screens/auth`), agenda/calendário (`presentation/screens/principal`), perfil (`presentation/screens/person`).
- ✅ **Camada de dados e cadastro sincronizado:** `data/datasources/remote_datasource.dart`, `data/repositories/agenda_repository_impl.dart`, `data/repositories/user_repository_impl.dart` e `auth_remote_datasource.dart` conectam a interface mobile aos endpoints do backend e ao Supabase Auth (`POST /users`), garantindo a criação de perfis no PostgreSQL com tratamento de erros na UI (Spec 010).
- ✅ **Reatividade de compromissos:** A lista de compromissos e o calendário na tela de Agenda atualizam imediatamente no aplicativo mobile após a criação/edição de eventos (Spec 007).
- ✅ **Carregamento e Salvamento do Perfil Mobile:** Injeção do JWT de sessão do Supabase no `RemoteDataSource._getHeaders()` para evitar erros HTTP 401 Unauthorized, com `UserNotifier`/`PersonScreen` expondo mensagens de erro reais na UI em vez de falhas silenciosas, com testes unitários, de widget e de integração para o fluxo de carregamento e edição do perfil (Spec 009).
- ✅ **Deduplicação de `fetchProfile` e Tratamento Visual de Erro:** `UserNotifier` com trava de requisição prevenindo execuções síncronas redundantes de `fetchProfile`, com exibição de erros 401 legíveis ao usuário via UI/SnackBar (Spec 012).
- ✅ **Rolagem da Agenda sobre o calendário:** `CustomCalendar` restringe o `TableCalendar` a `AvailableGestures.horizontalSwipe`, liberando o arraste vertical para o `SingleChildScrollView` da `PrincipalScreen`; a navegação horizontal, as setas do cabeçalho, a seleção de dias e os marcadores de eventos foram preservados e cobertos por teste de widget (Spec 013).
- ✅ **Criação e Sincronização de Compromissos com Feedback Visual:** `RemoteDataSource.saveEvent` sanitiza o payload de criação omitindo `id` local em conformidade com o `ValidationPipe` do backend; `NewAppointmentWidget` captura exceções de rede, validação ou autenticação exibindo feedback visual claro via `SnackBar` na UI em vez de falhas silenciosas; conectividade em dispositivos físicos suportada via `adb reverse` e `--dart-define=BACKEND_URL` (Spec 014).
- ✅ **Extensão de Eventos, Exclusão com Confirmação e Refinamento de Layout:** `EventModel.toCreatePayload()` e `fromMap()` persistem e desserializam `startTime`, `endTime`, `type` e `fee`; `CommitmentCard` implementa exclusão de compromissos com diálogo interativo de confirmação (`showDialog`) acionando `AgendaController.deleteEvent(id)` e feedback visual via `SnackBar`; `NewAppointmentWidget` com renderização dinâmica do campo Cachê (visível apenas para `Show` e `Gravação`), expansão do campo Local e botão de ação centralizado (Spec 015).
- ✅ **Padronização de Logging & Identidade Oficial do App:** Utilitário `AppLogger` (`mobile/lib/core/utils/app_logger.dart`) centralizado com métodos `info`, `warning` e `error` operando sob proteção de tempo de compilação com `kDebugMode`, sanitização total de dados sensíveis e eliminação de tokens JWT em logs do `logcat`, suíte de testes unitários dedicada (`app_logger_test.dart`), e identidade visual do app configurada para `"My Roadie"` em `AndroidManifest.xml` (Spec 016).

### Infraestrutura & Pipeline CI/CD (`.github/workflows/ci.yml`)
- ✅ **Pipeline CI/CD Unificado & Distribuição Automatizada de Releases:** Workflow completo no GitHub Actions com detecção de alterações por diretório via `dorny/paths-filter@v3` configurado com `base: ${{ github.base_ref }}` (evitando diffs vazios em pushes/merges para a `main`), disparo manual `workflow_dispatch` com parâmetros (`scope`, `backend_url`, `run_mobile_e2e`, `publish_release`), testes E2E automatizados do backend (`npm run test:e2e` via Jest e mocks de JWKS) e do frontend web (Playwright headless Chromium validando rotas públicas, privadas e `/testers`), gancho preparatório de E2E Mobile sob demanda para a Spec 019, compilação e publicação simétrica de artefatos de release (`my-roadie-release.apk` Android e `my-roadie-release.ipa` iOS empacotado em runner macOS) com injeção segura de `BACKEND_URL` via segredos, job automatizado de distribuição `publish-github-release` criando GitHub Releases públicas permanentes com assets anexados ao criar tags `v*`, caching multi-camadas (npm, Flutter pub e Gradle), e Continuous Deployment automatizado via webhooks para Render (backend) e Vercel (frontend) condicionados ao sucesso dos builds na branch `main` (Spec 017, Spec 018).
- ✅ **Hospedagem e Distribuição de Executáveis do MVP (Spec 018):** a infraestrutura de release foi integrada à baseline: a rota `/testers` valida `NEXT_PUBLIC_APK_DOWNLOAD_URL`, `NEXT_PUBLIC_IPA_DOWNLOAD_URL` e `NEXT_PUBLIC_APP_VERSION`, mantém fallback resiliente para ambientes sem build publicada, e a distribuição de binários usa URLs públicas permanentes por tag/latest em GitHub Releases (com suporte de alternativa em Supabase Storage), sem expor segredos nem quebrar o fluxo de download para testers.

## 5. Regras de negócio confirmadas (das que já têm API)

1. Conta é criada no Supabase Auth e depois o perfil é criado no backend usando o `supabaseId`.
2. Rotas protegidas exigem JWT válido (com verificação de algoritmo ES256/JWKS e HS256, gerando exceções descritivas como `TOKEN_EXPIRED`, `INVALID_SIGNATURE`, `MALFORMED_TOKEN` e `MISSING_BEARER` no `JwtAuthGuard`).
3. Um usuário só atualiza/deleta o próprio perfil, a menos que seja `ADMIN`.
4. Eventos pertencem a uma Band; na criação sem `bandId` explícito, o backend resolve o workspace existente do usuário ou auto-provisiona uma banda padrão; edição/exclusão é restrita a criador, membro com permissão, ou `ADMIN`.
5. `ValidationPipe` com whitelist rígida: payloads com campos extras (`id`, `createdAt`, `updatedAt`) são rejeitados com 400.
6. Recursos dos módulos `tasks`, `repertoire` e `transactions` exigem associação à `Band` dona via `BandMember` (`403 Forbidden` para não-membros), exceto para `ADMIN` (acesso global). `GET` sem `bandId` filtra automaticamente pelas bandas do usuário (Spec 011).
7. O carregamento de perfil (`fetchProfile`) é executado estritamente uma única vez por ciclo de autenticação na Web e no Mobile, evitando chamadas duplicadas ao backend.
8. A criação ou atualização de eventos com cachê (`fee > 0`) sincroniza automaticamente uma receita (`INCOME`) no módulo de transações vinculada ao evento (`eventId`). A remoção de um evento exclui em cascata suas transações vinculadas (Spec 015).

## 6. Fora do escopo desta baseline (não construído ainda)

- Módulo de **logística** — citado como exemplo em `docs/architecture/backend.md` (`ex: events, users, logistics`), mas não existe nenhum código para isso. É uma menção aspiracional, não uma feature.
- Exposição via API de **Transaction** (resolvido na spec 006; API de Tasks na spec 004, API de Repertoire na spec 005).
- Integração do mobile com a API real (resolvido na spec 003).

## 7. Critério de "pronto" desta baseline

Esta spec serve como referência congelada. Ela é considerada válida enquanto bater com o código — atualizada após a conclusão da Hospedagem e Distribuição de Executáveis de Release do MVP (Spec 018) e o fechamento de todos os itens priorizados da Fase 1 do backlog. A entrega desta fase incluiu estabilização completa do ecossistema, segurança JWT/CORS, release do MVP para testes fechados com links estáveis e permanentes via GitHub Releases, saneamento de CI/CD (paths-filter e injeção de segredos), suítes de testes unitários e E2E, caching multi-camadas, e automação de Continuous Deployment. Se qualquer item da seção 4 mudar nas próximas specs, este arquivo deve ser atualizado na spec correspondente.


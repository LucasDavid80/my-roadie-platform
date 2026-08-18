# Spec — 014: Corrigir Criação de Compromisso no Dispositivo Físico

## Objetivo

Investigar e corrigir a falha em que a criação e sincronização de novos compromissos (eventos) não funciona ao utilizar o aplicativo mobile em um dispositivo físico, garantindo que o backend persista os eventos corretamente, que o app mobile envie os payloads adequados e forneça feedback visual imediato em caso de falha de rede, autenticação ou validação.

## Por quê

- **Impacto alto (bug crítico/agenda)**: A agenda de eventos é a funcionalidade central do My Roadie. A incapacidade de criar compromissos em um aparelho físico inviabiliza o uso em campo por músicos e roadies.
- **Diagnóstico preliminar & Validação (Fase 0)**:
  1. **Rotas de Eventos no Backend desabilitadas (Erro 404)**: No arquivo `backend/src/modules/events/events.controller.ts`, todos os endpoints (`@Post`, `@Get`, etc.) estão comentados, resultando em respostas `404 Not Found` (`{"message": "Cannot POST /events", "error": "Not Found", "statusCode": 404}`) para qualquer requisição enviada a `/events`.
  2. **Rejeição por Validação Global (Erro 400)**: Em `backend/src/main.ts`, o `ValidationPipe` está configurado com `whitelist: true` e `forbidNonWhitelisted: true`. O envio de campos não declarados no DTO (como o `id` gerado pelo cliente em `EventModel.toMap()`) é imediatamente rejeitado com `400 Bad Request` (`{"message": ["property id should not exist"], "error": "Bad Request", "statusCode": 400}`).
  3. **Fluxo Mobile e Tratamento Silencioso de Exceções**: A cadeia de chamadas mobile é composta por:
     - `NewAppointmentWidget` -> gera `newEvent` com `id: DateTime.now().toString()`, chama `widget.onConfirm(newEvent)` e possui um bloco `catch (e) {}` vazio que descarta silenciosamente qualquer exceção sem emitir `SnackBar` ou indicação visual;
     - `AgendaController.addOrUpdateEvent` -> chama `_repository.saveEvent(event)` e propaga via `rethrow`;
     - `AgendaRepositoryImpl.saveEvent` -> converte `EventEntity` em `EventModel` e chama `RemoteDataSource.saveEvent(model)`;
     - `RemoteDataSource.saveEvent` -> serializa `event.toMap()` (enviando `id`) via `POST /events` com headers autenticados e lança `UnauthorizedException`, `ServerException` ou `NetworkException` quando o status difere de 200/201.
  4. **Configuração de Rede em Dispositivos Físicos**: Em dispositivos físicos Android/iOS, `localhost` e `10.0.2.2` não alcançam o backend na máquina de desenvolvimento sem `--dart-define=BACKEND_URL` ou comando de proxy `adb reverse tcp:3000 tcp:3000`.

## Escopo

1. **Backend (`backend/`)**:
   - Ativar e estruturar o módulo `events` (`EventsController`, `EventsService`, `EventsModule` importando `PrismaModule`) com validação DTO (`CreateEventDto`, `UpdateEventDto`) e testes unitários/E2E.
   - Campos do modelo `Event` no Prisma a serem suportados: `title` (String), `date` (DateTime), `location` (String), `description` (String?), `bandId` (UUID de `Band`), `createdById` (UUID de `User` via JWT), `status` (`EventStatus`: `PENDING`, `CONFIRMED`, `FINISHED`, `CANCELLED`).
   - Garantir compatibilidade com `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`) e persistência no PostgreSQL via Prisma.
   - Vincular eventos automaticamente ao usuário autenticado (`createdById` via `@CurrentUser()` / `req.user.id`) e à banda selecionada (`bandId`).
2. **Mobile (`mobile/`)**:
   - Ajustar `RemoteDataSource` e `EventModel` para sanitizar payloads de criação/atualização (não enviar `id` autogerado na criação e incluir `bandId`).
   - Adicionar tratamento visual explícito de erro no formulário `NewAppointmentWidget` e na tela `PrincipalScreen` (SnackBar informativo de erro de rede, validação ou não autorização).
   - Documentar e validar a instrução de conexão para dispositivos físicos (`adb reverse` ou `--dart-define=BACKEND_URL`).
3. **Testes**:
   - Testes unitários e E2E no backend para o módulo `events`.
   - Testes unitários e de widget no mobile para criação de eventos com sucesso e tratamento de erros.

## Fora de escopo

- Redesenho visual completo do card de compromisso ou do formulário.
- Sincronização offline-first com banco local (Hive/SQLite) — reservado para a spec de persistência offline (Fase 3 do backlog).
- Notificações push de eventos (Fase 4 do backlog).

## Critério de sucesso

- [x] `POST /events` no backend ativo, autenticado via JWT e persistindo eventos no banco de dados com testes unitários e E2E passando.
- [x] Mobile envia requisições de criação de eventos com payload compatível com o backend.
- [x] `NewAppointmentWidget` exibe SnackBar legível com mensagem descritiva caso a requisição falhe (erro 400, 401, 500 ou queda de rede), mantendo os dados preenchidos no formulário para reenvio.
- [x] Criação de compromisso funciona de ponta a ponta no dispositivo físico conectado ao backend local (via `adb reverse` ou IP configurado).
- [x] Todos os testes automatizados do backend e mobile passando sem regressões.
- [x] `backlog.md` atualizado com o status concluído ao finalizar a spec.

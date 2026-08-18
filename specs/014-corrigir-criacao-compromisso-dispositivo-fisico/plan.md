# Plan — 014: Corrigir Criação de Compromisso no Dispositivo Físico

## Diagnóstico Técnico Detalhado

O fluxo de criação de compromissos no app mobile falha silenciosamente quando executado em um dispositivo físico devido a múltiplos fatores interdependentes:

1. **Endpoints de Eventos no Backend NestJS Inativos**:
   - O arquivo `backend/src/modules/events/events.controller.ts` está com os decoradores e métodos `@Post()`, `@Get()`, etc. comentados. Qualquer tentativa de requisição HTTP (`POST /events` ou `GET /events`) retorna `404 Cannot POST /events`.
2. **Tratamento de Exceção Silencioso na UI (`NewAppointmentWidget`)**:
   - Ao clicar no botão "Criar Compromisso", o método chama `await widget.onConfirm(newEvent)`.
   - Se ocorrer qualquer exceção (como `ServerException`, `UnauthorizedException`, `NetworkException` ou erro 404), o bloco `catch (e)` apenas absorve o erro sem notificar o usuário, deixando o modal aberto sem nenhum feedback.
3. **Incompatibilidade de Payload (`EventModel.toMap` e Prisma Schema)**:
   - `EventModel.toMap()` envia o campo `'id': id` (gerado como `DateTime.now().toString()`).
   - O backend NestJS aplica `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`. Enviar um `id` cliente para uma criação de entidade que usa UUID/CUID gerenciado pelo Prisma pode disparar `400 Bad Request`.
   - Campos de evento no Prisma (`title`, `date`, `location`, `description`, `status`, `bandId`, `createdById`) precisam estar alinhados com o `CreateEventDto` e a entidade `EventModel` no Flutter.
4. **Resolução de Host em Dispositivo Físico**:
   - `AppConfig.defaultBackendUrl` resolve para `http://10.0.2.2:3000` em emuladores Android e `http://localhost:3000` no Desktop/Web.
   - Em um celular real conectado via USB, `10.0.2.2` e `localhost` apontam para o próprio celular.
   - É necessário documentar e suportar claramente o encaminhamento de porta `adb reverse tcp:3000 tcp:3000` (quando em USB) ou `--dart-define=BACKEND_URL=http://<IP_LOCAL>:3000`.

## Visão Geral da Solução

1. **Habilitar e Padronizar o Módulo de Eventos no Backend**:
   - Descomentar e estruturar `EventsController` e `EventsService` com injeção de dependência do `PrismaService`.
   - Criar `CreateEventDto` e `UpdateEventDto` com validações via `class-validator` (`@IsNotEmpty`, `@IsString`, `@IsDateString`, `@IsOptional`, etc.).
   - Obter o usuário autenticado via `@UseGuards(JwtAuthGuard)` e vincular o criador (`createdById`) e a banda correspondente.
2. **Sanitizar Payload e Expor Erros na UI Mobile**:
   - No `RemoteDataSource.saveEvent`, garantir que para novos eventos o payload não inclua `id` se o backend não permitir, ou envie os campos compatíveis.
   - No `NewAppointmentWidget`, capturar exceções durante `widget.onConfirm(newEvent)` e exibir um `SnackBar` informativo (ou mensagem de alerta dentro do dialog) com o erro ocorrido (ex.: "Erro ao conectar ao servidor", "Sessão expirada", ou a mensagem retornada pela API).
3. **Configuração e Testes em Dispositivo Físico**:
   - Validar testes unitários e de widget com mocks e com a API real.
   - Fornecer instruções claras para execução em aparelho físico via `adb reverse tcp:3000 tcp:3000` ou `--dart-define=BACKEND_URL`.

## Arquitetura & Modificações Técnicas

### Mapeamento de Campos e Contratos (Prisma ⇄ Backend DTO ⇄ Mobile)

| Campo Prisma | Tipo Prisma | CreateEventDto | Mobile EventModel | Observações |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String (UUID)` | *Omitido no POST* | *Omitido no POST* | Gerado automaticamente pelo Prisma |
| `title` | `String` | `@IsString() @IsNotEmpty()` | `String` | Título do compromisso / evento |
| `date` | `DateTime` | `@IsDateString()` | `DateTime (ISO 8601)` | Data/hora do evento |
| `location` | `String` | `@IsString() @IsNotEmpty()` | `String` | Local do evento |
| `description` | `String?` | `@IsOptional() @IsString()` | `String? (notes)` | Descrição / anotações |
| `bandId` | `String (UUID)` | `@IsUUID() @IsNotEmpty()` | `String` | FK da banda relacionada |
| `status` | `EventStatus` | `@IsOptional() @IsEnum(EventStatus)` | *Default PENDING* | Status do compromisso |
| `createdById` | `String (UUID)` | *Injetado via JWT no Service* | *Via Bearer Token* | Extraído do usuário autenticado |

### Backend (`backend/`)
- `src/modules/events/events.module.ts`: Importar `PrismaModule` para prover `PrismaService`.
- `src/modules/events/dto/create-event.dto.ts`: Definir campos com decoradores do `class-validator` (`title`, `date`, `location`, `description`, `bandId`, `status`).
- `src/modules/events/dto/update-event.dto.ts`: Usar `PartialType(CreateEventDto)`.
- `src/modules/events/events.controller.ts`: Descomentar e proteger rotas com `@UseGuards(JwtAuthGuard)` e injetar usuário autenticado via decorator.
- `src/modules/events/events.service.ts`: Injetar `PrismaService` e implementar métodos CRUD interagindo com `prisma.event`, conectando `createdBy` e `band`.
- `src/modules/events/events.controller.spec.ts` & `events.service.spec.ts`: Cobertura de testes unitários com mock do `PrismaService`.
- `test/events.e2e-spec.ts`: Testes ponta a ponta das rotas de eventos.

### Mobile (`mobile/`)
- `lib/data/datasources/remote_datasource.dart`: Sanitizar payload no método `saveEvent` e tratar respostas de erro (`400`, `401`, `404`, `500`).
- `lib/presentation/widgets/new_appointment_widget.dart`: Adicionar exibição de `ScaffoldMessenger.of(context).showSnackBar` ou feedback de erro ao capturar exceção no salvamento.
- `lib/presentation/controllers/agenda_controller.dart`: Garantir que `addOrUpdateEvent` propague erros para a UI para permitir tratamento visual adequado.
- `test/`: Testes automatizados cobrindo o fluxo de criação com sucesso e tratamento de erros.

## Conformidade com a Constituição (`constitution.md`)

- **§1 Stack**: NestJS (backend) + PostgreSQL (Prisma) + Flutter (mobile).
- **§2 Arquitetura Modular**: Módulo `events` no backend isolado; mobile com camadas `data/`, `domain/`, `presentation/`.
- **§4 Segurança e Autenticação**: Rotas de criação de eventos protegidas por `JwtAuthGuard`.
- **§5 Qualidade e Testes**: Testes unitários e E2E no backend, testes unitários e de widget no Flutter.
- **§7 Commits e PR**: Branch dedicada `spec/014-corrigir-criacao-compromisso-dispositivo-fisico`, commits atômicos por task conforme `tasks.md`.

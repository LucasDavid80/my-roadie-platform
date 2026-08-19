# Plan — 014: Corrigir Criação de Compromisso no Dispositivo Físico

## Diagnóstico Técnico Detalhado

O fluxo de criação de compromissos no app mobile falhou ao ser testado no dispositivo físico devido aos seguintes pontos:

1. **Endpoints de Eventos no Backend NestJS Inativos (Resolvido na Fase 1)**:
   - O arquivo `backend/src/modules/events/events.controller.ts` estava com os endpoints comentados. Foram reativados e protegidos com `JwtAuthGuard`.
2. **Tratamento de Exceção Silencioso na UI (`NewAppointmentWidget`) (Resolvido na Fase 2)**:
   - Foi adicionado `ScaffoldMessenger.of(context).showSnackBar` para apresentar o erro real retornado pelo servidor em caso de falha.
3. **Bloqueio por `bandId` Obrigatório no Backend**:
   - `CreateEventDto` validava `bandId` com `@IsNotEmpty() @IsUUID('4')`.
   - No app mobile, na criação de novos eventos de um usuário solo (ou sem banda selecionada), o `bandId` é `null`.
   - O `ValidationPipe` rejeitou com `400 Bad Request` (`"O bandId é obrigatório; O bandId deve ser um UUID válido"`).
4. **Modelo de Workspace e Multi-tenancy**:
   - Cada evento no Prisma possui obrigatoriamente um `bandId`.
   - Para suportar músicos individuais e usuários recém-cadastrados de forma transparente e segura, adota-se o **Modelo de Workspace Unificado (Músico Individual = Banda Solo de 1 Pessoa)**.
5. **Resolução de Host em Dispositivo Físico**:
   - Em um celular real conectado via USB, `10.0.2.2` e `localhost` apontam para o próprio celular.
   - O encaminhamento de porta `adb reverse tcp:3000 tcp:3000` (quando em USB) ou `--dart-define=BACKEND_URL=http://<IP_LOCAL>:3000` viabiliza a comunicação.

## Visão Geral da Solução

1. **Modelo de Workspace Unificado no Backend (`EventsService.create`)**:
   - No `CreateEventDto`, tornar `bandId` opcional com `@IsOptional() @IsUUID('4')`.
   - No `EventsService.create`:
     - Se `bandId` for fornecido: valida a associação do usuário via `BandAccessService.assertMembership`.
     - Se `bandId` NÃO for fornecido:
       1. Consulta as bandas do usuário via `BandAccessService.getUserBandIds(user.userId)`.
       2. Se o usuário já possuir ao menos uma banda cadastrada em `BandMember`, seleciona a primeira banda/workspace.
       3. Se o usuário não tiver nenhuma banda vinculada (usuário recém-criado ou solo), o backend auto-provisiona uma banda padrão (ex.: `"Projeto Solo - <Nome do Usuário>"` ou `"Minha Banda"`), associa o usuário como membro em `BandMember` e utiliza esse `bandId` para persistir o `Event`.
2. **Sanitização de Payload e Exposição de Erros no Mobile**:
   - `RemoteDataSource.saveEvent` envia o payload sanitizado e inclui `bandId` se presente no `EventModel`.
   - `NewAppointmentWidget` captura exceções e exibe feedback visual amigável via SnackBar.
3. **Configuração e Testes em Dispositivo Físico**:
   - Testes automatizados unitários e E2E no backend cobrindo criação com `bandId` explícito e auto-provisionamento de workspace solo quando omitido.
   - Execução e validação no dispositivo físico via `adb reverse tcp:3000 tcp:3000`.

## Arquitetura & Modificações Técnicas

### Mapeamento de Campos e Contratos (Prisma ⇄ Backend DTO ⇄ Mobile)

| Campo Prisma | Tipo Prisma | CreateEventDto | Mobile EventModel | Observações |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String (UUID)` | *Omitido no POST* | *Omitido no POST* | Gerado automaticamente pelo Prisma |
| `title` | `String` | `@IsString() @IsNotEmpty()` | `String` | Título do compromisso / evento |
| `date` | `DateTime` | `@IsDateString()` | `DateTime (ISO 8601)` | Data/hora do evento |
| `location` | `String` | `@IsString() @IsNotEmpty()` | `String` | Local do evento |
| `description` | `String?` | `@IsOptional() @IsString()` | `String? (notes)` | Descrição / anotações |
| `bandId` | `String (UUID)` | `@IsOptional() @IsUUID('4')` | `String?` | Opcional no POST; resolvido/auto-criado pelo backend se ausente |
| `status` | `EventStatus` | `@IsOptional() @IsEnum(EventStatus)` | *Default PENDING* | Status do compromisso |
| `createdById` | `String (UUID)` | *Injetado via JWT no Service* | *Via Bearer Token* | Extraído do usuário autenticado |

### Backend (`backend/`)
- `src/modules/events/dto/create-event.dto.ts`: Alterar `bandId` para `@IsOptional() @IsUUID('4')`.
- `src/modules/events/events.service.ts`: Implementar resolução de workspace solo em `create(createEventDto, user)`.
- `src/modules/events/events.service.spec.ts` & `test/events.e2e-spec.ts`: Atualizar e adicionar casos de teste para criação de evento com e sem `bandId`.

### Mobile (`mobile/`)
- `lib/data/datasources/remote_datasource.dart`: `saveEvent` sanitiza payload enviando campos compatíveis.
- `lib/presentation/widgets/new_appointment_widget.dart`: Tratamento visual e feedback com SnackBar.
- `test/`: Testes automatizados cobrindo o fluxo de criação com sucesso e tratamento de erros.

## Conformidade com a Constituição (`constitution.md`)

- **§1 Stack**: NestJS (backend) + PostgreSQL (Prisma) + Flutter (mobile).
- **§2 Arquitetura Modular**: Módulo `events` no backend isolado; mobile com camadas `data/`, `domain/`, `presentation/`.
- **§4 Segurança e Autenticação**: Rotas de criação de eventos protegidas por `JwtAuthGuard`.
- **§5 Qualidade e Testes**: Testes unitários e E2E no backend, testes unitários e de widget no Flutter.
- **§7 Commits e PR**: Branch dedicada `spec/014-corrigir-criacao-compromisso-dispositivo-fisico`, commits atômicos por task conforme `tasks.md`.

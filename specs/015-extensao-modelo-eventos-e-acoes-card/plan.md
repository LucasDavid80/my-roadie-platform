# Plan — 015: Extensão do Modelo de Eventos & Ações do Card de Compromisso

## Visão Geral da Solução

Esta especificação estende o ecossistema de eventos de ponta a ponta com sincronização financeira integrada:
1. **Banco de dados (Prisma)**: Inclusão das colunas `startTime`, `endTime`, `type` e `fee` na tabela `Event`, com integridade referencial `onDelete: Cascade` em `Transaction.event`.
2. **Backend (NestJS)**: Atualização de DTOs (`CreateEventDto`, `UpdateEventDto`), entidade e service para validação, persistência, sincronização automática de `Transaction` do tipo `INCOME` para cachês (`fee > 0`) e exclusão segura.
3. **Frontend Web**: Tipagem `EventEntity` em `src/types/` mantendo paridade com o modelo do backend.
4. **Mobile (Flutter)**: Envio completo dos campos no payload de criação/atualização, tratamento de exclusão de compromissos com confirmação no `CommitmentCard`, e ajustes de layout/alinhamento no modal `NewAppointmentWidget`.

---

## Arquitetura & Modificações Técnicas

### 1. Mapeamento de Campos e Contratos

| Campo Prisma | Tipo Prisma | CreateEventDto | Mobile EventModel | Observações |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String (UUID)` | *Omitido no POST* | *Omitido no POST* | PK gerada pelo banco |
| `title` | `String` | `@IsString() @IsNotEmpty()` | `String` | Título do compromisso |
| `date` | `DateTime` | `@IsDateString()` | `DateTime` | Data base do compromisso |
| `startTime` | `String?` | `@IsOptional() @IsString()` | `String` (ex: "19:30") | Horário de início |
| `endTime` | `String?` | `@IsOptional() @IsString()` | `String` (ex: "23:00") | Horário de término |
| `type` | `String?` | `@IsOptional() @IsString()` | `String` (ex: "Show") | Tipo de compromisso |
| `fee` | `Decimal? @db.Decimal(10, 2)` | `@IsOptional() @IsNumber()` | `double` | Valor do cachê (alimenta `Transaction`) |
| `location` | `String` | `@IsString() @IsNotEmpty()` | `String` | Localização do evento |
| `description` | `String?` | `@IsOptional() @IsString()` | `String? (notes)` | Anotações adicionais |
| `bandId` | `String (UUID)` | `@IsOptional() @IsUUID('4')` | `String?` | Opcional (resolvido pelo backend) |
| `status` | `EventStatus` | `@IsOptional() @IsEnum(EventStatus)` | *Default PENDING* | Status do evento |
| `createdById` | `String (UUID)` | *Injetado via JWT* | *Via Bearer Token* | Usuário criador |

---

### 2. Detalhamento por Camada

#### A. Banco de Dados & Schema (`backend/prisma/schema.prisma`)
- Adicionar ao model `Event`:
  ```prisma
  startTime    String?
  endTime      String?
  type         String?       @default("Show")
  fee          Decimal?      @db.Decimal(10, 2)
  ```
- Ajustar relation em `Transaction`:
  ```prisma
  event        Event?          @relation(fields: [eventId], references: [id], onDelete: Cascade)
  ```
- Executar `npx prisma generate`.
- Atualizar documentação em `docs/database/erd.md`.

#### B. Backend NestJS (`backend/src/modules/events/`)
- `dto/create-event.dto.ts`:
  - Adicionar `@IsOptional() @IsString() startTime?: string;`
  - Adicionar `@IsOptional() @IsString() endTime?: string;`
  - Adicionar `@IsOptional() @IsString() type?: string;`
  - Adicionar `@IsOptional() @IsNumber() fee?: number;`
- `dto/update-event.dto.ts`:
  - Herda automaticamente de `CreateEventDto`.
- `entities/event.entity.ts`:
  - Atualizar propriedades para refletir os novos campos.
- `events.service.ts`:
  - **No `create`**:
    - Persistir `startTime`, `endTime`, `type`, `fee` no Prisma.
    - Se `createEventDto.fee > 0`, criar uma `Transaction`:
      ```ts
      await this.prisma.transaction.create({
        data: {
          description: `Cachê - ${createdEvent.title}`,
          amount: new Prisma.Decimal(createEventDto.fee),
          type: TransactionType.INCOME,
          date: createdEvent.date,
          bandId: resolvedBandId,
          userId,
          eventId: createdEvent.id,
        },
      });
      ```
  - **No `update`**:
    - Atualizar campos definidos do evento.
    - Sincronizar transação vinculada (`Transaction` onde `eventId === id` e `type === TransactionType.INCOME`):
      - Se `fee` foi alterado e `fee > 0`: atualiza o `amount` da transação ou cria se não existia.
      - Se `fee` foi zerado/removido: exclui a transação automática associada.
      - Se `title` mudou: atualiza a `description` da transação para refletir o novo título.
  - **No `remove`**:
    - Exclui o evento (e transações vinculadas via cascade ou remoção explícita).
- Testes:
  - Atualizar mocks e asserções em `events.service.spec.ts`, `events.controller.spec.ts` e `test/events.e2e-spec.ts` cobrindo a criação/sincronização de `Transaction`.

#### C. Frontend Web (`frontend-web/`)
- Adicionar interface `EventEntity` em `frontend-web/src/types/event.ts` mantendo paridade com o modelo do backend.

#### D. Mobile Flutter (`mobile/`)
- `lib/domain/models/event_model.dart`:
  - Ajustar `toCreatePayload()` para incluir `startTime`, `endTime`, `type`, `fee` no payload enviado para o NestJS.
  - Validar parsing em `fromMap()` para `fee` e horários.
- `lib/presentation/screens/principal/widgets/commitment_card.dart`:
  - Trocar o ícone estático de delete por um `IconButton` com confirmação interativa (`showDialog` com alerta de confirmação de exclusão).
  - Receber callback `onDelete: Future<void> Function(String id)` e exibir feedback (`SnackBar`).
- `lib/presentation/screens/principal/widgets/commitments_widget.dart` & `principal_screen.dart`:
  - Conectar o callback `onDelete` ao `ref.read(agendaProvider.notifier).deleteEvent(id)`.
- `lib/presentation/widgets/new_appointment_widget.dart`:
  - Ajustar padding e espaçamento horizontal para layout limpo e proporcional.
  - Exibição dinâmica do campo `Cachê`: renderizado apenas se o tipo selecionado for `Show` ou `Gravação`. Para `Ensaio` e `Reunião`, o input de `Local` expande em largura total e `fee` é definido como 0.
  - Centralizar botão de ação principal ("Criar Compromisso" / "Salvar Alterações").
- Testes:
  - Atualizar e criar testes em `mobile/test/` para `AgendaController.deleteEvent`, `EventModel` e `CommitmentCard`.

---

## Conformidade com a Constituição (`constitution.md`)

- **§1 Stack**: Mantida sem alterações (NestJS + Prisma + Next.js + Flutter).
- **§2 Arquitetura Modular**: Módulo `events` no backend; Clean Architecture no mobile (`domain/`, `data/`, `presentation/`).
- **§3 Contrato Backend ⇄ Frontend/Mobile**: `ValidationPipe` com whitelist respeitado; `toCreatePayload()` envia apenas campos válidos. Mudança no Prisma seguida de `npx prisma generate` e atualização de `erd.md`.
- **§4 Autenticação e Autorização**: `DELETE /events/:id` e `PATCH /events/:id` protegidos por `JwtAuthGuard` e verificando associação à banda via `BandAccessService`.
- **§5 Qualidade e Testes**: Casos positivos e de erro cobertos por testes unitários e E2E.
- **§7 Commits e PR**: Branch dedicada `spec/015-extensao-modelo-eventos-e-acoes-card`, commits atômicos por tarefa conforme `tasks.md`.

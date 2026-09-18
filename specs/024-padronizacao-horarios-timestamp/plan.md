# Plano Técnico — 024: Padronização de Horários com Timestamps

## 1. Arquitetura e Decisões Técnicas
- O campo atual `date` (DateTime isolado) e os horários `startTime`, `endTime` (String "HH:mm") são convertidos em `startsAt` (DateTime), `endsAt` (DateTime?) e `timezone` (String).
- Todos os timestamps devem ser gravados em UTC no banco de dados. O campo `timezone` (ex: "America/Sao_Paulo") ancora o evento ao local físico, garantindo exibição local consistente independentemente de onde o usuário estiver.
- Na hora de migrar os dados legados (migration em múltiplos passos), deve-se ler o `date` de cada evento, combinar com `startTime`/`endTime` e injetar a hora ajustada em UTC, inferindo o timezone do criador do evento ou da banda.
- Atualização do Prisma Schema e DTOs no backend com validações rigorosas na camada de DTO, via um decorator customizado `@IsAfterDate('startsAt')` para garantir que `endsAt` seja posterior a `startsAt`.
- **Decisão de UX/UI:** Nos formulários de criação/edição (Web e Mobile), os três inputs antigos (`[Data]`, `[Início]`, `[Fim]`) devem ser consolidados em dois blocos de seleção: **"Data e Hora de Início" (obrigatório)** e **"Data e Hora de Fim" (opcional)**, incluindo a seleção/exibição do timezone.
- **Transição para Histórico (Mobile):** Para impedir que eventos da madrugada pulem prematuramente para a aba de histórico antes de terminarem, a separação de eventos passados e futuros no `AgendaController` passará a se basear no `endsAt` (com fallback para `startsAt + 2h`). Os eventos passam a ser descartados da lista principal imediatamente após o encerramento.
- **Label Visual (Mobile):** Adição do label "Hoje" para eventos do dia corrente na listagem de próximos compromissos.

## 2. Modelagem de Dados / Contratos
### Prisma Schema (`backend/prisma/schema.prisma`)
```prisma
model Event {
  // ... campos atuais ...
  startsAt DateTime
  endsAt   DateTime?
  timezone String   @default("America/Sao_Paulo")
  // Remover date, startTime e endTime após backfill
}
```

### Contrato Backend (DTOs)
```typescript
export class CreateEventDto {
  @IsDateString()
  startsAt: string;

  @IsOptional()
  @IsDateString()
  @IsAfterDate('startsAt', { message: 'endsAt must be after startsAt' })
  endsAt?: string;

  @IsString()
  timezone: string;
}
```

## 3. Estrutura de Arquivos Afetados
- `backend/prisma/schema.prisma`
- `backend/src/events/dto/create-event.dto.ts`
- `backend/src/events/dto/update-event.dto.ts`
- `backend/src/events/events.service.ts`
- `frontend-web/src/types/index.ts`
- `frontend-web/src/app/(dashboard)/.../EventForm.tsx` (exemplo)
- `mobile/lib/domain/entities/event_entity.dart`
- `mobile/lib/data/models/event_model.dart`
- `mobile/lib/presentation/widgets/new_appointment_widget.dart`
- `mobile/lib/presentation/controllers/agenda_controller.dart`

## 4. Estratégia de Testes
- Atualizar testes de unidade do `AgendaController` no mobile para injetar e testar as novas lógicas temporais (inclusive lógicas para calcular "próximos eventos").
- No backend, escrever testes no `EventsService` para validar as regras de `startsAt` e `endsAt`.
- Testar o rollback e conversão do banco de dados na base mock/local antes de ir para CI.
- Realizar validação e testes manuais mandatórios em **dispositivo físico** para os casos não cobertos fielmente por simuladores (ex: mudanças de Timezone do SO em tempo real, disparo e recebimento de push notifications / alarmes em background na transição da madrugada).
- Garantir 80%+ de cobertura após refatorações.

> **DevLog (Patch Pós-Fechamento):** Após o fechamento desta spec, identificou-se no commit `93cfbce` que testes estavam falhando devido a fragilidades residuais:
> 1. No `agenda_controller_test.dart`, o teste de separação de eventos assumia fixamente "8:00 AM" como evento futuro, o que quebrava o teste se a execução CI ocorresse à tarde. Corrigido para `now.add(1h)`.
> 2. No `remote_datasource_test.dart`, o teste de payload hardcodava a string local `2026-07-16T20:00:00.000` enquanto o modelo serializava nativamente em UTC (`toUtc().toIso8601String()`).
> 3. No backend (`events.service.spec.ts`), foram adicionados testes pendentes de cobertura, validando o fallback da criação de usuário (resolveDbUser) e o update relacional com transações em cima dos novos timestamps.

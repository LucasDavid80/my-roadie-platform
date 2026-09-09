# Plano Técnico — 024: Padronização de Horários com Timestamps

## 1. Arquitetura e Decisões Técnicas
- O campo atual `date` (DateTime isolado) e os horários `startTime`, `endTime` (String "HH:mm") são convertidos em `startsAt` (DateTime) e `endsAt` (DateTime?).
- Todos os timestamps devem ser gravados em UTC no banco de dados e convertidos para o fuso horário local nos frontends (Mobile/Web) ao serem exibidos/selecionados.
- Na hora de migrar os dados legados, deve-se ler o `date` de cada evento, combinar com `startTime`/`endTime` e injetar a hora ajustada na criação de `startsAt`/`endsAt`.
- Atualização do Prisma Schema e DTOs no backend com validações rigorosas (ex: `endsAt` > `startsAt`).

## 2. Modelagem de Dados / Contratos
### Prisma Schema (`backend/prisma/schema.prisma`)
```prisma
model Event {
  // ... campos atuais ...
  startsAt DateTime
  endsAt   DateTime?
  // Remover date, startTime e endTime
}
```

### Contrato Backend (DTOs)
```typescript
export class CreateEventDto {
  @IsDateString()
  startsAt: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;
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
- Garantir 80%+ de cobertura após refatorações.

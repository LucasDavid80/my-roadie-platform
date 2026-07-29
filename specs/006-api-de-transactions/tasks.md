# Tasks — 006: API de Transactions

Pré-requisitos: nenhum.

## Fase 1 — Setup de DTOs e Estrutura do Módulo

- [x] T1.1 — Criar os DTOs `CreateTransactionDto` e `UpdateTransactionDto` em `backend/src/modules/transactions/dto/`.
  - Critério: DTOs utilizam `class-validator` e `class-transformer` (`IsString`, `IsNotEmpty`, `IsNumber`, `IsPositive`, `IsEnum`, `IsDateString`, `IsUUID`, `IsOptional`) e respeitam a whitelist de campos.
- [x] T1.2 — Criar o módulo NestJS `TransactionsModule` em `backend/src/modules/transactions/transactions.module.ts`.
  - Critério: Módulo declara `TransactionsController`, `TransactionsService` e importa `PrismaModule`.

## Fase 2 — Lógica de Negócio e Controladora

- [x] T2.1 — Implementar `TransactionsService` em `backend/src/modules/transactions/transactions.service.ts`.
  - Critério: Métodos `create`, `findAll`, `findOne`, `update` e `remove` integrados ao `PrismaService`, lidando com conversão de `Decimal` e lançando `NotFoundException` para recursos ou chaves estrangeiras inexistentes.
- [x] T2.2 — Implementar `TransactionsController` em `backend/src/modules/transactions/transactions.controller.ts`.
  - Critério: Rotas HTTP REST em `/transactions` protegidas com `@UseGuards(JwtAuthGuard)` e retornando status adequados (201, 200, 204, 404).
- [x] T2.3 — Registrar o `TransactionsModule` em `backend/src/app.module.ts`.
  - Critério: Aplicação NestJS inicializa e injeta dependências sem erros.

## Fase 3 — Testes Unitários e Integração E2E

- [x] T3.1 — Criar testes unitários para `TransactionsService` em `backend/src/modules/transactions/transactions.service.spec.ts`.
  - Critério: Suíte com mocks do `PrismaService` cobrindo ao menos 3 cenários positivos e 3 negativos (mínimo exigido por constitution.md §5).
- [x] T3.2 — Criar testes unitários para `TransactionsController` em `backend/src/modules/transactions/transactions.controller.spec.ts`.
  - Critério: Testar integração do controlador delegando chamadas ao serviço com tratamento de erros.
- [x] T3.3 — Criar suíte de testes de integração E2E em `backend/test/transactions.e2e-spec.ts`.
  - Critério: Testes cobrindo fluxo completo da API de transações, validações de DTO (400) e rejeição de acessos sem autenticação JWT (401).

## Checklist de fechamento da feature

- [x] `TransactionsModule` registrado no `AppModule` (`backend/src/app.module.ts`)
- [x] Testes unitários (`npm test`) executando e passando no backend
- [x] Testes E2E (`npm run test:e2e`) executando e passando no backend
- [x] Cobertura global do backend cumpre o piso mínimo de 80% (`constitution.md` §5)
- [x] Status atualizado em `backlog.md` para "concluído (specs/006-api-de-transactions/)" ao finalizar a feature

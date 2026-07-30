# Plan — 006: API de Transactions

## Visão Geral Técnica

Implementar o módulo NestJS `TransactionsModule` no projeto `backend/` para expor a entidade `Transaction`, seguindo todas as regras da `constitution.md` (arquitetura modular NestJS em `src/modules/transactions/`, injeção do `PrismaService`, validação de DTOs com `class-validator`, proteção com `JwtAuthGuard`, tratamento de permissões para módulos financeiros e cobertura de testes de no mínimo 80% com 3+ casos positivos e 3+ negativos).

## Estrutura de Arquivos no Backend

```
backend/
├── src/
│   ├── app.module.ts                             // Registro do TransactionsModule
│   └── modules/
│       └── transactions/
│           ├── dto/
│           │   ├── create-transaction.dto.ts     // DTO de criação
│           │   └── update-transaction.dto.ts     // DTO de atualização
│           ├── transactions.controller.spec.ts   // Testes unitários do controller
│           ├── transactions.controller.ts        // Controller HTTP REST
│           ├── transactions.module.ts            // Definição do módulo NestJS
│           ├── transactions.service.spec.ts      // Testes unitários do service
│           └── transactions.service.ts           // Regras de negócio e acesso ao Prisma
└── test/
    └── transactions.e2e-spec.ts                    // Suite de testes de integração E2E
```

## Modelo de Dados Existente (`prisma/schema.prisma`)

```prisma
model Transaction {
  id          String          @id @default(uuid())
  description String
  amount      Decimal         @db.Decimal(10, 2)
  type        TransactionType
  date        DateTime
  createdAt   DateTime        @default(now())
  bandId      String
  eventId     String?
  userId      String
  band        Band            @relation(fields: [bandId], references: [id])
  event       Event?          @relation(fields: [eventId], references: [id])
  user        User            @relation(fields: [userId], references: [id])
}

enum TransactionType {
  INCOME
  EXPENSE
}
```

O esquema Prisma já está pronto e não demanda migrações de banco de dados.

## Especificação dos Endpoints e DTOs

### 1. `POST /transactions`
- **Guarda**: `@UseGuards(JwtAuthGuard)`
- **HTTP Code**: 201 Created
- **Body (`CreateTransactionDto`)**:
  - `description`: string (`@IsString()`, `@IsNotEmpty()`)
  - `amount`: number ou string decimal legível (`@IsNumber()`, `@IsPositive()`, `@Type(() => Number)`)
  - `type`: `TransactionType` (`@IsEnum(TransactionType)`)
  - `date`: string ISO8601 (`@IsDateString()`)
  - `bandId`: string UUID (`@IsUUID()`)
  - `userId`: string UUID (`@IsUUID()`)
  - `eventId`: string UUID (`@IsOptional()`, `@IsUUID()`)
- **Comportamento**:
  - Valida se `bandId` e `userId` existem no banco (lança `NotFoundException` HTTP 404 se não existirem).
  - Caso `eventId` seja fornecido, valida se o evento existe.
  - Cria o registro de `Transaction` e o retorna.

### 2. `GET /transactions`
- **Guarda**: `@UseGuards(JwtAuthGuard)`
- **HTTP Code**: 200 OK
- **Query Params**: `bandId` (opcional, UUID), `userId` (opcional, UUID), `eventId` (opcional, UUID), `type` (opcional, `INCOME` | `EXPENSE`).
- **Comportamento**: Retorna lista de transações ordenadas por `date` desc. Aplica filtros onde fornecidos.

### 3. `GET /transactions/:id`
- **Guarda**: `@UseGuards(JwtAuthGuard)`
- **HTTP Code**: 200 OK
- **Comportamento**: Retorna a transação especificada por `id`. Lança `NotFoundException` (404) caso não seja encontrada.

### 4. `PATCH /transactions/:id`
- **Guarda**: `@UseGuards(JwtAuthGuard)`
- **HTTP Code**: 200 OK
- **Body (`UpdateTransactionDto`)**:
  - `description`: string opcional
  - `amount`: number opcional
  - `type`: `TransactionType` opcional
  - `date`: string ISO8601 opcional
  - `eventId`: string UUID opcional (ou null)
- **Comportamento**: Atualiza os campos do lançamento. Impede alteração de `id`, `bandId`, `userId` ou `createdAt` (`forbidNonWhitelisted: true`). Lança `NotFoundException` (404) se não existir.

### 5. `DELETE /transactions/:id`
- **Guarda**: `@UseGuards(JwtAuthGuard)`
- **HTTP Code**: 204 No Content
- **Comportamento**: Exclui o lançamento pelo ID. Lança `NotFoundException` (404) se a transação não existir.

## Qualidade e Cobertura de Testes (`constitution.md` §5)

Como módulo financeiro, o padrão exigido por `constitution.md` §5 é de **no mínimo 3 cenários positivos e 3 negativos**:

1. **Testes Unitários (`transactions.service.spec.ts`, `transactions.controller.spec.ts`)**:
   - Casos Positivos:
     1. Criar transação com dados válidos (com e sem `eventId`).
     2. Listar transações com e sem filtros (`bandId`, `type`, etc.).
     3. Buscar transação existente por ID, atualizar campos e remover transação com sucesso.
   - Casos Negativos:
     1. Tentar criar transação com `bandId` ou `userId` inexistente (lançar 404).
     2. Tentar buscar/atualizar/remover transação com ID inexistente (lançar 404).
     3. Tentar vincular `eventId` inexistente na criação/atualização (lançar 404).

2. **Testes de Integração E2E (`test/transactions.e2e-spec.ts`)**:
   - Rejeição de requisições sem token JWT (HTTP 401 Unauthorized).
   - Sanitização de payload e rejeição de propriedades proibidas/não permitidas no DTO (HTTP 400 Bad Request via `forbidNonWhitelisted: true`).
   - Validação de tipos (ex.: `amount` negativo ou string inválida em enum `type`).
   - Execução do fluxo E2E completo: POST -> GET -> PATCH -> DELETE.

## Riscos e Cuidados de Implementação

- **Conversão de Tipos (Decimal vs Number)**: No Prisma, `amount` é do tipo `Decimal`. No DTO/JSON, é transmitido como número. O service deve lidar de forma transparente com essa conversão.
- **Relacionamentos Obrigatórios e Opcionais**: Tratar restrições de chave estrangeira do Prisma (`P2003`) ao associar `bandId`, `userId` ou `eventId` inexistentes.

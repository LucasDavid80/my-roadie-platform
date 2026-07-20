# Plan — 004: API de Tasks

## Visão Geral Técnica

Implementar o módulo NestJS `TasksModule` no repositório `backend/` para gerenciar a entidade `Task`, seguindo estritamente as diretrizes da `constitution.md` (arquitetura modular NestJS, injeção do `PrismaService`, validação via DTOs, autenticação via `JwtAuthGuard` e cobertura de testes).

## Estrutura de Arquivos no Backend

```
backend/
├── src/
│   ├── app.module.ts                         // Registro do TasksModule
│   └── modules/
│       └── tasks/
│           ├── dto/
│           │   ├── create-task.dto.ts        // DTO de criação
│           │   └── update-task.dto.ts        // DTO de atualização
│           ├── tasks.controller.spec.ts      // Testes unitários do controller
│           ├── tasks.controller.ts           // Controladora HTTP
│           ├── tasks.module.ts               // Definição do módulo NestJS
│           ├── tasks.service.spec.ts         // Testes unitários do service
│           └── tasks.service.ts              // Regra de negócio e Prisma
└── test/
    └── tasks.e2e-spec.ts                     // Teste de integração E2E
```

## Modelo de Dados Existente (`prisma/schema.prisma`)

```prisma
model Task {
  id          String   @id @default(uuid())
  description String
  isDone      Boolean  @default(false)
  eventId     String
  createdAt   DateTime @default(now())
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
}
```

Nenhuma migração de banco é necessária, pois a entidade já possui suporte no Prisma Schema.

## Especificação de Endpoints e DTOs

### 1. `POST /tasks`
- **Guarda**: `@UseGuards(JwtAuthGuard)`
- **HTTP Code**: 201 Created
- **Body (`CreateTaskDto`)**:
  - `description`: string (obrigatório, não vazio)
  - `eventId`: string (obrigatório, UUID válido)
  - `isDone`: boolean (opcional, default: `false`)
- **Comportamento**: Verifica se o `eventId` existe no banco (retorna 404 caso não exista) e cria a tarefa vinculada ao evento.

### 2. `GET /tasks`
- **Guarda**: `@UseGuards(JwtAuthGuard)`
- **HTTP Code**: 200 OK
- **Query Params**: `eventId` (opcional, string UUID)
- **Comportamento**: Retorna a lista de tarefas. Se `eventId` for informado, filtra as tarefas associadas àquele evento específico.

### 3. `GET /tasks/:id`
- **Guarda**: `@UseGuards(JwtAuthGuard)`
- **HTTP Code**: 200 OK
- **Comportamento**: Retorna os detalhes de uma tarefa específica. Lança `NotFoundException` (404) se a tarefa não for encontrada.

### 4. `PATCH /tasks/:id`
- **Guarda**: `@UseGuards(JwtAuthGuard)`
- **HTTP Code**: 200 OK
- **Body (`UpdateTaskDto`)**:
  - `description`: string (opcional)
  - `isDone`: boolean (opcional)
- **Comportamento**: Atualiza parcialmente os dados da tarefa. Lança `NotFoundException` se o registro não existir.

### 5. `DELETE /tasks/:id`
- **Guarda**: `@UseGuards(JwtAuthGuard)`
- **HTTP Code**: 204 No Content
- **Comportamento**: Remove a tarefa pelo ID. Lança `NotFoundException` se a tarefa não for encontrada.

## Qualidade e Testes (`constitution.md` §5)

1. **Testes Unitários (`tasks.service.spec.ts`, `tasks.controller.spec.ts`)**:
   - Usar `NestJS TestingModule` e mockar o `PrismaService`.
   - Garantir 1+ caso de sucesso e 1+ caso de erro para cada método CRUD.
2. **Testes de Integração E2E (`test/tasks.e2e-spec.ts`)**:
   - Utilizar `supertest` para simular requisições HTTP reais.
   - Validar bloqueio de requisições unauthenticated (401 Unauthorized).
   - Validar rejeição de payloads com propriedades extras (`forbidNonWhitelisted: true`).

## Riscos e Cuidados de Implementação

- Garantir sanitização de payload: a atualização via `PATCH` não deve aceitar campos gerados automaticamente (`id`, `createdAt`, `eventId`).
- Tratar chaves estrangeiras inválidas: se a requisição indicar um `eventId` inexistente ao criar a tarefa, retornar `NotFoundException` ou capturar o erro do Prisma (`P2003` / Foreign key constraint failed) para responder com 404/400 apropriado.

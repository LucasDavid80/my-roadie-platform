# Plan — 005: API de Repertório

## Visão Geral Técnica

Implementar o módulo NestJS `RepertoireModule` no repositório `backend/` para gerenciar a entidade `RepertoireSong`, seguindo estritamente as diretrizes da `constitution.md` (arquitetura modular NestJS, injeção do `PrismaService`, validação via DTOs, autenticação via `JwtAuthGuard` e cobertura de testes mínima de 80%).

## Estrutura de Arquivos no Backend

```
backend/
├── src/
│   ├── app.module.ts                             // Registro do RepertoireModule
│   └── modules/
│       └── repertoire/
│           ├── dto/
│           │   ├── create-repertoire-song.dto.ts // DTO de criação
│           │   └── update-repertoire-song.dto.ts // DTO de atualização
│           ├── repertoire.controller.spec.ts   // Testes unitários do controller
│           ├── repertoire.controller.ts        // Controladora HTTP
│           ├── repertoire.module.ts            // Definição do módulo NestJS
│           ├── repertoire.service.spec.ts      // Testes unitários do service
│           └── repertoire.service.ts           // Regra de negócio e Prisma
└── test/
    └── repertoire.e2e-spec.ts                    // Teste de integração E2E
```

## Modelo de Dados Existente (`prisma/schema.prisma`)

```prisma
model RepertoireSong {
  id       String  @id @default(uuid())
  title    String
  artist   String?
  key      String?
  position Int
  notes    String?
  bandId   String
  band     Band    @relation(fields: [bandId], references: [id])

  @@index([bandId, position])
}
```

Nenhuma alteração ou migração de banco de dados é necessária, pois a entidade `RepertoireSong` já está completamente definida no Prisma Schema.

## Especificação de Endpoints e DTOs

### 1. `POST /repertoire`
- **Guarda**: `@UseGuards(JwtAuthGuard)`
- **HTTP Code**: 201 Created
- **Body (`CreateRepertoireSongDto`)**:
  - `title`: string (obrigatório, não vazio)
  - `bandId`: string (obrigatório, UUID válido)
  - `artist`: string (opcional)
  - `key`: string (opcional)
  - `position`: integer (obrigatório ou default: 0)
  - `notes`: string (opcional)
- **Comportamento**: Verifica se a `Band` com `bandId` existe no banco (lança `NotFoundException` HTTP 404 se não existir) e cria o registro de `RepertoireSong`.

### 2. `GET /repertoire`
- **Guarda**: `@UseGuards(JwtAuthGuard)`
- **HTTP Code**: 200 OK
- **Query Params**: `bandId` (opcional, string UUID)
- **Comportamento**: Retorna a lista de músicas do repertório. Se `bandId` for fornecido, filtra as músicas associadas àquela banda específica, ordenando os resultados por `position` asc.

### 3. `GET /repertoire/:id`
- **Guarda**: `@UseGuards(JwtAuthGuard)`
- **HTTP Code**: 200 OK
- **Comportamento**: Retorna os detalhes de uma música específica. Lança `NotFoundException` (404) caso o registro não seja encontrado.

### 4. `PATCH /repertoire/:id`
- **Guarda**: `@UseGuards(JwtAuthGuard)`
- **HTTP Code**: 200 OK
- **Body (`UpdateRepertoireSongDto`)**:
  - `title`: string (opcional)
  - `artist`: string (opcional)
  - `key`: string (opcional)
  - `position`: integer (opcional)
  - `notes`: string (opcional)
- **Comportamento**: Atualiza parcialmente os campos da música do repertório. Lança `NotFoundException` (404) se a música não existir.

### 5. `DELETE /repertoire/:id`
- **Guarda**: `@UseGuards(JwtAuthGuard)`
- **HTTP Code**: 204 No Content
- **Comportamento**: Remove a música do repertório pelo ID. Lança `NotFoundException` (404) se o registro não for encontrado.

## Qualidade e Testes (`constitution.md` §5)

1. **Testes Unitários (`repertoire.service.spec.ts`, `repertoire.controller.spec.ts`)**:
   - Utilizar `NestJS TestingModule` e mockar as chamadas do `PrismaService`.
   - Garantir ao menos 1 caso de sucesso e 1 caso de erro/borda por método CRUD.
2. **Testes de Integração E2E (`test/repertoire.e2e-spec.ts`)**:
   - Utilizar `supertest` para simular requisições HTTP reais.
   - Validar a rejeição de requisições não autenticadas (HTTP 401 Unauthorized).
   - Validar sanitização de payload e erro 400 (`forbidNonWhitelisted: true`) para propriedades extras ou não autorizadas no corpo das requisições.

## Riscos e Cuidados de Implementação

- **Sanitização de Payload**: A requisição `PATCH` não deve aceitar campos gerados ou imutáveis (`id`, `bandId`).
- **Tratamento de Chaves Estrangeiras**: Se a requisição indicar um `bandId` inexistente no `POST`, capturar a restrição de chave estrangeira do Prisma ou verificar antecipadamente para lançar `NotFoundException` (404) amigável.

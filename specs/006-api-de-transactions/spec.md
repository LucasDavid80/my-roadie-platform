# Spec — 006: API de Transactions

## Objetivo

Expor a entidade `Transaction` (transações financeiras da banda e eventos) via API HTTP/REST no backend NestJS (`backend/src/modules/transactions/`), permitindo criar, listar, buscar, atualizar e remover lançamentos de receitas e despesas vinculados a bandas, usuários e compromissos.

## Por quê

O modelo `Transaction` já está definido no esquema do banco de dados (`backend/prisma/schema.prisma`), contando com os tipos `TransactionType` (`INCOME`, `EXPENSE`) e relacionamentos com `Band`, `User` e `Event`. No entanto, o backend ainda não possui a camada de API HTTP exposta (`TransactionsModule`).

De acordo com a `constitution.md` §3 ("schema não é feature entregue"), uma entidade só está realmente entregue quando dispõe de controller, service e DTOs devidamente validados e testados. Como lida diretamente com movimentações financeiras de cachês, custos operacionais e divisão de receitas de shows, a API de Transactions é um módulo de impacto alto e crítico. Ela é pré-requisito para funcionalidades como a divisão automatizada de cachê (*Cache Splitter*) e o controle financeiro por evento.

## Escopo

- Criar a estrutura do módulo NestJS `src/modules/transactions/` no repositório `backend`.
- Implementar DTOs de entrada (`CreateTransactionDto`, `UpdateTransactionDto`) com validações estritas via `class-validator` e `class-transformer` (`IsString`, `IsNotEmpty`, `IsNumber`, `IsEnum`, `IsDateString`, `IsUUID`, `IsOptional`).
- Implementar `TransactionsService` encapsulando as regras de CRUD e persistência via `PrismaService`.
- Implementar `TransactionsController` oferecendo os seguintes endpoints REST:
  - `POST /transactions`: Criar um novo lançamento financeiro (`INCOME` ou `EXPENSE`) vinculado a uma banda (`bandId`), um usuário (`userId`) e opcionalmente a um evento (`eventId`).
  - `GET /transactions`: Listar lançamentos financeiros com suporte a filtros por `bandId`, `userId`, `eventId` e `type`.
  - `GET /transactions/:id`: Obter os detalhes de uma transação específica pelo ID.
  - `PATCH /transactions/:id`: Atualizar dados de um lançamento existente (ex.: `description`, `amount`, `type`, `date`, `eventId`).
  - `DELETE /transactions/:id`: Excluir um lançamento financeiro pelo ID.
- Proteger todas as rotas com `JwtAuthGuard` e assegurar verificação de autorização em conformidade com `constitution.md` §4.
- Registrar o `TransactionsModule` no `AppModule` (`backend/src/app.module.ts`).
- Implementar testes unitários (`transactions.service.spec.ts`, `transactions.controller.spec.ts`) e testes de integração E2E (`backend/test/transactions.e2e-spec.ts`), cobrindo no mínimo 3 casos positivos e 3 casos negativos para garantir a robustez exigida por `constitution.md` §5 em módulos financeiros.

## Fora de escopo

- Alterações ou migrações no Prisma Schema (`prisma/schema.prisma`), já que a estrutura atual da entidade `Transaction` atende os requisitos.
- Telas ou componentes de UI no Frontend Web (`frontend-web/`) ou Mobile (`mobile/`).
- Regras de cálculo automático de divisão de cachê ou relatórios consolidados em PDF (serão tratados em specs futuras baseadas nesta API).

## Critérios de Sucesso

- [x] Endpoints HTTP para criação, listagem com filtros, busca por ID, edição parcial e remoção de transações funcionando corretamente.
- [x] Validação rigorosa dos payloads via DTOs com `ValidationPipe` e `forbidNonWhitelisted: true`.
- [x] Requisições não autenticadas rejeitadas com HTTP 401 Unauthorized.
- [x] Testes unitários do `TransactionsService` e `TransactionsController` cobrindo ao menos 3 cenários positivos e 3 negativos (ex.: valor inválido, tipo desconhecido, banda/usuário inexistente, ID não encontrado).
- [x] Teste de integração E2E cobrindo todo o ciclo de vida de transações financeiras.
- [x] Manutenção do limiar mínimo de 80% de cobertura de código global no backend (`constitution.md` §5).

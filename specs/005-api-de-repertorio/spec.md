# Spec — 005: API de Repertório

## Objetivo

Expor a entidade `RepertoireSong` (músicas do repertório da banda) via API HTTP/REST no backend NestJS (`backend/src/modules/repertoire/`), permitindo criar, listar, buscar, atualizar e remover músicas vinculadas a grupos musicais (bandas).

## Por quê

O modelo `RepertoireSong` já foi definido no esquema do banco de dados (`backend/prisma/schema.prisma`) com seu relacionamento `Band -> RepertoireSong` e índice composto `@@index([bandId, position])`. No entanto, o backend ainda não possui o módulo NestJS correspondente (`RepertoireModule`), controllers, serviços ou DTOs expostos.

Conforme estabelecido na `constitution.md` §3 ("schema não é feature entregue"), uma entidade só se torna disponível para o ecossistema quando possui a camada de API exposta, testada e validada. A disponibilização da API de Repertório é essencial para o gerenciamento de repertório musical das bandas e desbloqueia funcionalidades futuras, como a criação de setlists para shows e o visualizador de letras/cifras em Modo Palco.

## Escopo

- Criar a estrutura do módulo NestJS `src/modules/repertoire/` no projeto `backend`.
- Implementar DTOs (`CreateRepertoireSongDto`, `UpdateRepertoireSongDto`) com validações rigorosas via `class-validator` (`IsString`, `IsNotEmpty`, `IsInt`, `IsUUID`, `IsOptional`).
- Implementar `RepertoireService` encapsulando operações CRUD no banco de dados via `PrismaService`.
- Implementar `RepertoireController` com suporte aos seguintes endpoints HTTP:
  - `POST /repertoire`: Criar uma nova música do repertório vinculada a uma `bandId`.
  - `GET /repertoire`: Listar músicas do repertório (filtráveis por `bandId`, ordenadas por `position`).
  - `GET /repertoire/:id`: Buscar os detalhes de uma música específica pelo ID.
  - `PATCH /repertoire/:id`: Atualizar campos de uma música (ex.: `title`, `artist`, `key`, `position`, `notes`).
  - `DELETE /repertoire/:id`: Remover uma música do repertório pelo ID.
- Proteger todas as rotas do controlador com `JwtAuthGuard`.
- Registrar o `RepertoireModule` no `AppModule` (`backend/src/app.module.ts`).
- Implementar testes unitários (`repertoire.service.spec.ts`, `repertoire.controller.spec.ts`) e testes de integração E2E (`backend/test/repertoire.e2e-spec.ts`).

## Fora de escopo

- Alterações ou migrações no esquema Prisma (`prisma/schema.prisma`), uma vez que o modelo `RepertoireSong` existente atende integralmente os requisitos básicos.
- Telas ou componentes de interface gráfica no Frontend Web (`frontend-web/`) ou Mobile (`mobile/`) — a integração de UI será realizada em specs dedicadas subsequentes.
- Funcionalidades avançadas de manipulação de cifras, transposição automática de tons ou reprodução de áudio.

## Critérios de Sucesso

- [x] Endpoints HTTP para criação, listagem, busca por ID, edição e remoção de músicas do repertório funcionando corretamente.
- [x] Requisições `POST` e `PATCH` validadas por DTOs com `ValidationPipe` e `forbidNonWhitelisted: true`.
- [x] Chamadas sem token JWT apropriado rejeitadas com HTTP 401 Unauthorized.
- [x] Testes unitários do `RepertoireService` e `RepertoireController` cobrindo casos de sucesso e tratamento de erros (ex.: música ou banda não encontrada -> HTTP 404).
- [x] Testes de integração E2E cobrindo o fluxo completo da API de repertório.
- [x] Cobertura de testes do backend atende a meta estipulada em `constitution.md` §5 (mínimo 80%).


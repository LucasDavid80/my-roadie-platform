# ⚙️ Backend Architecture - NestJS

Este documento detalha a estrutura e as decisões técnicas da API do My Roadie, localizada no diretório `/backend`.

## 🛠️ Stack Tecnológica

- **Framework:** [NestJS](https://nestjs.com/) (Node.js)
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL (Hospedado no **Supabase**)
- **ORM:** [Prisma](https://www.prisma.io/) (utilizado para modelagem e query builder)
- **Autenticação:** Supabase Auth / JWT

## 🏗️ Estrutura de Pastas (Padrão NestJS)

A API é organizada de forma modular para facilitar a manutenção:

- `src/modules/`: Contém os módulos de domínio da aplicação (ex: `events`, `users`, `logistics`).

### Módulo Users

- Finalidade: gerenciamento CRUD de usuários. A API expõe endpoints REST principais: POST /users, GET /users, GET /users/:id, PATCH /users/:id e DELETE /users/:id.
- Estrutura: `src/modules/users` contém controller, service, DTOs (`CreateUserDto`, `UpdateUserDto`), entidade (`entities/user.entity.ts`) e testes unitários (`users.controller.spec.ts`, `users.service.spec.ts`) além de testes e2e em `test/users.e2e-spec.ts`.
- Implementação atual: o UsersService possui uma implementação em memória (array) usada para facilitar desenvolvimento e testes; há também modelagem Prisma no repositório (`prisma/schema.prisma`) com o model `User` e migração correspondente, indicando que a persistência em produção usa Prisma/Postgres.
- Integração: o `UsersModule` exporta `UsersService` para que outros módulos (por exemplo `Events`) possam utilizá-lo; no Prisma existe relação entre `Event.createdById` e `User.id`.
- Observações operacionais: após alterar `prisma/schema.prisma` rodar `npx prisma generate`; rotas que dependam de identidade do usuário devem usar autenticação (Supabase Auth / JWT) e guards (`@UseGuards(JwtAuthGuard)`).
- `src/common/`: Decoradores, filtros de exceção e interceptores globais.
- `prisma/`: Contém o arquivo `schema.prisma` e as migrations do banco de dados.

## 🗄️ Integração com Banco de Dados

O backend utiliza o **Prisma** para se comunicar com o Postgres do Supabase.

### Fluxo de Desenvolvimento:

1. **Modelagem:** Alterações no banco são feitas no `prisma/schema.prisma`.
2. **Sincronização:** Após alterar o schema, rode `npx prisma generate` para atualizar o cliente NestJS.
3. **Conexão:** A string de conexão é gerenciada pela variável de ambiente `DATABASE_URL`.

## 🔐 Autenticação e Segurança

- A validação de tokens é feita via Strategy do NestJS, integrando-se ao **Supabase Auth**.
- Rotas protegidas utilizam o decorator `@UseGuards(JwtAuthGuard)`.

## 🚀 Comandos Principais

Dentro da pasta `/backend`:

```bash
# Instalar dependências
npm ci

# Gerar cliente do Prisma
npx prisma generate

# Rodar em modo de desenvolvimento
npm run start:dev

# Rodar testes unitários
npm test
```

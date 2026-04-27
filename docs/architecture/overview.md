# 🏛️ Arquitetura do Ecossistema - My Roadie

Este documento descreve a visão geral da plataforma My Roadie, detalhando a integração entre as diferentes tecnologias e a estrutura do monorepo.

## 🎯 Objetivo

Facilitar o gerenciamento de agendas, notificações e logística para músicos e roadies, centralizando a comunicação e o histórico de eventos.

## 🏗️ Estrutura do Projeto (Monorepo)

O projeto utiliza uma arquitetura de monorepo para compartilhar tipos e lógica de negócios entre as plataformas. No repositório atual os subprojetos principais são:

- `frontend-web`: Aplicação Next.js + React (user-facing).
- `backend`: API em **NestJS** (TypeScript). Conecta-se ao banco Supabase (Postgres).
- `packages/shared`: (Opcional) Tipagens e utilitários compartilhados.

## 🗺️ Diagrama de Contexto (C4 Model - Nível 1)

```mermaid
graph TD
    User((Músico / Roadie))
    Frontend[frontend-web (Next.js)]
    Backend[backend (NestJS)]
    Supabase[(Supabase - Postgres)]
    Auth[Serviço de Autenticação (Supabase Auth / JWT)]
    Push[Push / FCM]

    User --> Frontend
    Frontend --> Backend
    Backend --> Supabase
    Backend --> Auth
    Frontend --> Push
```

## Rodando localmente (resumo rápido)

- Frontend:
  - Instalar: `cd frontend-web && npm ci`
  - Dev: `cd frontend-web && npm run dev`
  - Build: `cd frontend-web && npm run build`
  - Lint: `cd frontend-web && npm run lint`

- Backend (NestJS):
  - Instalar: `cd backend && npm ci`
  - Variáveis de ambiente essenciais:
    - `DATABASE_URL` — connection string Postgres do Supabase (ex: `postgresql://...`).
    - `SUPABASE_URL` e `SUPABASE_KEY` — se o projeto usa o client Supabase.
  - Se o projeto usar Prisma: `cd backend && npx prisma generate`
  - Dev: `cd backend && npm run start:dev`
  - Testes: `cd backend && npm test` (teste único: `npx jest path/to/file.spec.ts`)

## Notas importantes

- CI usa Node 20 (ver `.github/workflows/ci.yml`).
- Trate frontend e backend como serviços independentes ao executar comandos localmente.
- Consulte `docs/testing.md` para guias adicionais sobre testes, ERD e regras de negócio.

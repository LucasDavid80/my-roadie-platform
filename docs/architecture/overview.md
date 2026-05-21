# 🏛️ Arquitetura do Ecossistema - My Roadie

Este documento descreve a visão geral da plataforma My Roadie, detalhando a integração entre as diferentes tecnologias e a estrutura do monorepo.

## 🎯 Objetivo

Facilitar o gerenciamento de agendas, notificações e logística para músicos e roadies, centralizando a comunicação e o histórico de eventos.

## 🏗️ Estrutura do Projeto (Monorepo)

O projeto utiliza uma arquitetura de monorepo para organizar as diferentes interfaces e o núcleo de processamento. Os subprojetos principais são:

- `backend`: API em **NestJS** (TypeScript). Núcleo de regras de negócio e integração com Supabase (Postgres).
- `frontend-web`: Aplicação Next.js + React para gestão administrativa e visualização desktop.
- `mobile`: Aplicativo móvel desenvolvido em **Flutter** para uso em tempo real na estrada.

## 🗺️ Diagrama de Contexto (C4 Model - Nível 1)

```mermaid
graph TD
    User((Músico / Roadie))
    Frontend[frontend-web (Next.js)]
    Mobile[mobile (Flutter)]
    Backend[backend (NestJS)]
    Supabase[(Supabase - Postgres)]
    Auth[Serviço de Autenticação (Supabase Auth / JWT)]

    User --> Frontend
    User --> Mobile
    Frontend --> Backend
    Mobile --> Backend
    Backend --> Supabase
    Backend --> Auth
```

## Rodando localmente (resumo rápido)

- **Frontend-Web:**
  - `cd frontend-web && npm ci && npm run dev`

- **Backend (NestJS):**
  - `cd backend && npm ci && npx prisma generate && npm run start:dev`

- **Mobile (Flutter):**
  - `cd mobile && flutter pub get && flutter run`

## Notas importantes

- CI usa Node 22 (ver `.github/workflows/ci.yml`).
- Trate os módulos como independentes ao executar comandos localmente.

- Trate frontend e backend como serviços independentes ao executar comandos localmente.
- Consulte `docs/testing.md` para guias adicionais sobre testes, ERD e regras de negócio.

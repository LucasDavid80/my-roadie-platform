# 🚀 My Roadie Platform - Project Instructions

Este arquivo serve como guia mestre para o desenvolvimento no ecossistema **My Roadie**, uma plataforma centralizada para gerenciamento de agendas, logística e finanças para músicos e roadies.

## 🏛️ Visão Geral do Projeto

O projeto é estruturado como um monorepo (gerenciado manualmente ou via pastas independentes) contendo uma API robusta e uma interface web moderna.

- **Objetivo:** Facilitar a comunicação e organização entre músicos e suas equipes técnicas (roadies).
- **Tecnologias Principais:**
  - **Backend:** NestJS (Node.js) com TypeScript.
  - **Frontend:** Next.js (React) com TypeScript e TailwindCSS.
  - **Banco de Dados:** PostgreSQL (hospedado no Supabase).
  - **ORM:** Prisma.
  - **Autenticação:** Supabase Auth + JWT.

## 📂 Estrutura de Diretórios

- `backend/`: API NestJS. Contém a lógica de negócio, integrações de banco e autenticação.
- `frontend-web/`: Aplicação Next.js (App Router). Interface principal do usuário.
- `docs/`: Documentação detalhada sobre arquitetura, regras de negócio e padrões.
- `prisma/`: (Dentro de `backend/`) Esquema do banco de dados e migrações.

## 🛠️ Comandos Essenciais

### Backend (`backend/`)
- **Instalação:** `npm ci`
- **Desenvolvimento:** `npm run start:dev`
- **Build:** `npm run build`
- **Testes Unitários:** `npm test`
- **Testes E2E:** `npm run test:e2e`
- **Lint:** `npm run lint`
- **Prisma Generate:** `npx prisma generate` (Rodado automaticamente no `postinstall`)

### Frontend (`frontend-web/`)
- **Instalação:** `npm ci`
- **Desenvolvimento:** `npm run dev`
- **Build:** `npm run build`
- **Testes (Vitest):** `npm test`
- **Lint:** `npm run lint`

## 📏 Convenções de Desenvolvimento

### Geral
- **Node.js:** Versão 20 (LTS).
- **Gerenciador de Pacotes:** `npm`.
- **Commits:** Mensagens claras e em inglês ou português (seguindo o padrão do repositório), preferencialmente com escopo (ex: `backend: add event service`).

### Backend (NestJS)
- **Validação:** Uso rigoroso de `ValidationPipe` com DTOs (`class-validator`).
- **Arquitetura:** Seguir o padrão modular do NestJS (`modules`, `services`, `controllers`).
- **Banco de Dados:** Atualizações de esquema devem ser feitas via Prisma Migrations.
- **Erros:** Utilize exceções nativas do NestJS (`NotFoundException`, `BadRequestException`, etc.).

### Frontend (Next.js)
- **Componentes:** Preferência por componentes funcionais e hooks.
- **Estilização:** TailwindCSS (configurado no root).
- **Formulários:** `react-hook-form` com validação `zod`.
- **Estado:** Context API para estados globais (como `AuthContext`).

## 🔐 Segurança e Variáveis de Ambiente

**NUNCA** comite arquivos `.env`. As variáveis essenciais incluem:

- **Backend:** `DATABASE_URL`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_KEY`.
- **Frontend:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Consulte `docs/contributing/code-standards.md` para mais detalhes sobre segurança.

## 📊 Modelo de Dados (Prisma)

As entidades principais são:
- `User`: Músicos, Roadies e Admins.
- `Band`: Grupos musicais.
- `Event`: Shows, ensaios ou compromissos.
- `Task`: Checklists vinculadas a eventos.
- `RepertoireSong`: Músicas gerenciadas por banda.
- `Transaction`: Fluxo financeiro (entradas/saídas) vinculado a bandas e eventos.

---
*Este documento é a fonte de verdade para o Gemini CLI operar neste repositório. Siga estas diretrizes em todas as tarefas.*

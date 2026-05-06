# 🧪 Testes - My Roadie

Este documento descreve como executar e organizar os testes do monorepo, com foco no backend (NestJS).

## Backend (NestJS)

Onde estão os testes
- Testes unitários: `backend/src/modules/**/*.spec.ts` (ex.: `users.controller.spec.ts`, `users.service.spec.ts`).
- Testes e2e: `backend/test/*.e2e-spec.ts` (ex.: `test/users.e2e-spec.ts`).

Comandos úteis
- Instalar dependências: `cd backend && npm ci`
- Gerar cliente Prisma (necessário antes de build/testes quando o schema mudou): `cd backend && npx prisma generate`
- Rodar todos os testes unitários: `cd backend && npm test`
- Rodar um arquivo de teste específico: `cd backend && npx jest path/to/file.spec.ts`
- Rodar testes e2e: `cd backend && npm run test:e2e`

Notas sobre o módulo Users
- Localização: `backend/src/modules/users`
- Arquivos principais de teste:
  - Unit: `users.controller.spec.ts`, `users.service.spec.ts`
  - E2E: `test/users.e2e-spec.ts`
- Implementação atual: `UsersService` usa Prisma (`PrismaService`) para persistência. Muitos endpoints estão implementados via Prisma client; alguns métodos são comentados até estabilizar a API.
- Ao modificar `prisma/schema.prisma`, executar `npx prisma migrate dev` (quando aplicável) e `npx prisma generate` antes de rodar testes que dependam do cliente Prisma.

Boas práticas
- Isolar testes unitários do banco de dados; usar mocks ou instâncias em memória quando apropriado.
- Para testes que requerem banco real (integration/e2e), provisionar uma instância Postgres compatível (ex.: Supabase local/remote) e aplicar migrations antes de rodar os testes.
- Para E2E, criar e limpar fixtures (ex.: bandas, usuários) e usar variáveis de ambiente dedicadas para separar dados de teste.

Frontend
- O workspace `frontend-web` fornece um script de testes usando Vitest (`npm test`). Consulte `frontend-web/package.json` para detalhes e para adicionar suites adicionais.

Referências
- Prisma schema: `backend/prisma/schema.prisma`
- Tests e exemplos: `backend/src/modules/users`, `backend/test`
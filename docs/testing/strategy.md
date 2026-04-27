# Estratégia de Testes — My Roadie

Objetivo
- Garantir qualidade e segurança nas alterações, com ciclos rápidos de feedback para desenvolvedores e validação em ambientes próximos da produção.

Níveis de teste
- Unitários: testam lógica isolada (serviços, pipes, utilitários). Executar rápido e sem IO real.
- Integração: validam integração entre camadas (ex.: service <-> prisma client) usando um banco de teste ou clients mockados.
- E2E: testes ponta-a-ponta cobrindo rotas HTTP, autenticação e fluxo de dados entre backend e banco.

Ferramentas e padrões
- Jest como runner e test framework (já configurado no backend).
- NestJS TestingModule para montar unidades e mocks no contexto Nest.
- Mocks: usar jest.mock / providers com useValue para substituir dependências externas (ex.: Supabase client, serviços externos).
- Para testes que precisam do banco: usar um banco Postgres de teste (variável DATABASE_URL_TEST), aplicar migrations antes (npx prisma migrate deploy / npx prisma migrate reset em ambientes controlados) e limpar dados entre testes.
- Quando viável, usar testcontainers para provisionar bancos efêmeros em CI.

Recomendações específicas do backend / Users
- Unitários: mockar UsersService dependências; o código já contém uma implementação em memória útil para testes rápidos.
- Integração/E2E: quando testar endpoints /users, rodar contra uma instância Postgres isolada; rodar `npx prisma generate` e aplicar migrations antes de executar os testes.
- Autenticação: mockar validação de JWT/Supabase nas suites unitárias; para e2e, usar tokens gerados contra o ambiente de autenticação de teste ou injetar guardas de teste.

Execução (comandos)
- Instalar deps: `cd backend && npm ci`
- Gerar Prisma: `cd backend && npx prisma generate`
- Rodar todos os testes: `cd backend && npm test`
- Rodar testes do módulo users (exemplo): `cd backend && npx jest "src/modules/users" --runInBand`
- Rodar e2e: `cd backend && npm run test:e2e`

Boas práticas
- Isolar testes unitários do banco — use mocks ou implementações em memória.
- Manter fixtures e factories simples e reutilizáveis (ex.: factories para User).
- Limpar estado entre testes (transações revertidas, truncates ou recriação do schema).
- Cobertura: priorizar cobertura em regras de negócio críticas; não transformar 100% de coverage em objetivo absoluto.
- CI: rodar lint → unit tests → build → integração/e2e (e2e podem rodar em job separado/condicional).

Dados de teste e seed
- Fornecer scripts de seed leves para e2e (usuários, roles, dados essenciais).
- Não comitar dados sensíveis; usar variáveis de ambiente para credenciais.

Observações operacionais
- Após alterações em prisma/schema.prisma: executar `npx prisma generate` antes de rodar testes locais/CI.
- O UsersModule exporta UsersService; ao testar outros módulos que dependam de usuários, preferir mocks para evitar acoplamento com DB em testes unitários.

Caminhos úteis
- Unit: backend/src/modules/**/*.spec.ts
- E2E: backend/test/*.e2e-spec.ts
- Prisma schema: backend/prisma/schema.prisma

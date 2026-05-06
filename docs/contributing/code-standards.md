# Code Standards

Regras rápidas para contribuir:

- Node & Tooling
  - Usar Node 20 em desenvolvimento e CI.
  - Rodar `npm ci` nas pastas `frontend-web` e `backend` antes de desenvolver.

- Lint & Formatação
  - ESLint é usado em ambos os projetos; backend tem `npm run lint` com --fix.
  - Prettier configurado no backend; siga as regras existentes.

- Tests
  - Backend: Jest; rodar `npm test` antes de abrir PR.
  - Frontend: Vitest disponível (`npm test`).

- Commits & PRs
  - Mensagens descritivas; prefixar com escopo quando útil (ex: `backend: add users service`).
  - Abra PRs pequenas e focadas; descreva mudanças e comandos para reproduzir.

- Segurança
  - Nunca comitar segredos ou credenciais; use variáveis de ambiente.
  - Variáveis de ambiente relacionadas ao Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE`) não devem ser comitadas.

- Revisão
  - Resolver lint e testes locais antes de pedir review.

Siga as ferramentas e scripts já presentes no repositório; ajustar configuração apenas quando necessário.
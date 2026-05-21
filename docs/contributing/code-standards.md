# Code Standards

Regras rápidas para contribuir:

- Node & Tooling
  - Usar Node 20 em desenvolvimento e CI.
  - Rodar `npm ci` nas pastas `frontend-web` e `backend` antes de desenvolver.

- Lint & Formatação
  - ESLint é usado em ambos os projetos; backend tem `npm run lint` com --fix.
  - Prettier configurado no backend; siga as regras existentes.
  - **Refatoração sobre desativação:** Prefira refatorar o código (ex: usar *Optional Catch Binding* `catch {` em vez de `catch (error) {`) para resolver avisos de variáveis não utilizadas em vez de desativar regras do ESLint.

- Tests & CI/CD
  - Backend: Jest; rodar `npm test` antes de abrir PR.
  - Frontend: Vitest disponível (`npm test`).
  - **Simulação Local de CI:** Utilize o `act` para simular o GitHub Actions localmente. Segredos devem ser passados via arquivo `.secrets` (não comitar!) usando `act --secret-file .secrets`.

- Commits & PRs
  - Mensagens descritivas; prefixar com escopo quando útil (ex: `backend: add users service`).
  - Abra PRs pequenas e focadas; descreva mudanças e comandos para reproduzir.

- Segurança
  - Nunca comitar segredos ou credenciais; use variáveis de ambiente.
  - Variáveis de ambiente relacionadas ao Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE`) não devem ser comitadas.

- Revisão
  - Resolver lint e testes locais antes de pedir review.

Siga as ferramentas e scripts já presentes no repositório; ajustar configuração apenas quando necessário.
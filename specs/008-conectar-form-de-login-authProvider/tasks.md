# Tasks — 008: Conectar formulário de Login ao authProvider real (Supabase)

Pré-requisitos: `frontend-web` configurado com a biblioteca `@supabase/supabase-js` e variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Fase 1 — Centralização do cliente Supabase no Frontend Web

- [x] T1.1 — Criar o módulo `src/lib/supabase.ts` instanciando e exportando o cliente Supabase utilizando as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - Critério: Cliente `supabase` exportado e reutilizável pelo projeto.
- [x] T1.2 — Refatorar `src/services/user-service.ts` para utilizar o cliente de `src/lib/supabase.ts`.
  - Critério: `userService` importando a instância centralizada em vez de instanciar o cliente localmente.

## Fase 2 — Integração do AuthContext com Supabase Auth

- [x] T2.1 — Atualizar a interface `SignInCredentials` em `src/contexts/AuthContext.tsx` tornando o campo `password` obrigatório.
  - Critério: Tipagem do TypeScript exige `email` e `password`.
- [ ] T2.2 — Atualizar a função `signIn` em `src/contexts/AuthContext.tsx` para efetuar a autenticação via `supabase.auth.signInWithPassword({ email, password })`.
  - Critério: O fluxo de autenticação só avança caso a validação do Supabase Auth retorne sucesso.
- [ ] T2.3 — Manter a sincronização do estado local (`user`), persistência do token (`@MyRoadie:token`) e dados do perfil (`@MyRoadie:user`) no `localStorage`.
  - Critério: Usuário autenticado obtém a sessão e atualiza `isAuthenticated = true` no contexto.

## Fase 3 — Tratamento de Erros no Formulário de Login (`LoginForm`)

- [ ] T3.1 — Atualizar `src/components/features/auth/LoginForm.tsx` garantindo o repasse de `email` e `password` ao `signIn`.
  - Critério: O formulário envia ambas as credenciais preenchidas pelo usuário.
- [ ] T3.2 — Adicionar tratamento visual de mensagens de erro no `LoginForm.tsx` para falhas de autenticação (credenciais inválidas ou erro de conexão).
  - Critério: Exibir feedback amigável e legível na UI quando o Supabase Auth rejeitar as credenciais.

## Fase 4 — Cobertura de Testes Unitários e de Integração (Vitest)

- [ ] T4.1 — Atualizar suíte de testes em `src/contexts/AuthContext.spec.tsx` com mocks do Supabase Auth cobrindo no mínimo 3 casos positivos e 3 casos negativos conforme `constitution.md` §5.
  - Critério: 3 cenários de sucesso (login com token, estado atualizado, redirecionamento) e 3 de erro (senha incorreta, usuário inexistente, erro de rede) cobertos e passando.
- [ ] T4.2 — Atualizar `LoginForm.spec.tsx` e `LoginIntegration.spec.tsx` para validar a integração do componente com a nova lógica do `AuthContext`.
  - Critério: Suíte completa do Vitest (`npm test`) rodando no `frontend-web` com 100% dos testes verdes.

## Checklist de fechamento da feature

- [ ] Instância centralizada do Supabase criada em `src/lib/supabase.ts`
- [ ] `AuthContext` efetuando autenticação real via `supabase.auth.signInWithPassword`
- [ ] `LoginForm` exibindo erros de autenticação na UI de forma amigável
- [ ] Mínimo de 3 casos positivos e 3 casos negativos cobertos em testes no Vitest (`constitution.md` §5)
- [ ] `npm test` no `frontend-web` 100% verde sem falhas ou regressões
- [ ] Entrada em `backlog.md` atualizada com o status correspondente

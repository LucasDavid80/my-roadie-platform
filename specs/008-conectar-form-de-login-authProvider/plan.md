# Plan — 008: Conectar formulário de Login ao authProvider real (Supabase)

## Visão Geral da Solução

O objetivo deste plano é conectar o formulário de Login do `frontend-web` ao `Supabase Auth` real. Atualmente, o `AuthContext` envia apenas `{ email }` para a rota `/auth/login` da API NestJS, ignorando a verificação de senha e a camada de autenticação do Supabase.

A solução padronizará o cliente Supabase no `frontend-web`, integrará a verificação de credenciais (`email` + `password`) com `supabase.auth.signInWithPassword` no `AuthContext`, tratará os erros de credenciais na UI (`LoginForm`), e atualizará os testes unitários e de integração no Vitest.

---

## Arquitetura & Modificações Técnicas

### 1. Centralização do Cliente Supabase (`frontend-web/src/lib/supabase.ts`)
- Criar o arquivo `src/lib/supabase.ts` instanciando o cliente `@supabase/supabase-js` com as variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Refatorar usos pulverizados (como em `userService`) para importar essa instância centralizada.

### 2. Atualização da Camada de Autenticação (`frontend-web/src/contexts/AuthContext.tsx`)
- Atualizar a interface `SignInCredentials` para tornar `password` obrigatório: `{ email: string; password: string }`.
- Atualizar a função `signIn`:
  1. Executar `const { data, error } = await supabase.auth.signInWithPassword({ email, password })`.
  2. Caso ocorra erro (`error`), lançar exceção com mensagem apropriada.
  3. Com o login bem-sucedido no Supabase, efetuar a chamada de validação/perfil no backend NestJS para obter as informações completas do `UserEntity` e o token JWT da sessão.
  4. Persistir os dados no `localStorage` (`@MyRoadie:token` e `@MyRoadie:user`) e atualizar o estado `user` do React Context.

### 3. Ajustes no Componente de Formulário (`frontend-web/src/components/features/auth/LoginForm.tsx`)
- Garantir que a submissão via `react-hook-form` repasse tanto `email` quanto `password` para `signIn({ email, password })`.
- Capturar erros durante o `signIn` e exibir mensagem de erro clara na interface do usuário (ex.: "E-mail ou senha incorretos").

### 4. Estratégia de Testes (Vitest)
- Conforme `constitution.md` §5 (módulos críticos de Auth), os testes do `AuthContext` e `LoginForm` devem cobrir no mínimo **3 casos positivos** e **3 casos negativos**:
  - **Casos Positivos**:
    1. Login com credenciais válidas autentica via Supabase Auth e armazena token no `localStorage`.
    2. Login com credenciais válidas define o estado `user` no `AuthContext` e marca `isAuthenticated = true`.
    3. Redirecionamento bem-sucedido para `/dashboard` após login validado.
  - **Casos Negativos**:
    1. Tentativa de login com senha incorreta no Supabase Auth dispara erro e não autentica o usuário.
    2. Tentativa de login com e-mail não cadastrado dispara erro de usuário não encontrado.
    3. Falha de conexão/rede na API do Supabase Auth é tratada adequadamente com feedback na UI sem quebrar a aplicação.
- Mocar as chamadas de `@supabase/supabase-js` em `AuthContext.spec.tsx` e `LoginForm.spec.tsx` usando Vitest (`vi.mock`).

---

## Conformidade com a Constituição (`constitution.md`)

- **§1 Stack**: Utiliza a stack padrão `Next.js + TypeScript` no frontend e `Supabase Auth + JWT` na autenticação.
- **§4 Autenticação e autorização**: Respeita o fluxo de validação de contas com o Supabase Auth.
- **§5 Qualidade e testes**: Implementa 3 casos positivos e 3 casos negativos para módulos críticos de autenticação, mantendo a meta de cobertura ≥ 80% medida via Vitest (`npm test`).
- **§6 Segurança**: Utiliza exclusivamente as chaves públicas anônimas no frontend (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

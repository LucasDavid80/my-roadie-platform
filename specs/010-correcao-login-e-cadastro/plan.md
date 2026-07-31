# Plan — 010: Correção da Tela de Cadastro (Web/Mobile) e Sincronização no Supabase Auth

## Visão Geral da Solução

Este plano define a estratégia técnica para resolver os problemas de cadastro e sincronização de usuários no `frontend-web` e no `mobile`.

No `frontend-web`, ajustaremos as rotas do Next.js App Router para que a tela `/register` fique visível e funcional, conectando a criação de conta ao Supabase Auth e à API NestJS (`POST /users`).

No `mobile`, auditaremos o fluxo do `RegisterForm` / `AuthRemoteDataSource.signUp` para garantir que as chamadas a `Supabase.instance.client.auth.signUp` criem as credenciais no Supabase Auth e disparem a chamada à API NestJS para inserir a linha correspondente na tabela `User` do PostgreSQL.

---

## Arquitetura & Modificações Técnicas

### 1. Frontend-Web (`frontend-web/`)

- **Rotas e Páginas**:
  - Verificar a existência e estrutura de `src/app/(auth)/register/page.tsx`.
  - Caso a rota esteja inacessível ou desalinhada do App Router, criar/ajustar a página e seu layout no Route Group `(auth)`.

- **Componente de Cadastro (`RegisterForm.tsx`)**:
  - Criar/ajustar `src/components/features/auth/RegisterForm.tsx` com campos para `name`, `email`, `password`, `confirmPassword` e `role` (`MUSICIAN` ou `ROADIE`).
  - Utilizar `react-hook-form` com validação via `zod`.

- **Integração com Supabase Auth e API NestJS**:
  - No `AuthContext` ou no `RegisterForm`:
    1. Invocar `supabase.auth.signUp({ email, password, options: { data: { name, role } } })`.
    2. Com o retorno do `user.id` (`supabaseId`), chamar a API do backend (`POST /users`) enviando `{ email, supabaseId, name, role }` para criar a linha na tabela `User` do PostgreSQL.
    3. Tratar retornos de erro (ex.: e-mail já em uso no Supabase Auth ou no banco).

- **Testes (Vitest)**:
  - Adicionar suíte de testes em `RegisterForm.spec.tsx` cobrindo cenários positivos (cadastro com sucesso) e negativos (e-mail duplicado, senha incompatível).

### 2. App Mobile (`mobile/`)

- **Datasource e Repositório de Auth (`auth_remote_datasource.dart` & `auth_repository_impl.dart`)**:
  - Atualizar `AuthRemoteDataSource.signUp` para invocar `_supabase?.auth.signUp(email: email, password: password, data: {'name': name, 'role': role})`.
  - Garantir que `signUp` retorne o objeto `User` gerado pelo Supabase.

- **Criação do Perfil no Backend NestJS**:
  - Ao concluir o `signUp` com sucesso no `AuthRemoteDataSource`:
    - Invocar `remoteDataSource.createUser(...)` chamando `POST /users` com `{ email, supabaseId, name, role }`.
    - Garantir que a entidade de usuário seja persistida no banco PostgreSQL da aplicação.

- **Tratamento na UI (`register_form.dart` / `register_page.dart`)**:
  - Exibir barra de progresso (`CircularProgressIndicator`) durante o cadastro.
  - Exibir `SnackBar` verde em caso de sucesso e redirecionar para `/login` ou `/`.
  - Exibir `SnackBar` vermelha com a mensagem exata do erro em caso de falha (ex.: "E-mail já cadastrado", "Senha muito curta").

- **Testes (Flutter Test)**:
  - Adicionar testes unitários e de widget em `test/presentation/screens/register_screen_test.dart` e `test/data/datasources/auth_remote_datasource_test.dart`.

---

## Conformidade com a Constituição (`constitution.md`)

- **§1 Stack**: Utiliza Next.js no web, Flutter no mobile, NestJS no backend e Supabase Auth + PostgreSQL no banco.
- **§4 Autenticação**: Valida senhas via Supabase Auth e vincula o `supabaseId` à tabela `User` do Prisma.
- **§5 Qualidade e Testes**: Inclui no mínimo 3 testes positivos e 3 negativos para cadastro na Web (`npm test`) e no Mobile (`flutter test`).
- **§8 Workflow e Git**: Execução realizada por fases controladas em `tasks.md`, sem `git push` sem autorização do usuário e commits divididos por tarefa.

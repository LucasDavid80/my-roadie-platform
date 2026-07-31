# Tasks — 010: Correção da Tela de Cadastro (Web/Mobile) e Sincronização no Supabase Auth

Pré-requisitos: `frontend-web` e `mobile` configurados com dependências, Supabase client e suítes de testes (`npm test` e `flutter test`).

## Fase 1 — Habilitação e Correção da Tela de Cadastro no Frontend-Web (`frontend-web/`)

- [x] T1.1 — Disponibilizar a rota de cadastro `/register` no App Router do `frontend-web` (`src/app/(auth)/register/page.tsx`) e ajustar os links de navegação entre a tela de Login e a tela de Cadastro.
  - Critério: Clicar em "Criar conta" ou acessar `/register` no navegador exibe o formulário de cadastro Web sem erros 404 ou de roteamento.
- [x] T1.2 — Integrar o formulário de cadastro Web (`RegisterForm.tsx`) ao `supabase.auth.signUp` e à API do backend NestJS (`POST /users`), salvando as credenciais no Supabase Auth e o perfil no PostgreSQL.
  - Critério: Submeter o formulário cria a conta no Supabase Auth, insere a linha na tabela `User` do banco de dados e redireciona para a aplicação com feedback de sucesso.

## Fase 2 — Correção e Sincronização do Cadastro no App Mobile (`mobile/`)

- [x] T2.1 — Refatorar `AuthRemoteDataSource.signUp` e `AuthRepositoryImpl.signUp` em `mobile/lib/data/` para registrar as credenciais no Supabase Auth via `_supabase?.auth.signUp(email: email, password: password, data: {...})`.
  - Critério: Chamada de `signUp` no Flutter retorna as credenciais criadas pelo Supabase Auth com o `supabaseId` válido.
- [x] T2.2 — Conectar o fluxo de cadastro do `RegisterForm` / `userProvider` no mobile para invocar a API NestJS (`POST /users`) criando o registro do perfil no PostgreSQL imediatamente após o retorno do Supabase Auth.
  - Critério: Cadastro realizado pelo aplicativo cria as credenciais no Supabase Auth e insere com sucesso a linha do usuário na tabela `User` do PostgreSQL.
- [x] T2.3 — Implementar tratamento estrito de erros no formulário de cadastro do mobile (`RegisterForm`), bloqueando redirecionamentos e exibindo `SnackBar` vermelha para credenciais falhas (ex.: e-mail em uso, senha curta).
  - Critério: Cadastro com dados inválidos exibe alerta de erro e mantém o usuário na tela sem falsos alertas de sucesso.

## Fase 3 — Suítes de Testes e Validação em Ambos os Repositórios

- [x] T3.1 — Criar/atualizar a suíte de testes unitários e de integração no Vitest (`frontend-web/src/components/features/auth/RegisterForm.spec.tsx` ou equivalente) cobrindo cenários positivos e negativos.
  - Critério: `npm test` no `frontend-web` roda com 100% dos testes aprovados.
- [x] T3.2 — Criar/atualizar a suíte de testes no Flutter (`mobile/test/presentation/screens/register_screen_test.dart` e `mobile/test/data/datasources/auth_remote_datasource_test.dart`) validando renderização, submissão e tratamento de erro.
  - Critério: `flutter test` no `mobile` executa com 100% dos 55+ testes verdes.

## Checklist de fechamento da feature

- [x] Rota `/register` acessível e funcional no `frontend-web`
- [x] Cadastro pelo aplicativo mobile cria o usuário no Supabase Auth e o registro no PostgreSQL (via NestJS)
- [x] Formulários de cadastro e login exibem mensagens claras de erro em vermelho quando houver falhas
- [x] `npm test` no `frontend-web` e `flutter test` no `mobile` 100% verdes sem falhas
- [x] Entrada em `backlog.md` atualizada para "concluído"

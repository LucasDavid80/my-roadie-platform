# Spec — 010: Correção da Tela de Cadastro (Web/Mobile) e Sincronização no Supabase Auth

## Objetivo

Garantir que a funcionalidade de cadastro de novos usuários funcione perfeitamente tanto no `frontend-web` quanto no `mobile`, corrigindo o roteamento e acesso à tela de cadastro na Web, assegurando que o registro via aplicativo crie a conta no Supabase Auth e o perfil correspondente no PostgreSQL (via API NestJS), e validando a autenticação real com feedback de erro adequado.

## Motivação

Conforme mapeado no `backlog.md` (Fase 1: Estabilização, Segurança & Bugs Críticos):
1. No `frontend-web`, a rota de cadastro não está acessível ou apresenta falhas de navegação.
2. No `mobile`, o formulário de cadastro exibe mensagem de sucesso, porém a conta não está sendo persistida no Supabase Auth / PostgreSQL por falhas na integração do fluxo de `signUp`.
3. Usuários precisam conseguir se cadastrar e efetuar login de forma confiável para que seus dados de perfil sejam carregados sem erros.

## Escopo

- **Frontend-Web (`frontend-web/`)**:
  - Ajustar rotas do Next.js App Router para disponibilizar a tela de cadastro (`src/app/(auth)/register/page.tsx` ou equivalente).
  - Conectar o formulário de cadastro Web ao `supabase.auth.signUp({ email, password, options: { data: { name, role } } })` e à criação de registro inicial no backend NestJS (`POST /users`).
  - Tratar exceções de validação e exibir feedbacks claros na UI.
  - Atualizar/adicionar testes unitários e de integração no Vitest.

- **Mobile (`mobile/`)**:
  - Auditar e corrigir `RegisterForm` / `RegisterPage` e `AuthRemoteDataSource.signUp`.
  - Garantir que a chamada de `signUp` registre as credenciais no Supabase Auth e chame o endpoint `createUser` no backend NestJS (`POST /users`) para gravar a linha do usuário no PostgreSQL.
  - Garantir tratamento de erros (ex.: e-mail já cadastrado, senha fraca, sem conexão).
  - Atualizar e expandir a suíte de testes de widget e unidade no Flutter (`flutter test`).

## Fora de Escopo

- Alterações no layout visual da área de perfil (`specs/009-correcao-area-de-perfil`).
- Login via redes sociais (OAuth Google/GitHub/Facebook).
- Fluxo de recuperação de senha por e-mail (Esqueci minha senha).

## Critérios de Sucesso

- [x] Usuário consegue acessar a tela de cadastro na Web (`/register`), preencher os dados (nome, e-mail, senha, cargo) e criar uma nova conta.
- [x] Cadastro realizado na Web cria a conta no Supabase Auth e o registro correspondente na tabela `User` do PostgreSQL via API NestJS.
- [x] Cadastro efetuado pelo aplicativo mobile cria com sucesso as credenciais no Supabase Auth e grava o registro do usuário na tabela `User` no PostgreSQL.
- [x] Tentar cadastrar um e-mail já existente ou com senha inválida exibe uma mensagem de erro clara em ambos os apps (Web e Mobile).
- [x] Todos os testes unitários e de integração no frontend-web (`npm test`) e mobile (`flutter test`) passam com 100% de sucesso.

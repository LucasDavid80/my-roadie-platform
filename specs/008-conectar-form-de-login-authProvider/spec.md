# Spec — 008: Conectar formulário de Login ao authProvider real (Supabase)

## Objetivo

Conectar a submissão do formulário de login (`LoginForm`) e a camada de contexto de autenticação (`AuthContext`) no frontend-web ao provedor real de autenticação do Supabase (`Supabase Auth`), eliminando a autenticação simplificada por apenas e-mail e exigindo a validação segura da senha do usuário.

## Motivação

Atualmente, o formulário de login aceita qualquer e-mail e realiza a autenticação diretamente via endpoint de teste do backend NestJS, ignorando a validação da senha no Supabase Auth. Essa brecha permite o bypass de autenticação por qualquer pessoa que informe o e-mail de um usuário existente. Conectar o formulário ao `Supabase Auth` garante autenticação real com hashing de senhas, gerenciamento seguro de sessões e proteção contra acesso indevido.

## Escopo

- Instanciar/centralizar o cliente do Supabase no frontend-web (`src/lib/supabase.ts`).
- Atualizar o `AuthContext` (`frontend-web/src/contexts/AuthContext.tsx`) para invocar `supabase.auth.signInWithPassword({ email, password })`.
- Integrar a autenticação do Supabase Auth com a recuperação do perfil do usuário e emissão/armazenamento do token JWT no estado local.
- Atualizar a interface do `LoginForm` (`frontend-web/src/components/features/auth/LoginForm.tsx`) para tratar exceções de autenticação e exibir mensagens amigáveis de erro (ex.: credenciais inválidas, falha de conexão).
- Atualizar e expandir a suíte de testes no Vitest (`AuthContext.spec.tsx`, `LoginForm.spec.tsx`, `LoginIntegration.spec.tsx`), garantindo a cobertura dos fluxos de autenticação com Supabase Auth.

## Fora de Escopo

- Alterações no aplicativo móvel (`mobile`), que já possui datasource e fluxo próprio via `supabase_flutter`.
- Alterações no layout visual ou estilização CSS dos componentes de Login.
- Implementação de recuperação de senha ("Esqueci minha senha") ou login via provedores sociais (OAuth Google/GitHub).

## Critérios de Sucesso

- [ ] Submeter o formulário de login com e-mail e senha válidos autentica o usuário com sucesso via `Supabase Auth` e redireciona para `/dashboard`.
- [ ] Submeter credenciais inválidas (senha incorreta ou e-mail inexistente) é bloqueado pelo `Supabase Auth` e exibe mensagem de erro clara na UI sem quebrar a aplicação.
- [ ] O token de acesso e as informações de perfil do usuário continuam sendo mantidos no `localStorage` e disponibilizados pelo `AuthContext`.
- [ ] A suíte de testes do frontend-web (`npm test` via Vitest) passa com 100% dos testes verdes, cobrindo cenários positivos e de erro no fluxo de autenticação conforme o padrão de qualidade da constituição.

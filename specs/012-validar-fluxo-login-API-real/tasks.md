# Tasks — 012: Validar e Testar Fluxo de Login com API Real

Pré-requisitos: Conexão básica com Supabase Auth (specs 008, 009 e 010 concluídas).

## Fase 0 — Diagnóstico e Auditoria dos Gargalos de Auth

- [x] T0.1 — Auditar a implementação atual de `JwtStrategy` e `JwtAuthGuard` no NestJS (`backend/src/modules/auth/` ou `backend/src/auth/`) para identificar limitações de validação de algoritmo (ES256/JWKS vs HS256) e ponto de descarte silencioso de erros 401.
  - Critério: Mapeamento dos arquivos afetados e padrão de erros registrado no `plan.md`.
- [ ] T0.2 — Mapear os fluxos de chamada da função `fetchProfile` no frontend-web (`AuthContext.tsx`) e no app mobile (`AuthRemoteDataSource`/`AuthNotifier`) para identificar a causa raiz do disparo duplo da requisição ao backend.
  - Critério: Locais exatos de duplicação mapeados e documentados.

## Fase 1 — Backend (NestJS): Suporte JWKS/ES256, Logging e Respostas 401 Detalhadas

- [ ] T1.1 — Atualizar a `JwtStrategy` do NestJS para suportar verificação de tokens JWT assinados via ES256 (com suporte a JWKS do Supabase Auth) e fallback seguro para HS256 em desenvolvimento local.
  - Critério: `JwtStrategy` valida com sucesso tokens com algoritmo ES256 e HS256 sem falhas de mismatch.
- [ ] T1.2 — Refatorar o método `handleRequest` no `JwtAuthGuard` para capturar exceções do `passport-jwt`, gerar logs explicativos no servidor e retornar `UnauthorizedException` com mensagens descritivas (`TOKEN_EXPIRED`, `INVALID_SIGNATURE`, `MALFORMED_TOKEN`, `MISSING_BEARER`) em substituição ao 401 mascarado.
  - Critério: Requisições com falha de token geram log descritivo no console e retornos JSON com código de erro amigável.
- [ ] T1.3 — Criar/atualizar testes unitários do backend (`jwt.strategy.spec.ts`, `jwt-auth.guard.spec.ts`).
  - Critério: Mínimo de 3 casos positivos (token ES256 válido, token HS256 válido, payload parseado) e 3 casos negativos (mismatch de algoritmo, token expirado, token sem Bearer) rodando com 100% de aprovação no Jest (`npm test`).

## Fase 2 — Frontend-Web: Deduplicação de `fetchProfile` e Feedback Visual de Erro

- [ ] T2.1 — Refatorar o `AuthContext.tsx` no `frontend-web` com travas de estado (`useRef`/flags de controle) para garantir que `fetchProfile` seja disparado **exatamente 1 vez** por ciclo de login ou reidratação de sessão.
  - Critério: Verificação por log/spy de teste confirmando uma única chamada ao endpoint `/users/me` por login.
- [ ] T2.2 — Atualizar o `LoginForm.tsx` e o `AuthContext.tsx` para tratar códigos e mensagens específicas de erro da API 401, exibindo alertas visuais amigáveis e orientações claras na UI do usuário.
  - Critério: Submissões inválidas ou sessão expirada exibem mensagens adequadas sem quebrar a aplicação.
- [ ] T2.3 — Atualizar testes no Vitest (`AuthContext.spec.tsx`, `LoginForm.spec.tsx`).
  - Critério: Teste validando disparo único de `fetchProfile` + 3 casos positivos e 3 negativos passando com 100% de sucesso no Vitest (`npm test`).

## Fase 3 — Mobile: Deduplicação de `fetchProfile` e Feedback Visual de Erro

- [ ] T3.1 — Refatorar o gerenciamento de estado de autenticação no `mobile` (`AuthRemoteDataSource`/`AuthNotifier`/`AuthController`) prevenindo chamadas redundantes a `fetchProfile` durante escutas do `onAuthStateChange`.
  - Critério: Chamada única a `fetchProfile` por autenticação confirmada no ciclo de vida.
- [ ] T3.2 — Tratar retornos de erro 401 e credenciais inválidas no formulário de login mobile, apresentando mensagens de erro acionáveis via UI (`SnackBar` ou mensagem em formulário).
  - Critério: UI exibe o motivo real do erro de autenticação para o usuário.
- [ ] T3.3 — Criar/atualizar testes de unidade e widget no Flutter (`flutter test`).
  - Critério: Teste de widget/unidade verificando chamada única de `fetchProfile` + 3 casos positivos e 3 negativos com 100% dos testes verdes.

## Fase 4 — Testes de Integração E2E e Validação da Cobertura

- [ ] T4.1 — Executar e ajustar a suíte de testes E2E do backend (`auth.e2e-spec.ts` / `users.e2e-spec.ts`) validando a integração completa de autenticação.
  - Critério: Testes E2E executam sem erros (`npm run test:e2e`).
- [ ] T4.2 — Medir e validar a cobertura de testes nos três projetos (Backend, Frontend-Web e Mobile).
  - Critério: Relatório de cobertura indicando >= 80% em cada um dos três projetos individualmente.

## Fase 5 — Checklist de Fechamento da Feature

- [ ] `spec.md`, `plan.md` e `tasks.md` da spec 012 alinhados e sem pendências
- [ ] Mismatch de algoritmo JWT (ES256/JWKS vs HS256) resolvido no backend
- [ ] Erros 401 genéricos substituídos por logs detalhados e mensagens amigáveis em todas as camadas
- [ ] Método `fetchProfile` executando **exatamente 1 vez** na Web e no Mobile
- [ ] Testes unitários, de integração e E2E verdes nos três projetos com no mínimo 3 casos positivos e 3 negativos em auth
- [ ] Meta de cobertura >= 80% atingida nos três projetos
- [ ] Entrada em `backlog.md` atualizada para "em spec → specs/012-validar-fluxo-login-API-real/"

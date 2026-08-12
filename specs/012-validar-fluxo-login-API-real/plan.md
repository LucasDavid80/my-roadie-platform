# Plan — 012: Validar e Testar Fluxo de Login com API Real

## 1. Visão Geral da Solução Técnica

Esta especificação define o plano técnico para auditar, refatorar e testar o fluxo de autenticação e login em toda a plataforma My Roadie (Backend NestJS, Frontend Web Next.js e Mobile Flutter). O objetivo é garantir o funcionamento correto contra o Supabase Auth e a API NestJS, tratando diretamente três pontos de falha recorrentes:

1. **Incompatibilidade de Validação JWT (ES256 / JWKS vs HS256)** no NestJS.
2. **Mascaramento de exceções com erro 401 genérico** sem detalhamento de causa raiz.
3. **Duplicação de invocações da função `fetchProfile`** na inicialização e pós-login nos clientes Web e Mobile.

## 2. Arquitetura e Estrutura dos Módulos

### 2.1 Backend (NestJS — `backend/src/modules/auth/` e `backend/src/auth/`)

- **Validação de Token (`JwtStrategy`)**:
  - Configurar `passport-jwt` para dar suporte a verificação de assinatura baseada em JWKS (JSON Web Key Sets) para tokens ES256 emitidos pelo Supabase Auth (`https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`), mantendo suporte fallback à chave simétrica `JWT_SECRET` (HS256) em ambientes de testes locais.
  - Utilizar `passport-jwt` com `secretOrKeyProvider` para resolver dinamicamente a chave de validação conforme o cabeçalho `alg` do token.

- **Captura e Diagnóstico de Erros (`JwtAuthGuard`)**:
  - Sobrescrever `handleRequest(err, user, info, context)` no `JwtAuthGuard`.
  - Inspecionar a propriedade `info` retornada pelo `passport-jwt` (ex.: `TokenExpiredError`, `JsonWebTokenError`, `NotBeforeError`, `Error: No auth token`).
  - Emitir logs estruturados no console do NestJS com `Logger.warn(...)` detalhando a causa exata da rejeição.
  - Lançar `UnauthorizedException` personalizada contendo mensagens amigáveis e códigos de erro específicos:
    - `TOKEN_EXPIRED`: "O token de autenticação expirou. Faça login novamente."
    - `INVALID_SIGNATURE`: "A assinatura do token é inválida ou houve mismatch de algoritmo (ES256/HS256)."
    - `MALFORMED_TOKEN`: "O formato do token fornecido é inválido."
    - `MISSING_BEARER`: "Cabeçalho de autorização (Bearer token) ausente."

### 2.1.1 Diagnóstico Detalhado da Auditoria (Task T0.1)

- **Arquivos Afetados Mapeados**:
  - `backend/src/modules/auth/strategies/jwt.strategy.ts`
  - `backend/src/modules/auth/guards/jwt-auth.guard.ts`
  - `backend/src/modules/auth/strategies/jwt.strategy.spec.ts`
  - `backend/src/modules/auth/guards/jwt-auth.guard.spec.ts` (novo arquivo de testes do guard)

- **Análise da Causa Raiz & Padrões de Erro**:
  1. **Algoritmos JWT em `JwtStrategy`**: O construtor do `PassportStrategy(Strategy)` não especifica a opção `algorithms: ['ES256', 'RS256', 'HS256']`. O `secretOrKeyProvider` atualmente repassa o token para o `passportJwtSecret` sem inspecionar previamente o parâmetro `alg` no cabeçalho JWT descompactado (`jwt.decode`). Ao receber tokens HS256 (comuns em dev local), a tentativa de buscar o `kid` no servidor JWKS do Supabase pode falhar ou gerar latência/descarte incorreto.
  2. **Descarte Silencioso no `JwtAuthGuard`**: A classe `JwtAuthGuard` estende `AuthGuard('jwt')` sem sobrescrever `handleRequest(err, user, info, context)`. O comportamento padrão do NestJS ignora a variável `info` (que carrega `TokenExpiredError`, `JsonWebTokenError`, `Error: No auth token`), lançando uma `UnauthorizedException` genérica sem log no console do servidor. Isso mascara erros de produção como um 401 opaco.

### 2.2 Frontend-Web (`frontend-web/src/`)

- **Deduplicação de `fetchProfile` (`src/contexts/AuthContext.tsx`)**:
  - Utilizar uma trava de controle (ex.: `isFetchingProfileRef` via `useRef` ou flag de estado no `AuthContext`) para garantir que o método `fetchProfile` seja invocado estritamente uma única vez por alteração de sessão.
  - Assegurar que os efeitos colaterais (`useEffect`) vinculados a `onAuthStateChange` do Supabase evitem chamadas síncronas paralelas à API do backend.

- **Tratamento de Erros no Formulário (`src/components/features/auth/LoginForm.tsx`)**:
  - Interceptar erros de requisição no cliente HTTP (`src/services/api.ts`) e no `AuthContext`.
  - Mapear exceções 401 e erros de credencial para mensagens claras na UI, exibindo feedbacks acionáveis ao usuário (ex.: "E-mail ou senha incorretos", "Sessão expirada").

### 2.3 Mobile (`mobile/lib/`)

- **Deduplicação de `fetchProfile` (`mobile/lib/presentation/controllers/` & `data/datasources/`)**:
  - Auditar os ouvintes da stream do Supabase (`auth.onAuthStateChange`) no `AuthRemoteDataSource` / `AuthNotifier`.
  - Implementar verificação de estado ou idempotência para que `fetchProfile` seja executado apenas no evento de login inicial ou reidratação de sessão persistida, descartando chamadas redundantes.

- **Feedback de Erro na Interface**:
  - Tratar exceções retornadas pela API e pelo Supabase Auth no controller de login.
  - Apresentar mensagens legíveis na UI via `SnackBar` ou `Text` de erro no formulário.

## 3. Cobertura de Testes e Estratégia de Garantia de Qualidade

Respeitando a `constitution.md` §5 (mínimo de 3 casos positivos e 3 negativos para módulos críticos de autenticação, com cobertura >= 80%):

### 3.1 Backend (`backend/`) — Jest Unit & Integration
- **Testes Positivos (Mínimo 3)**:
  1. Sucesso na validação de token válido ES256 via JWKS com injeção de payload do usuário no `req.user`.
  2. Sucesso na validação de token válido HS256 em ambiente de desenvolvimento local.
  3. `JwtAuthGuard` permite acesso a rota protegida e injeta o `userId` / `supabaseId` corretamente.
- **Testes Negativos (Mínimo 3)**:
  1. Rejeição de token com mismatch de algoritmo (tentativa de enviar token HS256 em endpoint configurado apenas para ES256 ou vice-versa).
  2. Rejeição de token expirado (`TokenExpiredError`) retornando código `TOKEN_EXPIRED` e log de diagnóstico.
  3. Rejeição de requisição sem cabeçalho Bearer ou com token malformado retornando mensagem descritiva sem mascaramento opaco.

### 3.2 Frontend-Web (`frontend-web/`) — Vitest
- **Testes Positivos (Mínimo 3)**:
  1. Login com e-mail/senha válidos autentica no Supabase Auth, aciona `fetchProfile` **uma única vez** e redireciona para `/dashboard`.
  2. Reidratação de sessão existente ao carregar a página aciona `fetchProfile` **uma única vez**.
  3. Armazenamento correto do token no `localStorage` e disponibilização do usuário logado no `AuthContext`.
- **Testes Negativos (Mínimo 3)**:
  1. Submissão de credenciais inválidas exibe mensagem de erro apropriada na UI sem invocar `fetchProfile`.
  2. Resposta 401 com erro de token expirado limpa a sessão local e redireciona para `/login`.
  3. Tentativa de login sem conexão exibe mensagem de erro de rede amigável ao usuário.

### 3.3 Mobile (`mobile/`) — Flutter Test
- **Testes Positivos (Mínimo 3)**:
  1. Login efetuado com sucesso autentica via Supabase e executa `fetchProfile` **uma única vez**.
  2. Verificação de sessão inicial persistida carrega o perfil do usuário sem chamadas duplicadas.
  3. Troca de estado para autenticado navega para a tela principal da aplicação.
- **Testes Negativos (Mínimo 3)**:
  1. Credenciais inválidas no aplicativo disparam feedback visual de erro sem travar a UI.
  2. Retorno 401 da API backend é tratado no controller e exibe mensagem de token inválido/expirado.
  3. Falha de comunicação com o backend durante `fetchProfile` mantém a aplicação em estado seguro de erro.

## 4. Análise de Conformidade com a Constitution

- **Stack Fixa (§1)**: Respeitada integralmente (NestJS, Next.js, Flutter, Supabase Auth, PostgreSQL).
- **Arquitetura Modular (§2)**: Mantida a separação de responsabilidades em `auth/` no backend, `AuthContext` na web e Clean Arch no mobile.
- **Qualidade & Testes (§5)**: Metas de cobertura >= 80% mantidas e padrão de 3+ testes positivos e 3+ negativos aplicados em cada suite.
- **Decisões Técnicas**: Nenhuma biblioteca externa não prevista ou mudança de paradigma foi adicionada; o plano utiliza primitivas existentes do `passport-jwt`, React e Flutter.

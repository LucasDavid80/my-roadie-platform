# Spec — 012: Validar e Testar Fluxo de Login com API Real

## Objetivo

Verificar a estabilidade e a resiliência do fluxo completo de autenticação e login contra o provedor real do Supabase Auth e a API do backend NestJS, eliminando problemas conhecidos em produção/homologação (mismatch de algoritmos JWT/JWKS, mascaramento de erros 401 genéricos e duplicação de chamadas `fetchProfile`) tanto no frontend-web quanto no aplicativo mobile.

## Motivação

Com a conclusão das specs 008, 009 e 010, os formulários de login e cadastro foram integrados ao Supabase Auth e ao backend NestJS. No entanto, em cenários de execução real e testes de integração, a plataforma enfrenta três problemas críticos de estabilidade e observabilidade no fluxo de autenticação:

1. **Mismatch de Algoritmo/Validação JWT (JWKS / ES256 vs HS256)**: O Supabase Auth assina tokens JWT utilizando chaves assimétricas (ES256 exposto via JWKS) ou chave simétrica (HS256 com segredo `JWT_SECRET`). Quando a `JwtStrategy` do NestJS está mal configurada para aceitar o algoritmo correto ou buscar a chave pública via JWKS, requisições autenticadas falham na verificação de assinatura com erros falsos-positivos de token inválido.
2. **Mascaramento por Erro 401 Genérico**: O backend NestJS e os clientes (web/mobile) frequentemente capturam e exibem um status "401 Unauthorized" genérico para qualquer falha (token expirado, assinatura inválida, ausência do cabeçalho Bearer, divergência de emissor/audiência ou usuário não encontrado no banco de dados). Isso impede a interface do usuário de fornecer feedback claro e dificulta o diagnóstico de erros nos logs do servidor.
3. **Duplicação de `fetchProfile` (`fetchProfile` disparando 2x)**: Na inicialização da sessão ou logo após a submissão do login, re-renders no frontend-web (`AuthContext`) e múltiplos escutadores de estado no aplicativo mobile acionam a função `fetchProfile` duas vezes consecutivas. Essa duplicação causa requisições redundantes ao endpoint `/users/me`, desperdício de banda e potenciais *race conditions* de estado.

A validação rigorosa desse fluxo e a criação de testes focados nesses casos de borda garantem que o login funcione de forma robusta e auditável em todos os ambientes.

## Escopo

- **Backend NestJS (`backend/`)**:
  - Ajustar e validar a configuração do `JwtStrategy` e `JwtAuthGuard` para dar suporte correto a tokens do Supabase Auth assinados com ES256 (via JWKS) e HS256.
  - Refatorar a captura de exceções de autenticação no NestJS para gerar logs detalhados de diagnósticos no console do servidor e retornar respostas de erro com códigos e mensagens descritivas (`TOKEN_EXPIRED`, `INVALID_SIGNATURE`, `MALFORMED_TOKEN`, `MISSING_BEARER`) em vez de um 401 genérico mascarado.
  - Expandir a suíte de testes do backend (`auth.service.spec.ts`, `jwt.strategy.spec.ts`, `jwt-auth.guard.spec.ts`).

- **Frontend-Web (`frontend-web/`)**:
  - Refatorar o `AuthContext` para deduplicar e garantir a execução idêntica e única do `fetchProfile` durante a inicialização e após a submissão de login.
  - Tratar as respostas de erro detalhadas da API no `LoginForm` e no `AuthContext` para exibir mensagens de orientação adequadas ao usuário na UI.
  - Expandir os testes unitários e de integração no Vitest (`AuthContext.spec.tsx`, `LoginForm.spec.tsx`).

- **Mobile (`mobile/`)**:
  - Auditar e refatorar o ciclo de vida de autenticação (`AuthRemoteDataSource`/`AuthNotifier`/`AuthController`) para assegurar que `fetchProfile` seja chamado exatamente uma vez por evento de autenticação.
  - Exibir mensagens amigáveis e específicas de erro na UI mobile quando o login ou a renovação de token falhar.
  - Expandir os testes de unidade e widget em `flutter test`.

- **Testes de Integração e Cobertura**:
  - Garantir cobertura mínima de 80% nos três ecossistemas (backend, web, mobile), com no mínimo 3 casos positivos e 3 casos negativos por módulo/mecanismo de autenticação, cobrindo explicitamente os cenários de erro de borda identificados.

## Fora de Escopo

- Alterações na estrutura de tabelas ou migrações do PostgreSQL (`prisma/schema.prisma`).
- Mudanças de layout ou redesign de componentes visuais das telas de login/cadastro.
- Autenticação via redes sociais (OAuth Google, GitHub, Apple).
- Recuperação de senha por e-mail ("Esqueci minha senha").

## Critérios de Sucesso

- [x] Login com credenciais válidas autentica com sucesso contra a API real e o Supabase Auth no frontend-web e no aplicativo mobile, carregando o perfil do usuário corretamente.
- [x] A validação de tokens na `JwtStrategy` do NestJS aceita e verifica corretamente tokens emitidos pelo Supabase Auth (suporte a ES256/JWKS e HS256) sem rejeições indevidas.
- [x] Requisições com tokens inválidos, expirados ou ausentes registram logs com a causa exata no NestJS e retornam respostas com detalhamento amigável (sem 401 genérico mascarado).
- [x] O método `fetchProfile` é acionado **exatamente 1 vez** durante a inicialização da sessão / processo de login no frontend-web e no aplicativo mobile.
- [x] Suítes de testes unitários e de integração no backend (`npm test`), frontend-web (`npm test`) e mobile (`flutter test`) rodam com 100% de sucesso, cobrindo pelo menos 3 casos positivos e 3 negativos por módulo (incluindo mismatch JWKS, 401 mascarado e duplicação de `fetchProfile`), mantendo a cobertura >= 80% em cada projeto.

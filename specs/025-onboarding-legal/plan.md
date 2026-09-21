# Plano Técnico — 025: Onboarding Legal

## 1. Arquitetura e Decisões Técnicas
- **Documentos Legais:** Os conteúdos estáticos (Termos de Uso e Política de Privacidade) ficarão hospedados de forma estática no Frontend Web. O app mobile e a web farão referência aos mesmos links e à mesma versão do documento para coletar consentimento.
- **Registro do Consentimento:** Para simplicidade e rapidez (sem criar tabelas de log complexas na V1), adicionaremos os campos de versão e data de aceite diretamente na tabela `User`.
- **Estratégia de Controle (UX Block):** O backend fornecerá em `GET /legal/current-version` a versão vigente. No frontend e no mobile, ao obter o payload do usuário autenticado e verificar sua `termsAcceptedVersion`, a aplicação validará contra a versão em vigor. Se for inferior ou nula, um Guard bloqueará a rota e abrirá o Modal de Aceite.
- **Segurança Opcional no Backend:** Poderíamos criar um Global Guard no NestJS bloqueando todas as requisições se `user.termsAcceptedVersion < CURRENT_VERSION`, porém isso tem um overhead alto para cada chamada. O bloqueio de navegação via interface (Frontend/Mobile) supre o requisito de aceite obrigatório de forma fluida.

## 2. Modelagem de Dados / Contratos
### `schema.prisma`
Adicionar os campos na entidade `User`:
```prisma
model User {
  // ... campos existentes
  termsAcceptedVersion   String?   @db.VarChar(50)
  termsAcceptedAt        DateTime?
}
```
*(Se for necessário separar os termos e a política, podemos adicionar `privacyAcceptedVersion`, mas geralmente o aceite é unificado. Faremos unificado).*

### Endpoints NestJS
- `GET /legal/current-version` -> Retorna a versão ativa atual. Ex: `{ "version": "v1.0.0", "updatedAt": "2026-09-20T00:00:00Z" }`.
- `POST /users/me/consent` -> Atualiza a versão aceita do usuário autenticado no banco. Payload: `{ termsVersion: string }`.

## 3. Estrutura de Arquivos Afetados
- `backend/prisma/schema.prisma`
- `backend/src/legal/legal.controller.ts` e `legal.service.ts` (Novo Módulo Simples)
- `backend/src/users/users.controller.ts` e `users.service.ts`
- `frontend-web/src/app/(public)/termos/page.tsx`
- `frontend-web/src/components/LegalConsentModal.tsx`
- `mobile/lib/features/legal/...`
- `mobile/lib/core/guards/legal_guard.dart` (Para injetar a checagem no shell/router)

## 4. Estratégia de Testes
- **Backend:** Testar retorno da versão atual, e testar sucesso/erro na tentativa de aceitar os termos (ex: não autenticado, payload inválido).
- **Backend E2E:** Simular registro e chamada do POST para consentir.
- **Frontend/Mobile:** Validar que, se o DTO de usuário no estado global (`AuthContext` ou `AuthBloc`) tem uma versão desatualizada, o aplicativo renderiza o modal forçando a aprovação.

# 📜 Constitution — My Roadie Platform

> Este documento define os princípios que **não mudam feature a feature**. Todo `spec.md` / `plan.md` / `tasks.md` novo deve respeitar o que está aqui. Se uma feature exigir quebrar uma regra desta constituição, a mudança precisa ser discutida e refletida *aqui* primeiro, não silenciosamente no código.

## 1. Stack (fixa, salvo decisão explícita em contrário)

| Camada | Tecnologia |
|---|---|
| Backend | NestJS + TypeScript, Node 20 (LTS) |
| Frontend Web | Next.js (App Router) + TypeScript |
| Mobile | Flutter (Windows/macOS/Linux/Android/iOS) |
| Banco de dados | PostgreSQL via Supabase |
| ORM | Prisma |
| Autenticação | Supabase Auth + JWT |

Trocar qualquer item desta tabela é uma decisão de arquitetura, não uma decisão de feature — deve virar uma atualização explícita deste arquivo, não uma escolha isolada dentro de um `plan.md`.

## 2. Arquitetura modular

- **Backend:** um módulo NestJS por domínio (`src/modules/<dominio>`), com `controller`, `service`, `dto/`, `entities/`, testes `.spec.ts` colocados junto do código, e testes e2e em `backend/test/`.
- **Frontend Web:** Route Groups (`(dashboard)`, `(auth)`) organizam layout sem afetar URL; chamadas de API isoladas em `src/services/`; tipos compartilhados em `src/types/`.
- **Mobile:** Clean Architecture em três camadas — `domain/` (entities, interfaces, casos de uso), `data/` (datasources, models, repositories), `presentation/` (controllers, screens, widgets).
- Nenhuma camada deve pular a anterior: a UI (web ou mobile) nunca fala direto com o banco — sempre via API do backend.

## 3. Contrato Backend ⇄ Frontend/Mobile

- O backend usa `ValidationPipe` com `forbidNonWhitelisted: true`. **Toda** requisição `POST`/`PATCH` do frontend/mobile deve remover campos gerados pelo banco (`id`, `createdAt`, `updatedAt`) antes de enviar, ou a API retorna 400.
- Mudança de schema (`prisma/schema.prisma`) exige: gerar migration → `npx prisma generate` → atualizar `docs/database/erd.md` → atualizar tipos no frontend (`src/types`) e nos models do mobile (`data/models`, `domain/entities`).
- Toda entidade nova no Prisma só é considerada "disponível" quando tiver controller + service + DTOs expostos — **schema não é feature entregue**.

## 4. Autenticação e autorização

- Fluxo de conta: criar no Supabase Auth → criar perfil no backend usando o `supabaseId` retornado.
- Toda rota que dependa de identidade usa `@UseGuards(JwtAuthGuard)`.
- Ações de escrita sensíveis (update/delete de perfil) usam `OwnershipGuard`: o usuário só mexe no próprio recurso, exceto `ADMIN`.
- Recursos vinculados a uma `Band` verificam associação via `BandMember`, não apenas o papel global do usuário.
- Papéis: `MUSICIAN`, `ROADIE`, `ADMIN` — a matriz de permissões vive em `docs/auth/roles-permissions.md` e deve ser atualizada sempre que uma feature nova introduzir uma ação nova.

## 5. Qualidade e testes

- Backend: Jest (unit + e2e), `NestJS TestingModule`, mocks via `useValue` para dependências externas (Supabase, etc.).
- Frontend Web: Vitest.
- Mobile: `flutter_test`.
- **Padrão mínimo por tarefa que toca lógica de negócio:** pelo menos 1 caso de sucesso e 1 caso de erro/borda cobertos por teste. Para módulos críticos (auth, guards, transações financeiras), o padrão sobe para no mínimo 3 casos positivos e 3 negativos.
- **Meta de cobertura: 70-80% em cada uma das três partes** (backend, frontend-web, mobile), medida separadamente — cobertura alta em um app não compensa cobertura baixa em outro.
  - **Backend (Jest):** configurar `coverageThreshold` no `jest.config` (ou seção `jest` do `package.json`):
    ```json
    "coverageThreshold": {
      "global": { "branches": 70, "functions": 75, "lines": 75, "statements": 75 }
    }
    ```
    Rodar com `npm test -- --coverage`.
  - **Frontend Web (Vitest):** habilitar `test.coverage` no `vitest.config.ts` com provider `v8` (ou `istanbul`) e `thresholds` equivalentes (70-80%). Rodar com `npm test -- --coverage`.
  - **Mobile (Flutter):** `flutter test --coverage` gera `coverage/lcov.info`; usar `lcov`/`genhtml` (ou um step de CI que leia o lcov) para falhar o build abaixo do limiar. Vale excluir arquivos gerados (`*.g.dart`, `*.freezed.dart`) do cálculo.
  - **CI:** os três jobs de teste (`test` no backend, equivalente no frontend-web, e o step de mobile) devem falhar o pipeline se a cobertura cair abaixo de 70%; 80% é a meta a perseguir, 70% é o piso que não se cruza.
  - Cobertura é um piso de qualidade, não o objetivo em si — não escrever teste vazio só para bater número; se uma linha é difícil de cobrir de forma significativa, prefira refletir isso numa revisão de design em vez de simular cobertura.
- CI local: usar `act --secret-file .secrets` para simular o GitHub Actions antes de abrir PR.
- Lint/testes devem passar localmente antes de pedir review — não delegar isso só ao CI.

## 6. Segurança

- Nunca comitar `.env`, `.secrets` ou qualquer credencial.
- Variáveis obrigatórias: `DATABASE_URL`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_KEY` (backend); `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (frontend).
- `SUPABASE_SERVICE_ROLE` (chave privilegiada) nunca é exposta ao frontend/mobile — uso exclusivo do backend.

## 7. Commits e fluxo de PR

- Mensagens descritivas, com escopo quando fizer sentido: `backend: add transactions service`, `mobile: wire agenda repository to API`.
- PRs pequenas e focadas — uma feature (ou uma fase da feature) por PR sempre que possível.
- Toda PR de feature referencia a `tasks.md` correspondente da feature.

## 8. Como uma feature nova entra no projeto

1. Vira uma entrada em `backlog.md`.
2. Quando priorizada, ganha `specs/<numero>-<nome>/spec.md` (o quê e por quê, sem detalhe de implementação).
3. Depois `plan.md` da feature (como, tecnicamente, respeitando esta constituição).
4. Depois `tasks.md` da feature (passos executáveis, com critério de teste por tarefa).
5. **Cria-se uma branch própria a partir da `main` atualizada:** `git checkout -b spec/<numero>-<nome-curto>` (mesmo nome da pasta em `specs/`). Nenhuma spec é implementada direto na `main`, e nenhuma branch de spec mistura trabalho de duas specs diferentes — se durante o trabalho aparecer código de outra feature no `git status`, é sinal de que ele foi parar na branch errada.
6. Implementação segue as tasks em ordem, com commit por task/fase; tasks marcadas como concluídas por um agente de IA em itens que tocam infraestrutura externa (Supabase, deploy, variáveis de ambiente, assinatura de app) são **revisadas manualmente** antes de fechar a fase.
7. Ao fechar a feature (checklist de `tasks.md` 100% `true`), merge pra `main` com `git merge --no-ff spec/<numero>-<nome-curto>` (preserva o histórico de commits por task) e apaga a branch.

## 9. Estrutura de rotas do Frontend Web

Duas notações do Next.js App Router não fazem a mesma coisa — vale deixar isso explícito para não misturar:

- `(nome)` — **Route Group**: organiza pastas/layouts, mas **não aparece na URL**. É o que já existe: `(auth)` e `(dashboard)`.
- `[nome]` — **Dynamic Segment**: aparece na URL como parâmetro real (`/perfil/[id]` → `/perfil/abc123`). Não é um placeholder de "nome da página", é um segmento de rota de fato dinâmico.

Com isso, a estrutura de 3 níveis de acesso fica assim:

| Nível | Route Group | Guarda de acesso | Exemplo de página |
|---|---|---|---|
| Não logado | `(auth)` (já existe) | redireciona para `/dashboard` se já houver sessão | `/login`, `/register` |
| Logado (qualquer papel) | `(dashboard)` (já existe) | redireciona para `/login` se não houver sessão | `/dashboard`, `/profile` |
| Admin | `(admin)` — **novo**, separado do `(dashboard)` | exige sessão **e** `role === ADMIN` | `/admin`, `/admin/users` |

Recomendação: **promover `(dashboard)/admin` para um Route Group próprio `(admin)`**, em vez de deixar aninhado, porque a checagem de acesso do admin é uma regra a mais (papel específico) sobre a checagem do dashboard (só sessão). Isolar os dois evita que uma página admin "esqueça" de checar o papel por herdar só o guard do dashboard.

Cada Route Group tem seu próprio `layout.tsx` fazendo a guarda correspondente:

```
src/app/
├── (auth)/
│   ├── layout.tsx        // se já logado → redirect /dashboard
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── layout.tsx        // se não logado → redirect /login
│   ├── dashboard/page.tsx
│   └── profile/page.tsx
└── (admin)/
    ├── layout.tsx        // se não logado → redirect /login; se role != ADMIN → 403/redirect
    └── admin/page.tsx
```

Se a intenção era outra — por exemplo, uma página de **perfil público** por músico/banda (`/[nome]` ou `/perfil/[slug]`, acessível sem login, mostrando agenda/repertório pública) — isso é uma dynamic segment de verdade e é uma feature própria (rota pública lendo dados de um `User`/`Band` específico), não um dos três níveis de acesso. Vale abrir como uma spec separada se for essa a ideia, porque envolve decidir o que fica público (nome, instrumentos, disponibilidade) vs. o que continua restrito (telefone, cachê mínimo, financeiro).

## 10. Privacidade e Proteção de Dados (LGPD)

*Aviso: isto é uma leitura técnica do que já está implementado, não um parecer jurídico — para certificar conformidade de fato, vale uma revisão com alguém especializado em LGPD.*

**O que já ajuda:**
- Autenticação delegada ao Supabase Auth (hashing de senha, emissão de token gerenciados por um provedor especializado, em vez de reimplementado à mão).
- `JwtAuthGuard` em rotas que expõem dados pessoais.
- `OwnershipGuard` limita que um usuário edite/exclua apenas o próprio registro.
- `ValidationPipe` com whitelist reduz superfície de dados aceitos por requisição.

**O que ainda não está coberto pelo código (e a LGPD cobra isso em algum nível):**
- **Base legal e consentimento:** não há, na spec atual, um registro de que o usuário consentiu com a coleta de campos sensíveis (telefone, cidade/UF, cachê mínimo, Instagram). Vale um checkbox de consentimento no cadastro + link para política de privacidade, com o texto da política vivendo fora do código (ou em `docs/legal/`).
- **Direito de exclusão (art. 18):** ao deletar um `User`, confirmar se a exclusão é real (hard delete) ou só lógica, e o que acontece com dados relacionados (`Event.createdById`, `Transaction.userId`) — decisão de anonimizar vs. cascatear precisa estar explícita, não implícita no comportamento do Prisma.
- **Direito de portabilidade (art. 18, V):** hoje não existe endpoint de "exportar meus dados". Não é bloqueante para v1, mas é esperado num produto que lida com dados de terceiros (a agenda/dados de uma banda envolve dados de outras pessoas além do dono da conta).
- **Dados sensíveis por associação:** `Transaction` e `minCache` são dados financeiros — a LGPD não os trata como "categoria sensível" (que é saúde, biometria, origem racial, etc.), mas merecem o mesmo padrão de acesso restrito que dados sensíveis, já que vazamento tem impacto real.
- **Transferência internacional (art. 33):** o Supabase pode hospedar dados fora do Brasil dependendo da região do projeto — vale confirmar a região do projeto Supabase e se isso está coberto no termo de uso/política de privacidade.
- **Log/auditoria de acesso:** não há, no código visto, registro de quem acessou/alterou dados de outro usuário (além do que os guards impedem). Para incidentes de segurança, um log mínimo de acesso a dados sensíveis ajuda a cumprir a obrigação de notificação em caso de vazamento (art. 48).
- **Criptografia em repouso:** depende da configuração do projeto Supabase (normalmente já criptografa em repouso por padrão), mas vale confirmar explicitamente e documentar aqui, em vez de assumir.

**Como tratar isso no fluxo de SDD:** cada um dos pontos acima pode virar uma entrada no `backlog.md` (ex.: "Endpoint de exportação de dados do usuário", "Fluxo de consentimento no cadastro", "Política de exclusão de conta") e ganhar spec própria quando priorizado — não é algo para resolver "de passagem" dentro de outra feature.

---
*Esta constituição é a fonte de verdade para convenções do projeto. `AGENTS.md` e `GEMINI.md` devem apontar para ela, não duplicá-la.*

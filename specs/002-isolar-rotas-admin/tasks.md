# Tasks — 002: Isolar rotas de Admin

Pré-requisitos: nenhum (independente da 001).

## Fase 1 — Mover estrutura

- [x] T1.1 — `git mv` do conteúdo de `(dashboard)/admin` para `(admin)/admin`.
  - Critério: build do Next.js continua funcionando (`npm run build` sem erro), sem regressão.

## Fase 2 — Guarda de acesso

- [x] T2.1 — Criar `(admin)/layout.tsx` com a guarda descrita em plan.md.
  - Critério de teste: 1 caso positivo (admin acessa) + 2 casos negativos (sem sessão / sessão não-admin).
- [x] T2.2 — Testar manualmente os 3 cenários de acesso (sem sessão, não-admin, admin).
  - Critério: os 3 comportamentos batem com o "Critério de sucesso" da spec.md.

## Fase 3 — Limpeza

- [x] T3.1 — Buscar referências antigas ao caminho de arquivo `(dashboard)/admin` no código (imports, testes) e corrigir.
- [x] T3.2 — Confirmar que nenhuma URL mudou (Route Group não deveria alterar isso).

## Checklist de fechamento da feature

- [x] `(dashboard)/admin` não existe mais
- [x] `(admin)/layout.tsx` bloqueia corretamente os 3 cenários
- [x] Nenhuma URL pública mudou
- [x] `spec.md`/`plan.md` da baseline (raiz) atualizados se a estrutura de rotas documentada lá precisar refletir isso
- [x] `backlog.md` — entrada "Isolar rotas de admin" removida/marcada como resolvida

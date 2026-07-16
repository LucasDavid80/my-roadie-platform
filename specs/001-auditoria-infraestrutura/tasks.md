# Tasks — 001: Auditoria de Infraestrutura

Pré-requisitos: nenhum. Esta é a primeira spec real do projeto.

## Fase 1 — Cobertura de testes

- [x] T1.1 — Rodar cobertura do backend (`npm test -- --coverage`) e registrar % de statements/branches/functions/lines.
  - Critério: número documentado em `plan.md` (raiz), com data.
- [x] T1.2 — Rodar cobertura do frontend-web; configurar `coverage` no `vitest.config.ts` se ainda não existir.
  - Critério: número documentado em `plan.md` (raiz), com data.
- [x] T1.3 — Rodar cobertura do mobile (`flutter test --coverage` + `lcov --summary`).
  - Critério: número documentado em `plan.md` (raiz), com data.

## Fase 2 — Confirmar stack do frontend-web

- [x] T2.1 — Confirmar biblioteca de estilização real (Tailwind vs. Styled Components) via `package.json` + uso no código.
- [x] T2.2 — Confirmar gerenciamento de estado real (Context API vs. Redux vs. Zustand).
- [x] T2.3 — Confirmar cliente HTTP real (Axios vs. Fetch API).
- [x] T2.4 — Atualizar `docs/architecture/frontend.md` removendo os três placeholders.

## Checklist de fechamento da feature

- [ ] `plan.md` (raiz) atualizado com tabela de cobertura real
- [ ] `docs/architecture/frontend.md` sem placeholders entre colchetes
- [ ] `backlog.md` atualizado (entrada de cobertura resolvida/removida)
- [ ] Nenhum código de produto foi alterado nesta spec (escopo era só medir e documentar)

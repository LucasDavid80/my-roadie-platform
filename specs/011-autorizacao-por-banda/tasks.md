# Tasks — 011: Autorização por Banda

Pré-requisitos: nenhum. É correção sobre módulos já entregues (specs 004, 005, 006).

## Fase 0 — Confirmar antes de codar

- [x] T0.1 — Ler `jwt.strategy.ts` e confirmar o formato de `req.user` (campos `id`/`role`), reaproveitando o padrão já usado por `OwnershipGuard`.
- [ ] T0.2 — Confirmar nomes de campo do `BandMember` no `schema.prisma`.
- [ ] T0.3 — Confirmar se existe `@CurrentUser()` (ou equivalente) já usado em `users`/`events`; se não existir, criar um só, reaproveitado pelos três módulos.

## Fase 1 — BandAccessService

- [ ] T1.1 — Criar `band-access.module.ts` + `band-access.service.ts` com `getUserBandIds` e `assertMembership`.
  - Critério: 3 casos positivos (membro passa, admin passa, mais de uma banda) + 3 negativos (não-membro, bandId inexistente, userId inexistente) em `band-access.service.spec.ts`.

## Fase 2 — Aplicar em Repertoire

- [ ] T2.1 — `create`/`findOne`/`update`/`remove` chamando `assertMembership`.
- [ ] T2.2 — `findAll` sem `bandId` filtrando por `getUserBandIds`, nunca retornando tudo.
- [ ] T2.3 — Testes: 3 positivos + 3 negativos cobrindo os 4 cenários do critério de sucesso da spec.

## Fase 3 — Aplicar em Transactions

- [ ] T3.1 — Mesmo padrão da Fase 2, preservando os filtros existentes (`userId`, `eventId`, `type`).
- [ ] T3.2 — Testes: 3 positivos + 3 negativos.

## Fase 4 — Aplicar em Tasks

- [ ] T4.1 — `create` resolvendo `event.bandId` antes de checar.
- [ ] T4.2 — `findOne`/`update`/`remove` buscando task com `event` incluso, checando `task.event.bandId`.
- [ ] T4.3 — `findAll` sem `eventId` filtrando por bandas do usuário via relação `event.bandId`.
- [ ] T4.4 — Testes: 3 positivos + 3 negativos.

## Fase 5 — Verificar clientes (frontend-web / mobile)

- [ ] T5.1 — Grepar `frontend-web/src` e `mobile/lib` por chamadas a `/repertoire` e `/transactions` sem `bandId`; ajustar se alguma tela depender do comportamento antigo (vazamento).
- [ ] T5.2 — Rodar `npm test`/`flutter test` desses dois clientes e confirmar que nada quebrou por causa da nova restrição.

## Checklist de fechamento da feature

- [ ] Testes unitários (`npm test`) e E2E (`npm run test:e2e`) do backend 100% verdes
- [ ] `band-access.service.spec.ts` com 3 positivos + 3 negativos
- [ ] Cada um dos três módulos com 3 positivos + 3 negativos cobrindo autorização
- [ ] Nenhum `findAll` retorna dado de banda que o usuário não participa
- [ ] Frontend-web e mobile testados contra a nova restrição (Fase 5)
- [ ] `spec.md`/`plan.md` da baseline (raiz) atualizados removendo esta lacuna de `plan.md` §8
- [ ] `backlog.md` — se essa lacuna tiver entrada própria, marcada como resolvida

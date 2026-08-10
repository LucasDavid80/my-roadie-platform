# Plan — 011: Autorização por Banda

## Passo 0 — Confirmar antes de codar (não presumir)

1. Abrir `backend/src/modules/auth/strategies/jwt.strategy.ts` e confirmar exatamente o formato de `req.user` (tem `id`? tem `role`? os nomes dos campos batem com o que os guards existentes — `OwnershipGuard` — já usam?). Reaproveitar o mesmo formato, não inventar um novo.
2. Confirmar o nome exato dos campos do model `BandMember` no `schema.prisma` (`userId`, `bandId`, e como o papel dentro da banda é chamado).
3. Confirmar como `docs/auth/roles-permissions.md` define o bypass de `ADMIN` hoje (é `role === 'ADMIN'` no JWT? é preciso reconsultar o banco?).

Essas três confirmações evitam reescrever algo que já existe com nome diferente.

## Desenho da solução

Em vez de um guard genérico único (cada módulo resolve `bandId` de um jeito diferente — direto no body para Repertoire/Transaction, indireto via `Event` para Task), criar um **serviço compartilhado** injetável nos três módulos:

```
backend/src/modules/band-access/
├── band-access.module.ts
├── band-access.service.ts
└── band-access.service.spec.ts
```

`BandAccessService`:
- `getUserBandIds(userId: string): Promise<string[]>` — lista de bandas que o usuário participa (via `BandMember`).
- `assertMembership(userId: string, role: string, bandId: string): Promise<void>` — não lança nada se `role === 'ADMIN'` ou se existir `BandMember` para `[userId, bandId]`; lança `ForbiddenException` caso contrário.

Cada `service.ts` dos três módulos passa a chamar `assertMembership` (ou `getUserBandIds` para filtrar `findAll`) — a checagem fica explícita em cada método, não escondida atrás de um decorator genérico difícil de auditar depois.

## Aplicação por módulo

### Repertoire (`bandId` é campo direto)
- `create`: `assertMembership(user.id, user.role, dto.bandId)` antes de criar.
- `findAll(bandId?)`: se `bandId` vier, `assertMembership` e filtra por ele; se não vier, `where: { bandId: { in: await getUserBandIds(user.id) } }`.
- `findOne/update/remove(id)`: buscar a música primeiro (já existe essa busca no `findOne` atual), depois `assertMembership(user.id, user.role, song.bandId)`.

### Transactions (mesmo padrão do Repertoire — `bandId` direto)
- Idêntico ao Repertoire, mas atenção ao `findAll` que já aceita `userId`/`eventId`/`type` como filtro adicional — a checagem de banda entra **antes** desses filtros, não substitui.

### Tasks (`bandId` indireto, via `Event`)
- `create`: já busca o `Event` pelo `eventId` (código atual) — depois de achar o evento, `assertMembership(user.id, user.role, event.bandId)`.
- `findAll(eventId?)`: se vier `eventId`, buscar o evento e validar a banda dele; se não vier, restringir a `where: { event: { bandId: { in: await getUserBandIds(user.id) } } }` (usar filtro relacional do Prisma).
- `findOne/update/remove(id)`: buscar a task com o evento relacionado (`include: { event: true }`), depois `assertMembership(user.id, user.role, task.event.bandId)`.

## Controllers

Os controllers precisam passar `req.user` pro service (hoje eles nem injetam `@Req()`/`@CurrentUser()`). Confirmar se já existe um decorator `@CurrentUser()` no projeto (usado em `users`/`events`) e reaproveitar; só criar um novo se não existir.

## Testes

Para cada módulo, no mínimo:
- 3 positivos: membro da banda cria / lê / edita com sucesso; `ADMIN` acessa banda que não é dele.
- 3 negativos: não-membro tentando create → 403; não-membro tentando update/remove de recurso existente → 403; `findAll` sem `bandId` de um usuário sem nenhuma banda → lista vazia (não erro, não vaza dado).

## Migração de dado / risco

Nenhuma migration de schema é necessária (o `BandMember` já existe). O risco real é **quebrar fluxo hoje "funcionando por acidente"** — se o frontend-web ou o mobile hoje dependem implicitamente do vazamento (ex.: uma tela que lista tudo sem passar `bandId` porque "sempre funcionou"), ela vai quebrar depois desta spec. Vale grepar o frontend-web e o mobile por chamadas a `/repertoire` e `/transactions` sem `bandId` antes de fechar, e ajustar o client se for o caso — isso entra como task própria na Fase 4.

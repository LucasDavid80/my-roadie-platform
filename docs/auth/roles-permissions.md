# Roles & Permissions

Papéis definidos no sistema:

- MUSICIAN
  - Pode criar e editar próprios eventos, tarefas e repertório da sua banda.
  - Pode visualizar transações e eventos relacionados às suas bandas.

- ROADIE
  - Permissões semelhantes ao MUSICIAN; frequentemente gerencia tarefas e logística.
  - Pode ser atribuído como responsável por tarefas em eventos de bandas.

- ADMIN
  - Acesso global: criar/editar/deletar quaisquer recursos, gerenciar usuários, bandas e transações.

Matriz simplificada (Read / Create / Update / Delete / Notes):

- MUSICIAN: R, C (own/band), U (own/band), D (own)
- ROADIE: R, C (own/band), U (assigned), D (own)
- ADMIN: R, C, U, D (global)

Observações importantes:
- Usuários são vinculados a um supabaseId (ID do provedor de autenticação). O backend espera receber `supabaseId` ao criar o perfil.
- Band e BandMember introduzem modelos de colaboração: membros podem ter papéis dentro da banda (ex.: owner, member).

Implementação / recomendação técnica:
- Validar autorização via Guards no backend (ex.: JwtAuthGuard + checagem de role).
- Para ações sensíveis, verificar que `user.id === resource.createdById` ou `role === 'ADMIN'`.
- Para recursos ligados a Band, verificar associação via `BandMember` (ex.: `user` é membro da `band`).
- Para fluxos de signup com Supabase: crie o usuário no Supabase Auth e em seguida crie o perfil no backend usando o `supabaseId` retornado.
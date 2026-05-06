# Regras de Negócio — My Roadie

Resumo das regras centrais atualmente implementadas:

1. Usuários e Papéis
   - Roles: MUSICIAN, ROADIE, ADMIN.
   - Usuários têm `email` único e `supabaseId` (identificador no provedor de Auth). O fluxo de criação: criar conta no Supabase Auth → criar perfil no backend com `supabaseId`.
   - Admins podem gerenciar bandas, eventos e usuários.

2. Bandas
   - Band é uma entidade colaborativa com membros (BandMember).
   - BandMember tem `role` (ex.: owner/member) e a relação única [userId, bandId].
   - Ações na banda (ex.: adicionar músicas ao repertório) são permitidas para membros apropriados.

3. Eventos
   - Eventos têm status: PENDING, CONFIRMED, FINISHED, CANCELLED.
   - Eventos pertencem a uma Band; somente criador, membros da banda com permissão ou ADMIN podem editar/deletar.

4. Tarefas
   - Tasks pertencem a um Event; marcar como concluída atualiza o estado do task e pode alterar UX no frontend.

5. Transações
   - Transactions registram entradas/saídas financeiras ligadas a Band, Event e User.
   - Campos principais: description, amount (Decimal), type (INCOME/EXPENSE), date.

6. Autenticação
   - Fluxo principal usa Supabase Auth no frontend; backend valida identidade via `supabaseId` e/ou tokens JWT.
   - Rotas protegidas requerem autenticação e checagens de autorização por role/associação.

7. Dados e Migrations
   - Alterações em `prisma/schema.prisma` exigem: `npx prisma migrate` (quando aplicável) e `npx prisma generate` antes de build/test.

Observações:
- Regras por endpoint estão nos controllers/services do backend; consulte DTOs para validações de entrada.
- Ao adicionar novos campos no schema, atualizar o ERD e a documentação da API.
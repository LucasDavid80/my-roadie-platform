# Spec — 026: Gestão Básica de Bandas e Múltiplos Workspaces

## 1. Objetivo

Permitir que músicos e roadies criem e mantenham múltiplas bandas ou projetos musicais dentro da mesma conta, alternando entre esses workspaces no Web e no Mobile. A pessoa que criar uma banda será associada automaticamente como `OWNER` em `BandMember`.

A entrega deve estabelecer a base colaborativa para que eventos, tarefas, repertório e transações sejam consultados e administrados no contexto da banda ativa, sem misturar dados de projetos diferentes.

## 2. Por quê

O modelo atual já possui `Band` e `BandMember`, mas a experiência de gestão de bandas ainda não está disponível como fluxo completo para o usuário. Isso limita músicos que participam de mais de um projeto e mantém a seleção de workspace implícita ou dependente de dados pré-existentes.

Esta spec é a fundação das próximas features de colaboração, convites e notificações previstas no Release v1.3.0. Ela também deve preservar a autorização por associação à banda estabelecida na Spec 011 e evitar que a troca de workspace altere permissões ou exponha dados de outra banda.

## 3. Escopo

1. Expor no backend operações autenticadas para listar as bandas do usuário, criar uma banda com associação automática como `OWNER`, editar o nome de uma banda e excluir uma banda conforme as regras de autorização.
2. Definir o contrato de membro e a regra de ownership para bandas criadas pelo usuário.
3. Disponibilizar no Web e no Mobile uma seleção de workspace ativo e uma interface mínima para criar e gerenciar bandas.
4. Garantir que a seleção do workspace ativo seja refletida nas consultas e criações de recursos que dependem de `bandId`.
5. Cobrir casos de sucesso, validação, ausência de associação e tentativa de acesso indevido com testes automatizados.

## 4. Fora de Escopo

- Convites por `@username`, links ou códigos compartilháveis.
- Busca pública ou identidade global por `@username`.
- Push notifications ou notificações de alterações da equipe.
- Transferência de ownership, múltiplos owners ou papéis avançados além de `OWNER` e membro.
- Dashboard administrativo e moderação global de bandas.
- Migração de dados históricos para criar novas bandas.

## 5. Critérios de Sucesso

- [ ] Um usuário autenticado consegue listar somente as bandas das quais é membro.
- [ ] A criação de uma banda válida cria a `Band` e uma `BandMember` do criador com papel `OWNER` em uma operação consistente.
- [ ] Somente o `OWNER` da banda ou um `ADMIN` consegue editar ou excluir a banda; usuários não associados recebem resposta de autorização adequada.
- [ ] Web e Mobile conseguem selecionar uma banda ativa e manter o contexto durante a navegação da sessão.
- [ ] Recursos dependentes de banda usam o workspace ativo sem misturar dados entre bandas.
- [ ] Backend, Web e Mobile possuem testes cobrindo sucesso e erro/borda, mantendo o piso de cobertura de 80% aplicável.

## 6. Inspeção de contratos existentes — T0.2

- **Modelo e persistência:** `backend/prisma/schema.prisma` já define `Band` com relações para `BandMember`, `Event`, `RepertoireSong` e `Transaction`. `BandMember` relaciona `User` e `Band`, possui `role` opcional em `String` e unicidade em `[userId, bandId]`; a estrutura suporta a associação do criador como `OWNER` por convenção de aplicação, sem exigir alteração estrutural nesta etapa.
- **Autorização por banda:** `backend/src/modules/band-access/band-access.service.ts` fornece `getUserBandIds` e `assertMembership`. A associação é verificada por `BandMember` usando tanto `User.id` quanto `User.supabaseId`, e `ADMIN` recebe acesso global. O serviço é exportado por `BandAccessModule` e reutilizado pelos módulos de eventos, tarefas, repertório e transações.
- **Dependências no backend:** eventos aceitam `bandId` opcional e filtram por bandas associadas; repertório e transações exigem `bandId`; tarefas resolvem a banda a partir do evento. Esses módulos já dependem de `BandAccessService`, mas ainda não há módulo `bands`, endpoints de gestão ou uma regra implementada para distinguir `OWNER` de membro nas operações de banda. A resolução de usuário é consistente com `id`/`supabaseId` em eventos, porém repertório, tarefas e transações usam diretamente `user.userId`, ponto a ser considerado na integração futura.
- **Frontend Web:** `frontend-web/src/types/event.ts` já expõe `bandId` no contrato de eventos. Não foram encontrados tipos, serviço de API, provider/contexto ou interface de gestão/seleção de bandas; o dashboard atual ainda usa dados mockados para a agenda.
- **Mobile:** `mobile/lib/domain/entities/event_entity.dart` e `mobile/lib/domain/models/event_model.dart` já carregam `bandId`; `RemoteDataSource` envia esse campo no contrato de eventos e remove `id` do payload de criação. `AgendaRepositoryImpl` e `AgendaController` ainda não mantêm lista ou seleção de bandas, nem propagam um workspace ativo para as consultas.
- **Contratos documentais:** `docs/auth/roles-permissions.md` registra associação por `BandMember` e acesso global de `ADMIN`, enquanto `docs/database/erd.md` documenta as relações atuais. Nenhum dos dois documentos descreve ainda os endpoints ou a regra de ownership desta spec.

## 7. Política de integridade para exclusão — T0.3

- A exclusão de uma banda não fará cascata sobre eventos, tarefas, repertório ou transações, para não remover dados operacionais e financeiros silenciosamente.
- `DELETE /bands/:id` só poderá prosseguir quando não existirem `Event`, `RepertoireSong` ou `Transaction` associados à banda. A existência de qualquer um desses recursos deverá produzir uma resposta de conflito explícita, preservando a banda e todos os seus dados.
- Quando a banda estiver sem recursos dependentes, os registros `BandMember` serão removidos na mesma transação da exclusão da `Band`. Isso evita deixar associações órfãs e respeita as restrições `ON DELETE RESTRICT` existentes.
- A política se aplica tanto ao `OWNER` quanto ao `ADMIN` autorizados pela spec; usuários não associados continuam recebendo resposta de autorização adequada.
- A implementação prevista não exige alteração no schema Prisma, migration, geração de client ou atualização do ERD. O endpoint deverá executar as verificações e exclusões de forma transacional e tratar explicitamente a condição de conflito.

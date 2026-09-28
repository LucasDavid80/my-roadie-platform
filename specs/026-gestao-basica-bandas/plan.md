# Plano Técnico — 026: Gestão Básica de Bandas e Múltiplos Workspaces

## 1. Arquitetura e Decisões Técnicas

### Backend

- Criar um módulo NestJS `bands` com `BandsController`, `BandsService`, DTOs e testes colocados junto do domínio.
- Proteger todas as rotas com `JwtAuthGuard` e obter a identidade do usuário autenticado a partir do token, nunca de `userId` enviado pelo cliente.
- Reutilizar `BandAccessService` para resolver a associação do usuário e manter a autorização por `BandMember`.
- Tratar `ADMIN` como acesso global, conforme a matriz de permissões existente.
- Criar a banda e o vínculo `BandMember(role: "OWNER")` dentro de uma transação Prisma para evitar uma banda sem owner.
- Definir a exclusão com cuidado para não deixar recursos órfãos. Antes de alterar o schema, confirmar as regras de integridade e atualizar migration, Prisma Client e ERD conforme a constituição.

### Estado de workspace

- No Web, manter o `activeBandId` em um contexto/provider do dashboard, inicializado com uma banda válida do usuário e persistido somente no armazenamento apropriado para a sessão.
- No Mobile, manter o workspace ativo no estado da camada de apresentação/repositório, expondo uma lista de bandas e notificando a UI ao alternar.
- O cliente deve enviar `bandId` apenas em contratos que já o aceitam; dados gerados (`id`, `createdAt`, `updatedAt`) não podem ser enviados em `POST` ou `PATCH`.
- A API deve validar no servidor que o `bandId` selecionado pertence ao usuário antes de executar qualquer operação.

## 2. Modelagem de Dados / Contratos

O schema atual já possui `Band` e `BandMember` com unicidade em `[userId, bandId]`. A implementação deve primeiro verificar se os campos atuais suportam a regra de ownership. Se não houver necessidade de alteração estrutural, não criar migration apenas para representar uma convenção de aplicação.

Contratos previstos:

- `GET /bands` — lista bandas acessíveis ao usuário autenticado.
- `POST /bands` — recebe `name`; cria a banda e o vínculo `OWNER`.
- `GET /bands/:id` — retorna detalhes mínimos da banda para usuários associados ou `ADMIN`.
- `PATCH /bands/:id` — altera campos permitidos, inicialmente `name`, somente para `OWNER` ou `ADMIN`.
- `DELETE /bands/:id` — remove a banda conforme a política de integridade definida e somente para `OWNER` ou `ADMIN`.

Política de integridade para `DELETE /bands/:id`:

- Não usar exclusão em cascata para apagar dados de eventos, repertório ou transações.
- Bloquear a exclusão com resposta de conflito quando existir qualquer `Event`, `RepertoireSong` ou `Transaction` ligado à banda.
- Quando não houver esses recursos, remover os `BandMember` e a `Band` na mesma transação Prisma.
- A política preserva as relações `ON DELETE RESTRICT` atuais e não exige migration ou alteração do schema.

DTOs:

- `CreateBandDto`: `name` obrigatório, não vazio e com limite de tamanho definido pelo contrato.
- `UpdateBandDto`: `name` opcional, aplicando as mesmas regras quando presente.
- Respostas não devem expor dados pessoais desnecessários dos integrantes nesta spec.

## 3. Estrutura de Arquivos Afetados

- `backend/src/modules/bands/bands.module.ts`
- `backend/src/modules/bands/bands.controller.ts`
- `backend/src/modules/bands/bands.service.ts`
- `backend/src/modules/bands/dto/create-band.dto.ts`
- `backend/src/modules/bands/dto/update-band.dto.ts`
- `backend/src/modules/bands/*.spec.ts`
- `backend/test/` para cenários E2E do contrato
- `backend/prisma/schema.prisma` e migration somente se a regra de integridade exigir mudança
- `docs/database/erd.md` se o schema mudar
- `docs/auth/roles-permissions.md` para registrar as novas ações de banda
- `frontend-web/src/contexts/` ou `frontend-web/src/providers/` para o workspace ativo, conforme a estrutura existente
- `frontend-web/src/services/` e `frontend-web/src/types/` para o contrato de bandas
- `frontend-web/src/app/(dashboard)/` para a interface de seleção/gestão
- `mobile/lib/domain/`, `mobile/lib/data/` e `mobile/lib/presentation/` para entidade, datasource/repository e estado/UI
- Testes correspondentes em `frontend-web/` e `mobile/test/`

## 4. Estratégia de Testes

### Backend

- Unitários do service para listar somente associações do usuário, criar owner, editar/excluir com owner, negar não membro e permitir `ADMIN`.
- Validação de DTO para nome ausente, vazio, excedendo limite e campos extras.
- E2E para o contrato REST autenticado, incluindo tentativa de acessar uma banda de outro usuário e consistência da criação do vínculo owner.

### Frontend Web

- Testes do provider/contexto para carregamento inicial, seleção, persistência da sessão e fallback quando o workspace salvo não é mais acessível.
- Testes de componentes para estados de carregamento, lista vazia, erro de API e criação/edição.
- Teste de integração garantindo que o `bandId` ativo é usado nas chamadas de recursos dependentes de banda.

### Mobile

- Testes unitários do model/repository para desserialização, listagem e seleção de workspace.
- Testes de controller para troca de banda, erro de rede e descarte de workspace inválido.
- Testes de widget para seletor, estado vazio, feedback de erro e preservação do contexto na navegação.

Ao final da fase de testes, executar as verificações de cobertura dos aplicativos afetados e confirmar o piso de 80% antes do fechamento documental.

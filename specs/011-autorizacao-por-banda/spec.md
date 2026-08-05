# Spec — 011: Autorização por Banda (Tasks, Repertoire, Transactions)

## Objetivo

Fechar a lacuna de autorização identificada em revisão: os módulos `tasks`, `repertoire` e `transactions` hoje só exigem `JwtAuthGuard` (usuário autenticado), sem checar se esse usuário pertence à `Band` dona do recurso. Qualquer usuário logado consegue ler/criar/editar/apagar tarefas, repertório e **transações financeiras** de qualquer banda, não só das suas.

## Por quê

- Viola `constitution.md` §4 diretamente: *"Recursos vinculados a uma Band verificam associação via BandMember, não apenas o papel global do usuário."*
- A spec 006 (Transactions) já exigia essa verificação no próprio `spec.md` e teve o checklist de fechamento marcado como concluído sem que isso fosse implementado — esta spec corrige a lacuna E a marcação incorreta.
- `GET /repertoire` e `GET /transactions` sem `bandId` retornam dados de **todas** as bandas hoje — inclui vazamento de dado financeiro de terceiros.

## Escopo

1. Criar um serviço reutilizável de checagem de associação a banda (não um guard genérico único, porque cada módulo resolve o `bandId` de um jeito diferente — ver `plan.md`).
2. Aplicar a checagem em `tasks`, `repertoire` e `transactions`: create, findAll, findOne, update, remove.
3. `ADMIN` sempre passa (acesso global, conforme `docs/auth/roles-permissions.md`).
4. `findAll` nunca mais retorna dado de banda que o usuário não participa:
   - Com `bandId` explícito → valida associação antes de filtrar.
   - Sem `bandId` → filtra automaticamente pelas bandas do usuário (nunca retorna tudo).
5. Testes: mínimo 3 casos positivos + 3 negativos por módulo (padrão de "módulo crítico" da `constitution.md` §5 — dado financeiro e dado de terceiros justificam o padrão mais alto mesmo em Tasks/Repertoire).

## Fora de escopo

- Mudar o modelo `BandMember` ou a matriz de papéis.
- Criar endpoint administrativo de visão global (se for necessário no futuro, é outra spec).
- Autorização de `Events` e `Users` — esses já têm `OwnershipGuard`/checagem própria, não fazem parte desta spec.

## Critério de sucesso

- [ ] Usuário não-membro de uma banda recebe `403 Forbidden` ao tentar criar/ler/editar/apagar task, repertório ou transação daquela banda.
- [ ] Usuário membro consegue operar normalmente nos recursos da(s) banda(s) dele.
- [ ] `ADMIN` continua com acesso irrestrito.
- [ ] `GET /repertoire` e `GET /transactions` sem `bandId` não retornam mais dado de banda alheia.
- [ ] Testes cobrindo os 4 pontos acima, nos três módulos.
- [ ] `spec.md` da baseline (raiz) e `plan.md` §8 atualizados removendo esta lacuna da lista de débito.

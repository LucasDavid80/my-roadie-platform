# Spec — 021: Histórico de Compromissos (Mobile)

## Objetivo

Separar, na Agenda do aplicativo mobile, os compromissos passados dos futuros: a lista "Próximos Compromissos" na tela principal (`PrincipalScreen`) passa a exibir exclusivamente eventos a partir da data atual (`>= hoje`), e uma nova tela dedicada de **Histórico** passa a reunir todos os compromissos já ocorridos (`< hoje`), acessível por um atalho/botão a partir da Agenda.

## Por quê

- **Foco no futuro sem perder o passado**: a decisão de produto é priorizar a experiência de planejamento (o que vem a seguir), mas sem descartar o registro do que já aconteceu — shows, ensaios e reuniões passados continuam tendo valor (comprovação de cachê recebido, histórico de locais, referência para remarcar algo parecido).
- **Poluição visual atual**: hoje `PrincipalScreen` lê `agendaProvider` (`events`) e passa a lista inteira, sem filtro de data, para `CommitmentsWidget`/"Próximos Compromissos". Eventos antigos continuam aparecendo na mesma lista dos futuros indefinidamente, o que já foi identificado como item de backlog ("Histórico de Compromissos e Filtragem de Próximos Eventos").
- **Consistência com a correção da spec 022** *(bug dos cards do dashboard)*: ao corrigir "Este Mês"/"Cachê/Mês" para filtrar por mês corrente, faz sentido resolver junto a separação estrutural entre passado e futuro na mesma tela, já que ambos usam a mesma fonte (`agendaProvider.state`) e o mesmo critério de data.
- **Sem necessidade de mudança de backend**: `GET /events` já retorna todos os eventos da banda sem filtro de data (`events.service.ts#findAll`); a separação passado/futuro é responsabilidade da camada de apresentação mobile, mantendo o escopo desta spec pequeno e sem risco para API/schema.

## Escopo

- **`AgendaController` (`mobile/lib/presentation/controllers/agenda_controller.dart`)**:
  - Adicionar getters derivados do `state` (lista completa de eventos) diretamente no `AgendaController` (definido na Fase 0 / T0.3, mantendo padrão de `totalFee` e `monthlyShows`), sem duplicar a fonte de dados:
    - `upcomingEvents`: eventos com `date >= hoje` (considerando apenas a data, ignorando hora), ordenados ascendente.
    - `pastEvents`: eventos com `date < hoje`, ordenados descendente (mais recente primeiro).
- **`PrincipalScreen` / `CommitmentsWidget`**:
  - Passar `upcomingEvents` (em vez da lista bruta `events`) para "Próximos Compromissos".
  - Adicionar um botão/atalho ("Ver histórico" com ícone dedicado) alinhado à direita no cabeçalho da seção de "Próximos Compromissos" em `CommitmentsWidget`, navegando para a nova tela de histórico.
- **Nova tela `HistoryScreen` (`mobile/lib/presentation/screens/history/`)**:
  - Reutilizar `CommitmentCard`/`CommitmentsWidget` para exibir `pastEvents` agrupados por data, no mesmo estilo visual da Agenda.
  - Ações de editar/excluir um compromisso passado: **Habilitadas** (definido na Fase 0 / T0.1), permitindo editar (corrigir cachê, notas, etc.) e excluir compromissos passados, reaproveitando as ações padrão do `CommitmentCard`.
  - Estado vazio ("Nenhum compromisso no histórico ainda") para bandas novas sem eventos passados.
- **Dashboard (`InfosWidget`)**:
  - Ajustar `compromissosTotal`/`proximosCompromissos` para usarem `upcomingEvents` como base, evitando reabrir o mesmo bug documentado no backlog para o card "Este Mês"/"Próximos" (ver spec 022, se ainda não concluída ao iniciar esta).
- **Testes**:
  - Unitários para os getters `upcomingEvents`/`pastEvents` do `AgendaController` (casos: evento hoje, evento amanhã, evento ontem, lista vazia, fuso/hora dentro do mesmo dia).
  - Teste de widget da nova `HistoryScreen` (lista renderiza `pastEvents`, estado vazio, navegação de ida e volta a partir da Agenda).
  - Teste de widget atualizado de `PrincipalScreen`/`CommitmentsWidget` confirmando que eventos passados não aparecem mais em "Próximos Compromissos".

## Fora de escopo

- Paginação ou filtro de histórico no backend (`GET /events`) — o volume de eventos por banda não justifica isso ainda; caso o histórico cresça muito, avaliar em spec própria.
- Busca/filtro por texto, tipo de evento ou intervalo de datas dentro do histórico (fica como evolução futura, não bloqueante para a primeira versão).
- Exportação do histórico (PDF/CSV) para prestação de contas — tema relacionado ao módulo financeiro (Fase 5 do backlog).
- Qualquer mudança de schema/Prisma — este é um filtro de apresentação sobre dados já existentes.

## Critérios de Sucesso

- [ ] "Próximos Compromissos" na Agenda exibe somente eventos com `date >= hoje`.
- [ ] Nova tela de Histórico acessível a partir da Agenda, exibindo todos os eventos com `date < hoje`, ordenados do mais recente para o mais antigo.
- [ ] Cards "Este Mês"/"Próximos" do dashboard continuam consistentes com a nova filtragem (sem regressão do bug documentado no backlog).
- [ ] Estado vazio tratado tanto na Agenda (sem próximos compromissos) quanto no Histórico (sem compromissos passados).
- [ ] Decisão sobre editar/excluir eventos passados tomada e documentada nesta spec antes da implementação (Fase 0), não assumida por padrão.
- [ ] Testes unitários (`AgendaController`) e de widget (`HistoryScreen`, `PrincipalScreen`) cobrindo os cenários acima, `flutter test` 100% verde.
- [ ] `backlog.md` atualizado ao final, movendo esta entrada de "em spec" para "concluído (specs/021-historico-de-compromissos/)".

# Plan — 021: Histórico de Compromissos (Mobile)

## Visão Geral da Solução

Toda a lista de eventos já está disponível em memória via `agendaProvider` (`AgendaController extends Notifier<List<EventEntity>>`, populado por `getEvents()` no repositório). Não é necessário nenhum novo endpoint: a separação passado/futuro é apenas uma derivação da mesma lista, calculada em dois getters no controller e consumida por dois pontos de UI diferentes (Agenda continua mostrando só o futuro; tela nova mostra só o passado).

```dart
// agenda_controller.dart
List<EventEntity> get upcomingEvents {
  final today = _startOfDay(DateTime.now());
  return state.where((e) => !_startOfDay(e.date).isBefore(today)).toList()
    ..sort((a, b) => a.date.compareTo(b.date));
}

List<EventEntity> get pastEvents {
  final today = _startOfDay(DateTime.now());
  return state.where((e) => _startOfDay(e.date).isBefore(today)).toList()
    ..sort((a, b) => b.date.compareTo(a.date));
}

DateTime _startOfDay(DateTime d) => DateTime(d.year, d.month, d.day);
```

Comparar apenas ano/mês/dia (via `_startOfDay`) evita que um evento de hoje com hora já passada (ex.: ensaio das 14h consultado às 20h) seja erroneamente classificado como "passado" — o critério é o dia do compromisso, não o horário.

## Arquitetura & Modificações Técnicas

### Mobile (`mobile/`)

- **`agenda_controller.dart`**:
  - Adicionar `upcomingEvents`, `pastEvents` e o helper privado `_startOfDay`.
  - Não alterar `state`, `addOrUpdateEvent`, `deleteEvent` nem `totalFee`/`monthlyShows` (a correção desses últimos é escopo da spec 022, não desta).

- **`principal_screen.dart`**:
  - Trocar `commitments: events` por `commitments: ref.watch(agendaProvider.notifier).upcomingEvents` (ou expor `upcomingEvents` como um `Provider` derivado, se preferível para evitar recomputar a cada rebuild — decidir na Fase 1 conforme o padrão já usado por `totalFee`/`monthlyShows`, que também são getters lidos diretamente do notifier).
  - Adicionar botão/atalho de navegação para `HistoryScreen` ("Ver histórico") alinhado à direita no cabeçalho da lista de "Próximos Compromissos" em `CommitmentsWidget`.

- **Nova pasta `mobile/lib/presentation/screens/history/`**:
  - `history_screen.dart`: `ConsumerWidget` que lê `pastEvents` do `agendaProvider.notifier`, reaproveita `CommitmentsWidget`/`CommitmentCard` com ações de editar/excluir habilitadas (conforme definido em T0.1).
  - Rota registrada onde as demais telas da Agenda já são navegadas (verificar se o projeto usa `Navigator.push` direto ou uma camada de rotas nomeadas antes de escolher a abordagem, para manter consistência).

- **`infos_widget.dart` / `principal_screen.dart`**:
  - Ajustar a fonte de `compromissosTotal` para `upcomingEvents.length` em vez de `events.length` — **checar se a spec 022 (correção dos cards do dashboard) já foi implementada antes de iniciar esta**; se sim, apenas garantir que a correção lá já usa `upcomingEvents` desta spec como fonte (evitar duas fontes de verdade divergentes); se não, esta spec pode implementar a troca localmente e a 022 herda o getter já pronto.

- **Testes (`flutter_test`)**:
  - `test/agenda_controller_test.dart`: casos para `upcomingEvents`/`pastEvents` — evento hoje, ontem, amanhã, lista vazia.
  - Novo `test/presentation/screens/history_screen_test.dart`: renderização da lista, estado vazio, navegação a partir de `PrincipalScreen`.
  - Atualizar `test/principal_screen_test.dart` para confirmar que eventos com `date` no passado não aparecem mais em "Próximos Compromissos".

## Decisões a confirmar na Fase 0 (antes de codar)

1. **Editar/excluir no histórico**: **Habilitadas** (definido na Fase 0 / T0.1). A tela de Histórico reaproveitará o `CommitmentCard` com as ações padrão de edição e exclusão.
2. **Local do atalho para o histórico**: **Cabeçalho de "Próximos Compromissos" em `CommitmentsWidget`** (definido na Fase 0 / T0.2), com botão/atalho "Ver histórico" alinhado à direita no cabeçalho da seção, mantendo a `MyRoadieAppBar` limpa e a navegação contextualmente associada aos compromissos.
3. **Provider derivado vs. getter no notifier**: manter o padrão já usado (`totalFee`, `monthlyShows` como getters lidos com `ref.read`) ou migrar para `Provider.autoDispose` derivado, dado que `upcomingEvents`/`pastEvents` serão lidos com `ref.watch` em duas telas diferentes agora (mais motivo para reatividade correta do que os getters atuais, que só são lidos uma vez por build).

## Conformidade com a Constituição (`constitution.md`)

- **§1 Stack**: mudança inteiramente dentro do Flutter mobile já definido; nenhuma biblioteca nova.
- **§2 Arquitetura modular**: nova tela fica em `presentation/screens/history/`, seguindo a mesma convenção de pastas de `presentation/screens/principal/`; nenhuma mudança em `domain/` ou `data/` (a entidade `EventEntity` já tem tudo que é necessário).
- **§5 Qualidade e testes**: getters novos e tela nova exigem cobertura de teste unitário e de widget antes do fechamento da spec.
- **§7 Commits e PR**: uma branch dedicada `spec/021-historico-de-compromissos`, um commit por task de `tasks.md`.
- **§8 Fluxo de feature nova**: esta spec segue o fluxo completo (spec → plan → tasks → Fase 0 de confirmação das decisões em aberto → implementação), por ser uma tela nova e não apenas um bug pontual.

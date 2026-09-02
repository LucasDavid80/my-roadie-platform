# Plan — 022: Correção dos Cards de Estatísticas do Dashboard (Mobile)

## Visão Geral da Solução

Os dados de compromissos já residem no estado local do Riverpod (`AgendaController extends Notifier<List<EventEntity>>`). A correção não exige nenhum endpoint adicional nem alteração no backend: é uma melhoria puramente analítica e de apresentação no mobile, ajustando getters matemáticos e aplicando máscara monetária.

```dart
// agenda_controller.dart
bool _isSameMonth(DateTime d, DateTime now) =>
    d.year == now.year && d.month == now.month;

List<EventEntity> get monthlyEvents {
  final now = DateTime.now();
  return state.where((e) => _isSameMonth(e.date, now)).toList();
}

int get monthlyShows {
  final now = DateTime.now();
  return state.where((e) => 
    _isSameMonth(e.date, now) && 
    e.type.trim().toLowerCase() == 'show'
  ).length;
}

double get monthlyFee {
  final now = DateTime.now();
  return state
      .where((e) => _isSameMonth(e.date, now))
      .fold(0.0, (sum, event) => sum + event.fee);
}
```

Na camada visual (`InfosWidget`), o valor de `faturamento` passa a ser formatado com `NumberFormat.currency(locale: 'pt_BR', symbol: 'R$')` e encapsulado em um `FittedBox` no `infoCard` para garantir que valores elevados (como `R$ 150.000,00`) sejam redimensionados automaticamente para caber no container do card sem estourar a tela.

## Arquitetura & Modificações Técnicas

### Mobile (`mobile/`)

- **`agenda_controller.dart`**:
  - Implementar helper privado `_isSameMonth(DateTime a, DateTime b)`.
  - Adicionar getter `monthlyEvents`.
  - Ajustar getter `monthlyShows` para filtrar por mês corrente E checagem de tipo `type.trim().toLowerCase() == 'show'`.
  - Adicionar getter `monthlyFee` (ou substituir `totalFee` por um cálculo baseado no mês corrente, mantendo retrocompatibilidade se necessário).
- **`infos_widget.dart`**:
  - Utilizar `DateFormat`/`NumberFormat` do pacote `intl` (já importado no projeto mobile) para converter `faturamento` em texto formatado `R$ #.##0,00`.
  - No widget `infoCard`, envolver o `Text` de subtitle com `FittedBox(fit: BoxFit.scaleDown, alignment: Alignment.centerLeft)` e adicionar `maxLines: 1` no `Text`, impedindo a quebra de linha prematura e redimensionando suavemente valores extensos sem overflow.
- **`principal_screen.dart`**:
  - Obter os novos valores via `ref.read(agendaProvider.notifier)` ou `ref.watch(agendaProvider)` e repassar para o `InfosWidget`:
    - `compromissosTotal`: `ref.read(agendaProvider.notifier).monthlyEvents.length`
    - `shows`: `ref.read(agendaProvider.notifier).monthlyShows`
    - `faturamento`: `ref.read(agendaProvider.notifier).monthlyFee`
- **Testes (`flutter_test`)**:
  - `test/agenda_controller_test.dart`:
    - Adicionar testes cobrindo `monthlyEvents`, `monthlyShows` (garantindo que tipos como "Ensaio" não são contados como show) e `monthlyFee` (garantindo que cachês de meses anteriores e posteriores não sejam somados).
  - `test/infos_widget_test.dart`:
    - Validar formatação do texto monetário `R$` e comportamento de renderização dos cards.
  - `test/principal_screen_test.dart`:
    - Validar integração entre o controller e os cards renderizados na tela principal.

## Decisões a confirmar na Fase 0 (antes de codar)

1. **Card "Este Mês" vs "Próximos"** (Confirmado em T0.1):
   - "Este Mês" exibe o total de eventos ocorridos e previstos no mês corrente (`monthlyEvents.length`).
   - "Próximos" exibe a quantidade total de compromissos a partir de hoje (`upcomingEvents.length`), sincronizado com a lista de próximos compromissos da tela.
   - O `InfosWidget` passará a receber o total de próximos diretamente (ex.: `proximos: upcomingEvents.length`), eliminando o cálculo interno legado `compromissosTotal - compromissosConcluidos`.
2. **Formatação de Cachê Zero** (Confirmado em T0.3):
   - Faturamento zerado exibirá estritamente `R$ 0,00`, aplicando o comportamento padrão de `NumberFormat.currency(locale: 'pt_BR', symbol: 'R$')`.
3. **Resiliência do tipo de evento para "Shows/Mês"**:
   - Padronizar checagem de tipo case-insensitive (`e.type.trim().toLowerCase() == 'show'`) para aceitar variações legadas caso existam.
4. **Captura de Screenshots pós-spec 021**:
   - Registrar no app atualizado novas capturas com o botão "Ver histórico" e o estado atual dos cards, servindo de linha de base visual pré-correção.

## Conformidade com a Constituição (`constitution.md`)

- **§1 Stack**: nenhuma biblioteca nova; utiliza `intl` e Riverpod já existentes no projeto mobile.
- **§2 Modularidade**: alterações estritamente limitadas a `presentation/` do mobile (controller, widgets e tela).
- **§5 Qualidade e testes**: cada novo getter e widget com testes unitários e de widget cobrindo casos de sucesso e borda.
- **§7 Commits e PR**: branch dedicada `spec/022-correcao-cards-dashboard`, um commit por tarefa concluída.

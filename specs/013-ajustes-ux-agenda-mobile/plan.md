# Plan — 013: Ajustes de UX na Agenda (Mobile)

## Diagnóstico de causa raiz (já levantado, confirmar na Fase 0)

`PrincipalScreen` (`mobile/lib/presentation/screens/principal/principal_screen.dart`) envolve todo o conteúdo em um único `SingleChildScrollView` → `Column`, que inclui `CustomCalendar` como um dos filhos.

`CustomCalendar` (`mobile/lib/presentation/screens/principal/widgets/custom_calendar.dart`) usa o widget `TableCalendar` do pacote `table_calendar: ^3.0.9` sem definir a propriedade `availableGestures`. O default do pacote é `AvailableGestures.all`, que ativa **dois** reconhecedores de gesto simultâneos:

- swipe horizontal → troca de mês (usado hoje, mas redundante com as setas do `_buildCustomHeader`);
- swipe vertical → troca de formato do calendário (mês ↔ 2 semanas ↔ semana) — **não usado** pela tela, que já esconde o header nativo (`headerVisible: false`) e não expõe nenhum controle de formato.

O reconhecedor de gesto vertical do `TableCalendar` compete com o `SingleChildScrollView` pai pelo mesmo eixo. Quando o drag começa sobre a área do calendário, o `TableCalendar` consome o gesto verticalmente (interpretando como tentativa de troca de formato), e o evento não se propaga para o scroll da tela. Fora da área do calendário não há esse recognizer, então o scroll do pai funciona normalmente — condizente com o comportamento relatado.

## Visão Geral da Solução

Restringir os gestos do `TableCalendar` para aceitar apenas swipe horizontal, liberando o eixo vertical inteiro para o `SingleChildScrollView` pai:

```dart
TableCalendar(
  ...
  availableGestures: AvailableGestures.horizontalSwipe,
  ...
)
```

Isso deve ser suficiente para resolver o bug sem tocar em mais nada — não deveria exigir `NeverScrollableScrollPhysics`, `NotificationListener`, `GestureDetector` customizado nem trocar a estrutura de `SingleChildScrollView` por outra coisa (ex. `CustomScrollView`/`Slivers`), que seria uma mudança bem mais invasiva para um bug de uma linha de causa.

**Se a Fase 0 confirmar que `availableGestures: AvailableGestures.horizontalSwipe` sozinho não resolve** (por exemplo, se o `TableCalendar` ainda assim capturar o primeiro frame do drag antes de decidir que não é gesto seu — comportamento de "gesture arena" do Flutter que só se resolve testando no dispositivo/emulador), a decisão de próximo passo (ex. envolver o calendário num `GestureDetector` com `behavior: HitTestBehavior.translucent`, ou trocar a estratégia de scroll da tela) **não está coberta por esta constituição e deve ser trazida para decisão antes de implementar** — não decidir sozinho nessa hipótese.

## Arquitetura & Modificações Técnicas

### Mobile (`mobile/`)

- **`custom_calendar.dart`**:
  - Adicionar `availableGestures: AvailableGestures.horizontalSwipe` ao `TableCalendar`.
  - Nenhuma outra propriedade do `TableCalendar` muda (estilo, `eventLoader`, `calendarBuilders`, seleção de dia permanecem intactos).

- **`principal_screen.dart`**:
  - Nenhuma mudança estrutural esperada (mantém `SingleChildScrollView` → `Column`). Só entra em jogo se a Fase 0/1 mostrar que a correção no calendário sozinha não basta (ver hipótese acima).

- **Testes (`flutter_test`)**:
  - Novo teste de widget em `test/principal_screen_test.dart` (ou arquivo dedicado, ex. `test/presentation/screens/principal_screen_scroll_test.dart`) que:
    1. Renderiza `PrincipalScreen` com uma lista de eventos grande o suficiente para o conteúdo total exceder a viewport.
    2. Executa um `tester.drag()` vertical com ponto de início dentro da área do `CustomCalendar` (usando `find.byType(CustomCalendar)` como referência de posição).
    3. Confirma que o `Scrollable` da tela avançou (offset mudou), não que um widget específico ficou visível — evita teste frágil a mudanças de conteúdo.
  - Reexecutar `principal_screen_test.dart` e `agenda_controller_test.dart` existentes para garantir ausência de regressão.

## Conformidade com a Constituição (`constitution.md`)

- **§1 Stack**: mudança inteiramente dentro do Flutter mobile já definido na stack; nenhuma troca de biblioteca.
- **§2 Arquitetura modular**: mudança fica contida na camada `presentation/` (widgets/screens); não toca `domain/` nem `data/`.
- **§5 Qualidade e testes**: bug fix simples, sem lógica de negócio nova — ainda assim inclui teste cobrindo o comportamento corrigido (rolagem), conforme padrão mínimo de 1 caso coberto por mudança que afeta comportamento observável da UI.
- **§7 Commits e PR**: uma única PR/branch para esta spec, commit por task conforme `tasks.md`.
- **§8 Fluxo de feature nova**: branch dedicada `spec/013-ajustes-ux-agenda-mobile`, implementação segue as tasks em ordem, sem merge direto na `main`.

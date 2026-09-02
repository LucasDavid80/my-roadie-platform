# Spec — 022: Correção dos Cards de Estatísticas do Dashboard (Mobile)

## Objetivo

Corrigir os cálculos e a formatação visual dos cards de resumo exibidos no topo da tela principal ([`PrincipalScreen`](file:///C:/dev/my-roadie-platform/mobile/lib/presentation/screens/principal/principal_screen.dart) / [`InfosWidget`](file:///C:/dev/my-roadie-platform/mobile/lib/presentation/screens/principal/widgets/infos_widget.dart)), garantindo que:
1. O card **"Este Mês"** reflita a quantidade de compromissos do mês corrente.
2. O card **"Shows/Mês"** contabilize exclusivamente eventos do tipo `"Show"` que ocorram no mês corrente (ignorando ensaios e reuniões).
3. O card **"Cachê/Mês"** totalize exclusivamente os cachês de eventos do mês corrente (não acumulando meses futuros).
4. O valor do faturamento seja formatado no padrão monetário brasileiro (`R$ X.XXX,XX`), com ajuste responsivo para não quebrar feio em duas linhas nem sofrer overflow no card.

## Por quê

- **Primeira impressão e confiabilidade**: Ao abrir a Agenda, o bloco de métricas no topo é o primeiro elemento visual de destaque do dashboard. Dados errados ou formatados de forma bruta passam sensação de app inacabado.
- **Diagnóstico das causas-raiz**:
  1. **`compromissosTotal` (card "Este Mês")**: Em [`PrincipalScreen`](file:///C:/dev/my-roadie-platform/mobile/lib/presentation/screens/principal/principal_screen.dart#L89), recebia `events.length` e posteriormente `upcomingEvents.length`. Porém, o título do card é "Este Mês", gerando confusão caso haja eventos em meses futuros distantes.
  2. **`totalFee` (card "Cachê/Mês")**: Em [`AgendaController.totalFee`](file:///C:/dev/my-roadie-platform/mobile/lib/presentation/controllers/agenda_controller.dart#L66), a soma é feita sobre todo o `state` via `fold`, somando cachês de compromissos de meses futuros no card que diz "Cachê/Mês".
  3. **`monthlyShows` (card "Shows/Mês")**: Em [`AgendaController.monthlyShows`](file:///C:/dev/my-roadie-platform/mobile/lib/presentation/controllers/agenda_controller.dart#L68-L73), filtra por `month` e `year`, mas calcula o tamanho da lista total sem checar `type == 'Show'`. Se a banda tiver 3 ensaios e 1 show no mês, exibe "4 Shows/Mês".
  4. **Formatação monetária**: Em [`InfosWidget.infoCard`](file:///C:/dev/my-roadie-platform/mobile/lib/presentation/screens/principal/widgets/infos_widget.dart#L52), o valor é interpolado com `faturamento.toString()` puro (ex.: `"18500.0"`), sem símbolo monetário `R$`, sem pontuação de milhar e com tamanho de fonte que quebra desordenadamente dentro dos 180px de largura do card.

## Escopo

- **`AgendaController` (`mobile/lib/presentation/controllers/agenda_controller.dart`)**:
  - `monthlyEvents`: getter retornando todos os eventos cuja data pertença ao mês e ano correntes.
  - `monthlyShows`: ajustar para contar apenas eventos de `monthlyEvents` onde `type.toLowerCase() == 'show'`.
  - `monthlyFee`: getter somando o `fee` de todos os eventos de `monthlyEvents`.
  - Manter compatibilidade com `upcomingEvents` e `pastEvents` criados na spec 021.
- **`InfosWidget` (`mobile/lib/presentation/screens/principal/widgets/infos_widget.dart`)**:
  - Formatar o valor monetário utilizando `NumberFormat.currency(locale: 'pt_BR', symbol: 'R$')` da biblioteca `intl`.
  - Aplicar ajuste no `infoCard` (ex.: `FittedBox` ou tamanho de fonte ajustado) para acomodar valores de cachê mais altos sem truncamento ou overflow visual.
- **`PrincipalScreen` (`mobile/lib/presentation/screens/principal/principal_screen.dart`)**:
  - Conectar os novos getters no `InfosWidget`:
    - `compromissosTotal`: eventos do mês corrente.
    - `shows`: `monthlyShows`.
    - `faturamento`: `monthlyFee`.
- **Testes (`mobile/test/`)**:
  - Testes unitários no `AgendaController` para `monthlyEvents`, `monthlyShows` (com e sem eventos que não sejam show) e `monthlyFee` (isolando eventos deste mês de meses futuros).
  - Testes de widget em `infos_widget_test.dart` validando formatação monetária e renderização.
  - Atualização dos testes de widget em `principal_screen_test.dart`.

## Fora de escopo

- Alterações no backend (`/events`), banco de dados ou Prisma schema (todos os dados necessários já são retornados pela API).
- Redesenho completo do componente `InfosWidget` (mantém o design em grid de 4 cards existente).
- Filtros por intervalo arbitrário de datas ou navegação para meses anteriores/posteriores no dashboard (evolução futura).

## Critérios de Sucesso

- [ ] Card "Este Mês" exibe a quantidade exata de compromissos pertencentes ao mês e ano atuais.
- [ ] Card "Shows/Mês" exibe a quantidade de eventos do mês atual com tipo igual a "Show" (case-insensitive).
- [ ] Card "Cachê/Mês" totaliza apenas cachês de eventos do mês atual e não inclui meses futuros.
- [ ] O valor do cachê é exibido formatado em moeda brasileira (ex.: `R$ 1.500,00` ou `R$ 0,00`).
- [ ] Valores de cachê altos cabem no card sem estourar a tela (overflow) ou quebrar de forma defeituosa.
- [ ] Suíte de testes unitários e de widget cobrindo os novos cenários passando em 100% com `flutter test`.
- [ ] `backlog.md` atualizado com o encerramento da spec na Release `v1.1.0`.

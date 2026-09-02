# Tasks — 022: Correção dos Cards de Estatísticas do Dashboard (Mobile)

## Fase 0 — Confirmar decisões em aberto antes de codar

- [x] T0.1 — Confirmar com o usuário o comportamento exato dos cards "Este Mês" e "Próximos" em relação aos eventos passados do mesmo mês.
- [x] T0.2 — Inspecionar `InfosWidget` e `infoCard` para identificar o ponto exato de quebra de layout de valores monetários e definir a estratégia de escala/responsividade (`FittedBox`).
- [x] T0.3 — Confirmar a formatação esperada para cachê zerado (`R$ 0,00`).
- [x] T0.4 — Inspecionar a suíte existente de testes (`test/infos_widget_test.dart`, `test/agenda_controller_test.dart`) para mapear regressões potenciais.
- [x] T0.5 — Capturar e anexar novas screenshots do aplicativo no estado pós-spec 021 (com botão "Ver histórico" e comportamento atual dos cards) como linha de base visual atualizada.

## Fase 1 — `AgendaController`: novos getters de mês corrente

- [x] T1.1 — Implementar `_isSameMonth`, `monthlyEvents`, `monthlyFee` e ajustar `monthlyShows` com filtro estrito de tipo no `agenda_controller.dart`.
- [x] T1.2 — Adicionar testes unitários em `test/agenda_controller_test.dart` cobrindo cálculo de `monthlyFee`, `monthlyShows` (ignorando ensaios/outros tipos) e `monthlyEvents` (isolando outros meses e anos).

## Fase 2 — `InfosWidget`: formatação monetária e responsividade

- [x] T2.1 — Implementar formatação monetária padrão brasileiro (`R$ X.XXX,XX`) no campo de faturamento do `InfosWidget`.
- [x] T2.2 — Adicionar ajuste responsivo com `FittedBox` no `infoCard` para evitar overflow e quebras de linha defeituosas com números grandes.
- [x] T2.3 — Atualizar e executar `test/infos_widget_test.dart` validando os novos formatos textuais e limites visuais.

## Fase 3 — Integração na `PrincipalScreen`

- [x] T3.1 — Atualizar a invocação do `InfosWidget` na `PrincipalScreen` para consumir os getters corrigidos do `AgendaController`.
- [x] T3.2 — Atualizar `test/principal_screen_test.dart` validando que os cards na tela principal refletem fielmente os valores do mês corrente.

## Fase 4 — Fechamento

- [x] T4.1 — Rodar `flutter test` completo no mobile garantindo 100% dos testes verdes e sem regressões.
- [x] T4.2 — Atualizar `backlog.md`: mover a entrada da Spec 022 para `concluído (specs/022-correcao-cards-dashboard/)`.
- [x] T4.3 — Fechar checklist de fechamento abaixo e critérios de sucesso em `spec.md` atomicamente no mesmo passo.

## Fase 5 — Validação Manual e Testes em Dispositivo Físico

- [ ] T5.1 — Validação Visual e Ausência de Overflow nos Cards do Dashboard
  - **Como testar**:
    1. Inicie o aplicativo mobile no dispositivo físico (`flutter run` dentro da pasta `mobile/`).
    2. Na tela principal (Agenda), observe o bloco superior de métricas (`InfosWidget`) contendo os cards: "Este Mês", "Próximos", "Shows/Mês" e "Cachê/Mês".
  - **O que validar**: Os 4 cards são renderizados com layout uniforme, espaçamento harmonioso (180px de largura por card), tipografia legível e sem advertências visuais de estouro de layout (overflow).

- [ ] T5.2 — Validação da Contagem de "Este Mês" e "Shows/Mês"
  - **Como testar**:
    1. No dispositivo físico, examine os compromissos cadastrados para o mês atual (ex.: setembro/2026).
    2. Compare a contagem do card "Este Mês" com o total de eventos desse mês (incluindo passados e futuros do próprio mês).
    3. Crie ou localize compromissos com tipos variados (ex.: um "Ensaio" ou "Reunião" e um "Show").
    4. Observe o valor exibido no card "Shows/Mês".
  - **O que validar**: O card "Este Mês" contabiliza rigorosamente todos os eventos do mês corrente; o card "Shows/Mês" contabiliza estritamente os eventos do tipo `Show`, desconsiderando ensaios e reuniões.

- [ ] T5.3 — Validação da Formatação Monetária e Isolamento do "Cachê/Mês"
  - **Como testar**:
    1. Observe o valor exibido no card "Cachê/Mês".
    2. Se não houver compromissos com cachê no mês atual, confirme a exibição de `R$ 0,00`.
    3. Para eventos com cachê no mês atual (ex.: `15000.00`), confirme que o card exibe o formato monetário brasileiro `R$ 15.000,00` em uma única linha.
    4. Verifique se cachês de compromissos de meses anteriores (histórico) ou meses futuros distantes NÃO são somados no "Cachê/Mês".
  - **O que validar**: O card "Cachê/Mês" exibe o valor formatado com prefixo `R$` e separador de milhar brasileiro, somando apenas os cachês pertencentes ao mês corrente.

- [ ] T5.4 — Validação de Responsividade e Escala com Valores Altos de Cachê (FittedBox)
  - **Como testar**:
    1. Crie ou edite um compromisso no mês atual com um valor de cachê elevado (ex.: digite `15000000` no formulário para obter `R$ 150.000,00`).
    2. Retorne à tela principal e observe a renderização do card "Cachê/Mês".
  - **O que validar**: O texto do valor longo se redimensiona proporcionalmente via `FittedBox` para caber na largura disponível do card (180px), permanecendo em linha única sem quebras defeituosas e sem overflow.

## Checklist de fechamento da feature

- [x] Card "Este Mês" contabiliza compromissos do mês corrente
- [x] Card "Shows/Mês" contabiliza apenas eventos de tipo "Show" no mês corrente
- [x] Card "Cachê/Mês" soma apenas cachês de eventos do mês corrente
- [x] Valor de faturamento formatado com `R$` e separador de milhar brasileiro
- [x] Valores altos redimensionados sem estourar o card ou quebrar linha
- [x] `flutter test` 100% verde sem regressões
- [x] `backlog.md` atualizado
- [ ] Validação dos cards concluída no dispositivo físico

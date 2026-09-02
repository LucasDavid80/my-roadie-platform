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
- [ ] T3.2 — Atualizar `test/principal_screen_test.dart` validando que os cards na tela principal refletem fielmente os valores do mês corrente.

## Fase 4 — Fechamento

- [ ] T4.1 — Rodar `flutter test` completo no mobile garantindo 100% dos testes verdes e sem regressões.
- [ ] T4.2 — Atualizar `backlog.md`: mover a entrada da Spec 022 para `concluído (specs/022-correcao-cards-dashboard/)`.
- [ ] T4.3 — Fechar checklist de fechamento abaixo e critérios de sucesso em `spec.md` atomicamente no mesmo passo.

## Checklist de fechamento da feature

- [ ] Card "Este Mês" contabiliza compromissos do mês corrente
- [ ] Card "Shows/Mês" contabiliza apenas eventos de tipo "Show" no mês corrente
- [ ] Card "Cachê/Mês" soma apenas cachês de eventos do mês corrente
- [ ] Valor de faturamento formatado com `R$` e separador de milhar brasileiro
- [ ] Valores altos redimensionados sem estourar o card ou quebrar linha
- [ ] `flutter test` 100% verde sem regressões
- [ ] `backlog.md` atualizado

# Tasks — 020: Correção de UX no Modal "Novo Compromisso" (Mobile)

Pré-requisitos: Extensão do Modelo de Eventos (spec 015 concluída).

## Fase 0 — Diagnóstico, Inspeção e Validação Visual

- [x] T0.1 — Inspecionar árvore de widgets e paddings aninhados de `NewAppointmentWidget`, `principal_screen.dart` e `commitment_card.dart` medindo a largura útil do modal em viewports móveis (360x640, 390x844).
  - Critério: diagnósticos de paddings redundantes documentados em `plan.md` e `spec.md`.
- [x] T0.2 — Inspecionar o comportamento do campo "Cachê" ao digitar valores como `1500,00` e `10000,00`, identificando a largura mínima requerida para exibição sem corte.
  - Critério: valores de flex e padding validados e documentados em `plan.md`.
- [ ] T0.3 — Inspecionar o layout dos botões de ação e a usabilidade dos seletores de horário ("Início" e "Término").
  - Critério: confirmação do alinhamento dos botões e preservação da compatibilidade com o formato `"HH:mm"`.

## Fase 1 — Otimização de Espaçamentos e Margens do Modal

- [ ] T1.1 — Ajustar a exibição do `Dialog` em `principal_screen.dart` e `commitment_card.dart` configurando `insetPadding` controlado (`EdgeInsets.symmetric(horizontal: 16, vertical: 24)`).
  - Critério: o diálogo ocupa a largura disponível da tela respeitando a margem externa controlada.
- [ ] T1.2 — Ajustar `NewAppointmentWidget` removendo a margem redundante (`margin: EdgeInsets.zero`) no container principal e ajustando o padding interno do formulário para `EdgeInsets.symmetric(horizontal: 16, vertical: 20)`.
  - Critério: espaço horizontal útil dos campos aumentado significativamente em telas compactas.

## Fase 2 — Rebalanceamento do Campo Cachê e Inputs

- [ ] T2.1 — Rebalancear as proporções dos campos "Local" e "Cachê" na linha compartilhada do `NewAppointmentWidget` (`flex: 3` para Local e `flex: 2` para Cachê).
  - Critério: o campo Cachê ganha espaço suficiente para exibir valores extensos sem sobreposição.
- [ ] T2.2 — Otimizar o `contentPadding` e propriedades de entrada em `_buildSimpleInput` para campos monetários (`isMoney: true`).
  - Critério: digitação de valores como `1500,00` e `12500,00` exibida sem cortes laterais ou truncamento de dígitos.

## Fase 3 — Padronização dos Botões de Ação e Seletores de Horário

- [ ] T3.1 — Padronizar o layout dos botões de ação ("Cancelar" e "Criar Compromisso" / "Salvar Alterações") no `NewAppointmentWidget`, removendo o `Center` restritivo e definindo largura total uniforme (`width: double.infinity`) com espaçamento vertical de 12px e altura consistente.
  - Critério: botões com limites e bordas bem delineadas, sem sobreposição ou assimetria visual.
- [ ] T3.2 — Refinar a apresentação visual dos seletores de horário ("Início" e "Término"), garantindo feedback tátil, ícones alinhados e exibição clara de horários preenchidos.
  - Critério: seleção e cancelamento de horários operam com precisão mantendo o formato `"HH:mm"`.

## Fase 4 — Testes Automatizados, Widget Tests e Validação de Cobertura

- [ ] T4.1 — Atualizar e expandir a suíte de testes de widget (`test/new_appointment_widget_test.dart`) cobrindo cenários com valores de cachê altos (`1500,00`, `10000,00`), alinhamento de botões e integridade do formulário.
  - Critério: todos os testes de widget passam com sucesso (`flutter test test/new_appointment_widget_test.dart`).
- [ ] T4.2 — Executar a suíte de testes unitários e de integração do mobile (`flutter test` e `integration_test/agenda_flow_test.dart`).
  - Critério: 100% dos testes do mobile passando sem regressões.
- [ ] T4.3 — Medir a cobertura de testes no app mobile (`flutter test --coverage`).
  - Critério: cobertura mantida ou ampliada em conformidade com `constitution.md §5`.

## Checklist de fechamento da feature

- [ ] Margens internas do modal ajustadas, eliminando o aperto visual dos campos em aparelhos mobile
- [ ] Campo "Cachê" exibe valores altos (ex.: `1500,00`, `12500,00`) com legibilidade completa e sem corte
- [ ] Botões de ação padronizados com bordas laterais, largura uniforme e sem sobreposição
- [ ] Seletores de horário mantidos intuitivos e compatíveis com persistência `"HH:mm"`
- [ ] Testes unitários, de widget e de integração passando no mobile
- [ ] `backlog.md` e baseline sincronizados ao final da spec

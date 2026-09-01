# Tasks — 020: Correção de UX no Modal "Novo Compromisso" (Mobile)

Pré-requisitos: Extensão do Modelo de Eventos (spec 015 concluída).

## Fase 0 — Diagnóstico, Inspeção e Validação Visual

- [x] T0.1 — Inspecionar árvore de widgets e paddings aninhados de `NewAppointmentWidget`, `principal_screen.dart` e `commitment_card.dart` medindo a largura útil do modal em viewports móveis (360x640, 390x844).
  - Critério: diagnósticos de paddings redundantes documentados em `plan.md` e `spec.md`.
- [x] T0.2 — Inspecionar o comportamento do campo "Cachê" ao digitar valores como `1500,00` e `10000,00`, identificando a largura mínima requerida para exibição sem corte.
  - Critério: valores de flex e padding validados e documentados em `plan.md`.
- [x] T0.3 — Inspecionar o layout dos botões de ação e a usabilidade dos seletores de horário ("Início" e "Término").
  - Critério: confirmação do alinhamento dos botões e preservação da compatibilidade com o formato `"HH:mm"`.

## Fase 1 — Otimização de Espaçamentos e Margens do Modal

- [x] T1.1 — Ajustar a exibição do `Dialog` em `principal_screen.dart` e `commitment_card.dart` configurando `insetPadding` controlado (`EdgeInsets.symmetric(horizontal: 16, vertical: 24)`).
  - Critério: o diálogo ocupa a largura disponível da tela respeitando a margem externa controlada.
- [x] T1.2 — Ajustar `NewAppointmentWidget` removendo a margem redundante (`margin: EdgeInsets.zero`) no container principal e ajustando o padding interno do formulário para `EdgeInsets.symmetric(horizontal: 16, vertical: 20)`.
  - Critério: espaço horizontal útil dos campos aumentado significativamente em telas compactas.

## Fase 2 — Estruturação de Linhas Dedicadas para Local e Cachê

- [x] T2.1 — Reestruturar os campos "Local" e "Cachê" em linhas dedicadas individuais (100% de largura para Local e 100% de largura para Cachê condicional ao tipo `Show` ou `Gravação`).
  - Critério: campo Local e campo Cachê com largura total (100%), permitindo visualização de endereços completos e valores monetários sem corte.
- [x] T2.2 — Configurar o campo "Cachê" como input monetário especializado com máscara em tempo real (`prefixText: 'R$ '`, `keyboardType: number` e `CurrencyInputFormatter` com cálculo automático de centavos).
  - Critério: usuário digita números diretamente e o campo formata automaticamente com 2 casas decimais (ex.: `150000` vira `1500,00` e `1250000` vira `12500,00`) com prefixo `R$` e sem necessidade de digitar vírgula.

## Fase 3 — Padronização dos Botões de Ação e Seletores de Horário

- [x] T3.1 — Padronizar o layout dos botões de ação ("Cancelar" e "Criar Compromisso" / "Salvar Alterações") no `NewAppointmentWidget`, removendo o `Center` restritivo e definindo largura total uniforme (`width: double.infinity`) com espaçamento vertical de 12px e altura consistente.
  - Critério: botões com limites e bordas bem delineadas, sem sobreposição ou assimetria visual.
- [x] T3.2 — Refinar a apresentação visual dos seletores de horário ("Início" e "Término"), garantindo feedback tátil, ícones alinhados e exibição clara de horários preenchidos.
  - Critério: seleção e cancelamento de horários operam com precisão mantendo o formato `"HH:mm"`.

## Fase 4 — Testes Automatizados, Widget Tests e Validação de Cobertura

- [x] T4.1 — Atualizar e expandir a suíte de testes de widget (`test/new_appointment_widget_test.dart`) cobrindo cenários com valores de cachê altos (`1500,00`, `10000,00`), alinhamento de botões e integridade do formulário.
  - Critério: todos os testes de widget passam com sucesso (`flutter test test/new_appointment_widget_test.dart`).
- [x] T4.2 — Executar a suíte de testes unitários e de integração do mobile (`flutter test` e `integration_test/agenda_flow_test.dart`).
  - Critério: 100% dos testes do mobile passando sem regressões.
- [x] T4.3 — Medir a cobertura de testes no app mobile (`flutter test --coverage`).
  - Critério: cobertura mantida ou ampliada em conformidade com `constitution.md §5`.

## Fase 5 — Validação Manual e Testes do Usuário

- [x] T5.1 — Validação Visual de Espaçamento e Margens do Modal
  - **Como testar**:
    1. Inicie o aplicativo mobile no dispositivo físico ou emulador (`flutter run` dentro da pasta `mobile/`).
    2. Na tela principal (Agenda), clique no botão flutuante `+` (FAB) para abrir o modal "Novo Compromisso".
    3. Observe a distribuição horizontal do modal na tela.
  - **O que validar**: O formulário aproveita a largura da tela com respiro lateral equilibrado (16px), sem o aperto/esmagamento visual anterior provocado pelo aninhamento excessivo de margens.

- [x] T5.2 — Validação de Entrada com Máscara Monetária Automática no Campo "Cachê"
  - **Como testar**:
    1. No modal aberto, mantenha o tipo como `Show` (ou mude para `Gravação`).
    2. Toque no campo "Local" e digite um endereço longo (ex.: `Av. Paulista, 1578 - Bela Vista, São Paulo - SP`).
    3. Toque no campo "Cachê" e digite apenas números no teclado numérico (ex.: digite `150000` para `1500,00`, `1250000` para `12500,00` e `15000000` para `150000,00`).
    4. Teste apagar (backspace) para ver o recuo automático das casas decimais.
  - **O que validar**: O campo "Local" ocupa 100% da linha sem espremer outros inputs; o campo "Cachê" exibe o teclado numérico, formata automaticamente com 2 casas decimais sem precisar digitar vírgula, exibe o prefixo `R$ `, e permite visualização completa sem corte ou truncamento de texto.

- [ ] T5.3 — Validação da Dinâmica de Tipos de Compromisso e Seletores de Horário
  - **Como testar**:
    1. No dropdown "Tipo", altere a opção de `Show` para `Ensaio` ou `Reunião`.
    2. Observe o desaparecimento imediato do campo "Cachê".
    3. Alterne novamente para `Show` e confirme a reaparição do campo "Cachê".
    4. Toque no card de horário "Início" e selecione um horário no relógio (ex.: `20:00`).
    5. Toque no card de horário "Término" e selecione um horário no relógio (ex.: `23:30`).
  - **O que validar**: A alternância de tipo oculta/exibe o campo Cachê de forma reativa; os seletores de horário abrem o diálogo `showTimePicker` temático e exibem claramente as horas formatadas no padrão `"HH:mm"`.

- [ ] T5.4 — Validação dos Botões de Ação e Ciclo de Criação e Edição
  - **Como testar**:
    1. No rodapé do modal, observe o alinhamento dos botões "Cancelar" e "Criar Compromisso".
    2. Toque no botão "Cancelar" e confirme que o modal fecha sem persistir alterações.
    3. Abra novamente o modal, preencha os dados completos (Título, Data, Horários, Local, Cachê de `3500,00`, Observações) e toque em "Criar Compromisso".
    4. Na listagem da Agenda, localize o card recém-criado e toque no botão de editar (ícone de lápis).
    5. No modal "Editar Compromisso", confirme que todos os dados foram carregados (inclusive o cachê `"3500,00"` e horários).
    6. Altere o cachê para `5000,00` e toque em "Salvar Alterações".
  - **O que validar**: Ambos os botões têm largura total uniforme (100%), espaçamento vertical de 12px e bordas bem delineadas; o modal cancela e fecha corretamente; a criação e a edição persistem e atualizam os dados da agenda na interface sem falhas.

## Checklist de fechamento da feature

- [ ] Margens internas do modal ajustadas, eliminando o aperto visual dos campos em aparelhos mobile
- [ ] Campo "Cachê" exibe valores altos (ex.: `1500,00`, `12500,00`) com legibilidade completa e sem corte
- [ ] Botões de ação padronizados com bordas laterais, largura uniforme e sem sobreposição
- [ ] Seletores de horário mantidos intuitivos e compatíveis com persistência `"HH:mm"`
- [ ] Testes unitários, de widget e de integração passando no mobile
- [ ] `backlog.md` e baseline sincronizados ao final da spec

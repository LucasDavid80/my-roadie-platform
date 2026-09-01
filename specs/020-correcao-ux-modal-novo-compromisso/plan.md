# Plan — 020: Correção de UX no Modal "Novo Compromisso" (Mobile)

## 1. Diagnóstico Técnico & Arquitetura

O modal de criação/edição de compromissos é implementado pelo widget `NewAppointmentWidget` (`mobile/lib/presentation/widgets/new_appointment_widget.dart`), consumido tanto na criação via `PrincipalScreen` quanto na edição via `CommitmentCard`.

### Diagnóstico das Falhas Identificadas

1. **Bordas internas excessivas (Aperto do formulário)**:
   - **Causa Raiz**: O Flutter aplica um `insetPadding` padrão no `Dialog` (`horizontal: 40, vertical: 24`). Dentro do `NewAppointmentWidget`, há um `Container` com `margin: const EdgeInsets.all(16)` contendo uma `Column` com `Padding(horizontal: 20, vertical: 24)`. O aninhamento dessas três camadas resulta em uma perda acumulada de até 76px de cada lado (152px no total), deixando apenas ~200px a 240px de área útil em telas típicas de smartphones (360-400px de largura).
   - **Solução**:
     - Configurar `insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24)` no `Dialog` (ou utilizar `backgroundColor: Colors.transparent` com padding controlado).
     - Zerar a margem externa desnecessária (`margin: EdgeInsets.zero`) no `Container` principal do `NewAppointmentWidget`.
     - Ajustar o padding interno do formulário para `EdgeInsets.symmetric(horizontal: 16, vertical: 20)`, garantindo respiro visual e maximizando o espaço horizontal útil dos inputs.

2. **Campo "Cachê" cortando valores altos e aperto em "Local"**:
   - **Causa Raiz**: Quando o tipo é `Show` ou `Gravação`, o formulário dividia a linha entre "Local" e "Cachê" usando `Expanded(flex: 2)` para Local e `Expanded(flex: 1)` para Cachê. Em uma tela com largura espremida, o campo de Cachê ficava com apenas ~65px de largura, provocando corte imediato em valores como `1500,00` ou `3500,00`, enquanto "Local" ficava limitado para endereços longos.
   - **Solução (Abordagem A — Linhas Dedicadas)**:
     - Reestruturar o layout para que o campo "Local" ocupe a linha inteira (100% de largura), acomodando endereços completos sem aperto.
     - Posicionar o campo "Cachê" em sua própria linha dedicada logo abaixo (100% de largura), exibido apenas quando o tipo for `Show` ou `Gravação`.
     - Ajustar o `contentPadding` de inputs monetários (`horizontal: 12, vertical: 14`), permitindo que valores extensos (ex.: `12500,00`, `150000,00`) sejam visualizados com folga total.

3. **Botão "Criar Compromisso" sem bordas laterais e desalinhado com "Cancelar"**:
   - **Causa Raiz**: O botão "Cancelar" é um `OutlinedButton` esticado por padrão na coluna (`CrossAxisAlignment.stretch`), enquanto o botão de confirmação ("Criar Compromisso" / "Salvar Alterações") foi envolvido em um `Center(child: ElevatedButton(...))`. Isso forçou o botão primário a encolher apenas para a largura do seu texto, quebrando a consistência de largura, o alinhamento com o botão secundário e gerando assimetria visual.
   - **Solução**:
     - Padronizar os botões de ação com largura uniforme e espaçamento definido (`SizedBox(height: 12)`).
     - Remover o `Center` restritivo e aplicar `SizedBox(width: double.infinity)` no botão de confirmação (ou estruturar os botões com layout de rodapé consistente, onde ambos possuem altura fixa de 48px, bordas arredondadas uniformes `BorderRadius.circular(8)` e contraste visual claro entre ação primária e secundária).

4. **Avaliação técnica da seleção de horários ("Início" / "Término" vs Duração)**:
   - **Análise**:
     - O modelo do banco de dados (Prisma) e a API NestJS persistem `startTime: "HH:mm"` e `endTime: "HH:mm"`.
     - No Flutter, o framework nativo fornece `showTimePicker` para seleção de horas/minutos individuais. Não há componente nativo de "TimeRangePicker" no core do Flutter, e adicionar uma biblioteca externa de terceiros traria complexidade de manutenção desnecessária.
     - A representação atual em dois blocos lado a lado ("Início" e "Término") é clara, familiar e diretamente compatível com os contratos de API.
     - **Decisão Técnica**: Manter a seleção individual de início e término via `showTimePicker`, otimizando a apresentação visual dos cards de seleção com ícones de relógio alinhados, exibição legível da hora selecionada (`--:--` quando não preenchido) e layout visualmente unificado.

---

## 2. Fases de Execução

### Fase 0 — Diagnóstico, Inspeção e Validação de Layout
- Inspecionar detalhadamente a árvore de widgets em `NewAppointmentWidget`, `principal_screen.dart` e `commitment_card.dart`.
- Medir a largura útil dos campos em viewports móveis padrão (360x640, 390x844, 412x915).
- Testar a digitação de valores monetários representativos (`500,00`, `1500,00`, `10000,00`) e confirmar os pontos de quebra visual.

### Fase 1 — Otimização de Espaçamentos e Margens do Modal
- Ajustar `showDialog` e `Dialog` em `principal_screen.dart` e `commitment_card.dart` definindo `insetPadding` controlado.
- Ajustar `NewAppointmentWidget`:
  - Remover `margin: const EdgeInsets.all(16)` do `Container` principal.
  - Ajustar o padding interno do formulário para `EdgeInsets.symmetric(horizontal: 16, vertical: 20)`.

### Fase 2 — Estruturação de Linhas Dedicadas e Especialização do Campo Cachê
- Modificar o layout dos campos "Local" e "Cachê" no `NewAppointmentWidget`:
  - Definir "Local" como campo de largura total (100%).
  - Posicionar "Cachê" em linha própria dedicada abaixo de "Local" (100% de largura), renderizado condicionalmente quando `showsFee == true`.
  - Configurar o campo "Cachê" como input monetário especializado:
    - `prefixText: 'R$ '` no `InputDecoration`.
    - `keyboardType: const TextInputType.numberWithOptions(decimal: true)`.
    - `inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'^\d+([.,]\d{0,2})?'))]` para validação estrita de valores decimais monetários.
    - Sanitização segura na extração: `double.tryParse(_cacheController.text.replaceAll(',', '.')) ?? 0.0`.
- Garantir visualização completa sem corte para strings numéricas com formatação monetária.

### Fase 3 — Padronização dos Botões de Ação e Seletores de Horário
- Reestruturar o rodapé de ações no `NewAppointmentWidget`:
  - Remover o `Center` em torno do `ElevatedButton`.
  - Definir largura total (`width: double.infinity`) e altura ergonômica para ambos os botões ("Cancelar" e "Criar Compromisso" / "Salvar Alterações").
  - Aplicar espaçamento vertical consistente de 12px entre os botões.
- Garantir que a apresentação dos seletores de "Início" e "Término" permaneça alinhada e intuitiva.

### Fase 4 — Testes Automatizados, Widget Tests e Validação de Cobertura
- Atualizar e expandir `test/new_appointment_widget_test.dart` com testes cobrindo valores altos de cachê, renderização correta dos botões e interação completa.
- Executar os testes unitários e de widget do mobile (`flutter test`).
- Validar a suíte E2E mobile (`mobile/integration_test/agenda_flow_test.dart`).
- Medir cobertura de testes do mobile com `flutter test --coverage`.

### Fase 5 — Validação Manual e Testes do Usuário
- Executar roteiro de validação interativa no dispositivo físico ou emulador.
- Validar visualmente as margens e área útil em tela real.
- Validar digitação de valores monetários longos e comportamento do teclado.
- Validar seleção e persistência dos seletores de horário.
- Validar proporção, clique e fluxo dos botões de ação na criação e na edição de compromissos.

---

## 3. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Quebra de testes de widget existentes devido a alteração de estrutura | Médio | Manter as mesmas `ValueKey`s nos campos e botões (`appointment_title_field`, `appointment_fee_field`, `appointment_confirm_button`, etc.) |
| Overflow vertical em telas com teclado aberto | Médio | O `NewAppointmentWidget` já está envolto em `SingleChildScrollView`; manter comportamento de rolagem ao abrir o teclado virtual |
| Incompatibilidade de dados de horário com a API | Baixo | Preservar a formatação `"HH:mm"` no envio para o `onConfirm` / `EventEntity` |

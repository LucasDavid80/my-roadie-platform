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

2. **Campo "Cachê" cortando valores altos**:
   - **Causa Raiz**: Quando o tipo é `Show` ou `Gravação`, o formulário divide a linha entre "Local" e "Cachê" usando `Expanded(flex: 2)` para Local e `Expanded(flex: 1)` para Cachê. Em uma tela com largura espremida, o campo de Cachê ficava com apenas ~65px de largura. Descontando o `contentPadding` horizontal (24px) e o ícone de cifrão (18px), sobravam menos de 30px para os dígitos, provocando corte imediato em valores como `1500,00` ou `3500,00`.
   - **Solução**:
     - Rebalancear a proporção da linha para `flex: 3` (Local) e `flex: 2` (Cachê) ou utilizar proporção `5:4`, garantindo largura confortável para digitação de valores com centavos e múltiplos dígitos.
     - Ajustar o `contentPadding` específico de inputs monetários (`horizontal: 10, vertical: 14`), permitindo que valores extensos (ex.: `12500,00`) sejam visualizados integralmente.

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

### Fase 2 — Rebalanceamento do Campo Cachê e Inputs
- Modificar o layout do bloco "Local e Cachê" no `NewAppointmentWidget`:
  - Ajustar proporções dos `Expanded` (`flex: 3` para Local e `flex: 2` para Cachê).
  - Ajustar `contentPadding` e propriedades de entrada no `_buildSimpleInput`.
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

---

## 3. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Quebra de testes de widget existentes devido a alteração de estrutura | Médio | Manter as mesmas `ValueKey`s nos campos e botões (`appointment_title_field`, `appointment_fee_field`, `appointment_confirm_button`, etc.) |
| Overflow vertical em telas com teclado aberto | Médio | O `NewAppointmentWidget` já está envolto em `SingleChildScrollView`; manter comportamento de rolagem ao abrir o teclado virtual |
| Incompatibilidade de dados de horário com a API | Baixo | Preservar a formatação `"HH:mm"` no envio para o `onConfirm` / `EventEntity` |

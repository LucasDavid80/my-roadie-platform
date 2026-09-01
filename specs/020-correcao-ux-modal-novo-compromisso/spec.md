# Spec — 020: Correção de UX no Modal "Novo Compromisso" (Mobile)

## Objetivo

Corrigir falhas de experiência do usuário (UX) e usabilidade visual no modal/diálogo de criação e edição de compromissos (`NewAppointmentWidget`) do aplicativo mobile:
1. Eliminar o aperto visual dos campos causado por margens e paddings internos excessivos/aninhados.
2. Corrigir o truncamento e corte de texto no campo "Cachê" ao digitar valores maiores (ex.: `1500,00` ou superiores).
3. Reestruturar os botões de ação ("Cancelar" e "Criar Compromisso" / "Salvar Alterações"), eliminando sobreposições visuais e estabelecendo hierarquia, alinhamento e proporções adequadas.
4. Avaliar e aprimorar a usabilidade da seleção de horários ("Início" e "Término" / Duração), garantindo uma experiência intuitiva e precisa.

## Por quê

- **Impacto alto (usabilidade e ergonomia)**: O modal de criação/edição de compromissos é o principal ponto de entrada de dados da agenda no mobile. Falhas visuais, botões desalinhados ou campos cortados transmitem sensação de instabilidade e dificultam a operação rápida por músicos e roadies.
- **Perda de área útil em telas mobile**: A combinação de margens padrão do `Dialog` com margens do container e paddings internos do widget espreme o formulário horizontalmente, deixando pouco espaço para digitação em telas com larguras menores (~360px a 400px).
- **Legibilidade de dados financeiros**: O campo de cachê com largura reduzida corta valores de shows e gravações, impedindo a conferência clara do valor digitado antes de salvar.
- **Clareza de ação no rodapé do formulário**: Os botões de confirmação e cancelamento precisam de distinção visual nítida, áreas de toque adequadas e espaçamento consistente sem que um sobreponha ou desfigure o outro.

## Escopo

1. **Otimização de Espaçamento e Margens**:
   - Ajustar o espaçamento externo e interno do modal de compromisso (`NewAppointmentWidget`), eliminando bordas internas redundantes para maximizar o aproveitamento da largura da tela.
2. **Linha Dedicada e Formato Especializado para Local e Cachê**:
   - Reestruturar o formulário para que o campo "Local" ocupe a largura total (100%), permitindo a visualização de endereços longos.
   - Posicionar o campo "Cachê" em linha própria dedicada (100% de largura) condicional aos tipos *Show* e *Gravação*, tratando-o como campo monetário especializado com prefixo visual `R$ `, teclado puramente numérico (`TextInputType.number`) e máscara monetária automática em tempo real (`CurrencyInputFormatter` estilo ATM/bancário), onde os dígitos entram nos centavos e são deslocados automaticamente para a esquerda sem necessidade de digitação manual de vírgula.
3. **Padronização dos Botões de Ação**:
   - Adequar o posicionamento, largura, espaçamento e estilo visual dos botões "Cancelar" e "Criar Compromisso" / "Salvar Alterações", garantindo que ambos tenham limites claros e visual consistente.
4. **Refinamento da Seleção de Horários**:
   - Otimizar a ergonomia da seleção de horários de início e término no formulário, mantendo total integridade com os campos esperados pelo backend (`startTime` e `endTime`).
5. **Cobertura de Testes**:
   - Atualizar e expandir testes de widget (`new_appointment_widget_test.dart`) e validar a suíte de testes de integração (`agenda_flow_test.dart`).

## Fora de escopo

- Alterações no modelo de dados do backend ou schema Prisma (os campos `startTime`, `endTime`, `fee`, `type`, etc., já foram normalizados na spec 015).
- Alterações em endpoints da API NestJS ou telas do frontend web.
- Filtro de histórico de compromissos passados (item separado no `backlog.md`).
- Implementação de persistência offline (item separado no `backlog.md`).

## Resultados da Inspeção (Fase 0 — T0.1)

### 1. Diagnóstico da Árvore de Widgets e Margens Aninhadas
- **Camada 1 (`Dialog` em `principal_screen.dart` e `commitment_card.dart`)**: Aplicação do `insetPadding` padrão do Flutter (`horizontal: 40px`, `vertical: 24px`), totalizando 80px horizontais consumidos antes de atingir o widget.
- **Camada 2 (`Container` raiz em `NewAppointmentWidget`)**: Margem desnecessária de `EdgeInsets.all(16)` (32px horizontais).
- **Camada 3 (`Padding` do formulário em `NewAppointmentWidget`)**: Padding interno de `EdgeInsets.symmetric(horizontal: 20, vertical: 24)` (40px horizontais).
- **Perda acumulada atual**: `80px + 32px + 40px = 152px` (76px de perda em cada margem lateral).

### 2. Tabela de Largura Útil nos Viewports Analisados

| Viewport / Dispositivo | Largura Total | Largura Útil Atual (Perda 152px) | Largura Útil Pós-Correção (Perda 64px) | Ganho de Área Útil |
|---|---|---|---|---|
| **360x640** (Android Compacto) | 360px | **208px** (57,7%) | **296px** (82,2%) | **+88px (+42,3%)** |
| **390x844** (iPhone 12/13/14) | 390px | **238px** (61,0%) | **326px** (83,6%) | **+88px (+37,0%)** |
| **412x915** (Android Moderno) | 412px | **260px** (63,1%) | **348px** (84,5%) | **+88px (+33,8%)** |

### 3. Diagnóstico do Campo "Cachê" e Decisão de Layout em Linha Própria (T0.2)
- **Cálculo de Renderização Tipográfica (Roboto / 16px)**:
  - Largura média por dígito: ~`9.5px`.
  - Largura da vírgula/ponto: ~`4.5px`.
  - Overhead do input (bordas + `contentPadding` horizontal 12px): `26px`.
- **Largura Mínima Requerida por Valor**:
  - `"1500,00"` (7 chars / 61.5px texto + 34px overhead/cursor): **~95.5px**.
  - `"10000,00"` / `"12500,00"` (8 chars / 71.0px texto + 34px overhead/cursor): **~105.0px**.
  - `"100000,00"` (9 chars / 80.5px texto + 34px overhead/cursor): **~114.5px**.
- **Decisão Técnica de Layout (Abordagem A — Linhas Dedicadas)**:
  - O campo "Local" ocupará a linha inteira (100% de largura / 296px em 360px), acomodando endereços longos.
  - O campo "Cachê" passará para uma linha dedicada própria logo abaixo do "Local" (100% de largura condicional a *Show* ou *Gravação*), eliminando qualquer aperto e garantindo consistência estrutural entre todos os tipos de compromisso.

### 4. Diagnóstico dos Botões de Ação e Seletores de Horário (T0.3)
- **Botões de Ação**:
  - Identificado `Center(child: ElevatedButton(...))` que quebra o esticamento da coluna, reduzindo a largura do botão principal em relação ao `OutlinedButton` ("Cancelar").
  - Solução: remoção do `Center` para que ambos os botões ocupem largura total uniforme (100%) com espaçamento vertical de 12px e altura ergonômica.
- **Seletores de Horário ("Início" e "Término")**:
  - Confirmada compatibilidade total com o modelo de dados e API NestJS persistindo formato `"HH:mm"`.
  - O seletor utiliza `showTimePicker` temático e área de toque de 48px, com layout limpo e dividido em 50% / 50%.

---

## Critérios de Sucesso

- [ ] Margens internas do modal ajustadas, aproveitando adequadamente a largura da tela sem espremer os campos em aparelhos mobile.
- [ ] Campo "Cachê" permite visualizar e digitar valores altos (ex.: `1500,00`, `12500,00`) com clareza e sem truncamento de texto.
- [ ] Botões "Cancelar" e "Criar Compromisso" / "Salvar Alterações" exibidos com bordas, alinhamento, espaçamento e proporções harmônicas, sem sobreposição visual.
- [ ] Seletores de horário ("Início" e "Término") funcionam de maneira clara, rápida e intuitiva, preservando a persistência no formato `"HH:mm"`.
- [ ] 100% dos testes unitários, de widget e de integração do mobile executando com sucesso e sem regressões.
- [ ] `backlog.md` e baseline atualizados ao final da spec.

# Spec — 013: Ajustes de UX na Agenda (Mobile)

## Objetivo

Corrigir o bug de rolagem na tela de Agenda (`PrincipalScreen`) do app mobile: hoje, quando o toque de arraste começa em cima do calendário, a tela inteira trava verticalmente — não é possível descer para ver a lista de compromissos abaixo dele. Fora da área do calendário (cabeçalho, cards de info, lista de compromissos), a rolagem funciona normalmente.

## Por quê

- Impacto esperado **alto (usabilidade)**, conforme `backlog.md` — é um bug que impede o uso normal da tela principal do app em qualquer aparelho onde o calendário some parte da lista de compromissos.
- A tela de Agenda é a tela inicial do app (`selectedScreen: 'calendar'`); um bug de rolagem ali afeta o primeiro contato do usuário com o produto a cada abertura.
- Já há diagnóstico de causa raiz levantado em conversa anterior (ver `plan.md`), reduzindo o risco de retrabalho na Fase 0.

## Diagnóstico e Validações Técnicas Confirmadas (Fase 0: T0.1, T0.2, T0.3)

- **Reprodução do Bug (T0.1):** Na `PrincipalScreen`, toda a tela é envolvida em um `SingleChildScrollView`. O widget `CustomCalendar` utiliza `TableCalendar` com a configuração padrão `availableGestures: AvailableGestures.all`. Quando o toque é iniciado sobre a área do calendário, o evento de arrasto é interceptado na *gesture arena* do Flutter, impedindo que o `SingleChildScrollView` pai receba o gesto vertical e travando a rolagem da tela. Fora da área do calendário, a rolagem funciona normalmente.
- **Inspeção do Pacote TableCalendar (T0.2):** No código-fonte do `table_calendar: 3.2.0` (`TableCalendarBase`), o parâmetro `availableGestures` é por padrão `AvailableGestures.all`, o que avalia `_canScrollVertically` como `true` e atribui o callback `_swipeCalendarFormat` ao `SimpleGestureDetector.onVerticalSwipe`. Ao configurar `availableGestures: AvailableGestures.horizontalSwipe`, `_canScrollVertically` torna-se `false` e desativa o `SimpleGestureDetector` vertical, liberando o eixo vertical para o scroll pai.
- **Validação de Impacto Funcional (T0.3):** Uma varredura no código (`mobile/lib/` e `mobile/test/`) confirmou que não há nenhuma utilização de formatos alternativos de calendário (`CalendarFormat.twoWeeks` ou `CalendarFormat.week`). O app opera exclusivamente no modo mensal, portanto desabilitar a troca de formato via swipe vertical não gera efeitos colaterais nem perda de funcionalidade.

## Escopo

1. Permitir que o usuário role a tela de Agenda inteira (incluindo a área do calendário) sem o gesto ser interceptado pelo widget do calendário.
2. Preservar o comportamento de troca de mês via swipe horizontal no calendário e via as setas do cabeçalho customizado (`_buildArrowButton`).
3. Preservar a seleção de dia (tap) e a exibição dos marcadores de evento (bolinhas) no calendário.
4. Teste de widget cobrindo que a `PrincipalScreen` permanece rolável com o calendário renderizado.

## Fora de escopo

- Ajuste de layout horizontal do card "Novo Compromisso" (item separado do backlog, impacto médio).
- Centralização do botão "Criar Compromisso" (item separado do backlog, impacto baixo).
- Qualquer mudança visual no calendário (cores, marcadores, cabeçalho) além do necessário para destravar a rolagem.
- Mudança de biblioteca de calendário (`table_calendar`) — a correção deve caber dentro do pacote já usado, salvo se a Fase 0 encontrar um impeditivo técnico real.

## Critério de sucesso

- [ ] Um gesto de arraste vertical iniciado sobre a área do calendário rola a tela inteira (cabeçalho, infos, calendário e lista de compromissos), igual ao comportamento já observado fora do calendário.
- [ ] Trocar de mês continua funcionando pelas setas do cabeçalho customizado.
- [ ] Selecionar um dia no calendário (tap) continua funcionando e mostrando os compromissos daquele dia.
- [ ] Nenhuma regressão nos testes existentes de `principal_screen_test.dart` e `agenda_controller_test.dart`.
- [ ] Teste novo cobrindo a rolagem da tela com o calendário presente.
- [ ] `backlog.md` atualizado marcando esta entrada como `concluído (specs/013-ajustes-ux-agenda-mobile/)`.

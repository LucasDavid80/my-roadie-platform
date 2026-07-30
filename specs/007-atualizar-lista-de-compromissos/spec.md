# Spec — 007: Atualizar lista de compromissos após criação

## Objetivo

Garantir que, ao criar ou editar um compromisso (evento) no aplicativo mobile através do formulário `NewAppointmentWidget`, a lista de compromissos exibida na tela de Agenda (`PrincipalScreen`), no calendário (`CustomCalendar`) e no widget de lista (`CommitmentsWidget`) seja reativa e atualizada imediatamente após a confirmação, mantendo o estado sincronizado com o backend.

## Motivação

Atualmente, ao adicionar um novo compromisso na tela de Agenda do app mobile, o formulário envia a requisição de salvamento, mas a interface não reflete de imediato o novo evento na lista ou no calendário. O usuário precisa fechar/reabrir a tela ou recarregar manualmente a aplicação para visualizar o compromisso recém-criado. Esta melhoria de usabilidade resolve essa inconsistência.

## Escopo

- Ajustar o fluxo de salvamento em `AgendaController` (`mobile/lib/presentation/controllers/agenda_controller.dart`) para atualizar o estado de eventos (`state`) de forma reativa e consistente assim que a criação/edição for persistida.
- Conectar o retorno da persistência via API (`AgendaRepositoryImpl`) ao estado do `AgendaController`, utilizando o objeto `EventEntity` atualizado (com o `id` final retornado pelo backend NestJS).
- Garantir que o diálogo `NewAppointmentWidget` e a `PrincipalScreen` lidem corretamente com a chamada de criação/edição sem quebrar a renderização ou travar a UI.
- Adicionar/ajustar testes unitários e de widget no Flutter cobrindo o fluxo de inclusão/edição de compromissos e reatividade do `agendaProvider`.

## Fora de escopo

- Alterações no backend NestJS (`backend/src/modules/events`).
- Alterações em outras telas do aplicativo mobile além da tela de Agenda (`PrincipalScreen` e seus widgets).
- Redesenho de layout ou estilização visual dos cards ou do formulário (foco exclusivo na reatividade da lista).

## Critérios de Sucesso

- [ ] Ao preencher e confirmar a criação de um compromisso no formulário `NewAppointmentWidget`, o novo evento é exibido imediatamente na lista de compromissos e marcado no calendário.
- [ ] O evento persistido no estado possui o identificador (`id`) oficial retornado pela API do backend.
- [ ] Caso ocorra um erro de rede/API ao salvar, o estado da lista não é corrompido e a exceção é tratada de forma segura na UI.
- [ ] Suíte de testes do Flutter (`flutter test`) 100% verde com cobertura de casos positivos e de erro para o `AgendaController`.

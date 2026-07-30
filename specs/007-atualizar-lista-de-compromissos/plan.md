# Plan — 007: Atualizar lista de compromissos após criação

## Architecture & Stack Check

- **Tecnologia**: Flutter + Riverpod (`Notifier<List<EventEntity>>`) no `mobile/`.
- **Conformidade**: Respeita rigorosamente a `constitution.md` §2 (Clean Architecture: `presentation` → `domain` → `data`) e §5 (testes unitários e de widget no Flutter com cobertura de casos de sucesso e de falha).

## Diagnóstico Técnico

Atualmente:
1. Em `PrincipalScreen`, o `floatingActionButton` abre o diálogo `NewAppointmentWidget` passando um callback `onConfirm` que chama `ref.read(agendaProvider.notifier).addOrUpdateEvent(newEvent)`.
2. `AgendaController.addOrUpdateEvent` é um método `async` que chama `_repository.saveEvent(event)`. Porém:
   - A criação no `NewAppointmentWidget` instancia um `EventEntity` temporário com um ID fictício (`DateTime.now().toString()`).
   - O repositório envia o payload para a API NestJS (`POST /events`), que gera e retorna o objeto persistido com seu UUID definitivo do PostgreSQL (`id`).
   - Se o `AgendaController` apenas adiciona o `newEvent` temporário ou não aguarda a resolução do backend, a lista pode ficar dessincronizada ou não disparar a reatividade esperada na UI.
3. Se a requisição de salvamento falhar (erro 400/500/Rede), a exceção não tratada pode deixar o estado local num estado inconsistente.

## Estratégia de Solução

1. **Atualização do `AgendaController`**:
   - Garantir que `addOrUpdateEvent` execute a requisição `saveEvent` via `IAgendaRepository` e utilize o `EventEntity` retornado da API para atualizar o `state`.
   - Se for uma criação (ID novo), insere o evento retornado pela API no `state` (ou recarrega via `fetchEvents()`, preservando a consistência).
   - Se for uma edição, substitui o evento existente no `state`.
   - Em caso de exceção no repositório, rethrow/tratar adequadamente para que a UI receba a notificação de erro e não insira um evento fantasma na lista local.

2. **Ajuste nos Widgets (`presentation/`)**:
   - `NewAppointmentWidget`: O callback `onConfirm` deve ser assíncrono ou disparar a chamada de salvamento no controller tratando o indicador de carregamento/sucesso antes de dar `context.pop()`.
   - `PrincipalScreen`: Observa `agendaProvider` via `ref.watch(agendaProvider)`. Como o Notifier gera uma nova lista imutável ao alterar `state`, todos os widgets dependentes (`CustomCalendar`, `CommitmentsWidget`, `InfosWidget`) serão reconstruídos automaticamente.

3. **Estratégia de Testes**:
   - Testes unitários do `AgendaController` utilizando mocks do `IAgendaRepository` para validar:
     1. Adição com sucesso de um novo evento -> verifica que `state` contém o novo evento com ID da API.
     2. Edição com sucesso de evento existente -> verifica atualização no `state`.
     3. Tratamento de falha no salvamento -> verifica que `state` permanece inalterado.
   - Teste de widget no Flutter para validar que submeter o formulário faz a lista renderizar o novo item.

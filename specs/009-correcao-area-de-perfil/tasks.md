# Tasks — 009: Correção de erro de tela vermelha na área de usuários/perfil

Pré-requisitos: `mobile` configurado com biblioteca do Flutter, Riverpod e suíte de testes `flutter_test`.

## Fase 1 — Diagnóstico e Correção nos Widgets da Tela de Perfil

- [x] T1.1 — Refatorar `mobile/lib/presentation/screens/person/widgets/photo_widget.dart` removendo parâmetros incompatíveis de layout (`spacing` no `Row`) e garantindo árvore de renderização segura.
  - Critério: `PhotoWidget` constrói e renderiza sem erros de layout ou exceções visuais.
- [x] T1.2 — Atualizar `mobile/lib/presentation/screens/person/widgets/info_widget.dart` e `custom_text_field.dart` garantindo o repasse seguro dos valores do `UserEntity` para evitar exceções em `double.tryParse` ou conversão de texto nulo.
  - Critério: Todos os campos do perfil exibem e atualizam os dados preenchidos no estado de forma segura.

## Fase 2 — Estabilização do Estado no Riverpod (`user_controller.dart`)

- [x] T2.1 — Refatorar `UserNotifier` em `mobile/lib/presentation/controllers/user_controller.dart` garantindo a inicialização imutável e segura do `UserEntity` com listas não nulas para `instruments` e `styles`.
  - Critério: `userProvider` inicia com estado válido garantindo que seleções de `MultiSelectionWidget` não disparem erro por `null`.
- [x] T2.2 — Adicionar tratamento de erros e exceções de requisição em `fetchProfile` e `saveProfile` com fallbacks seguros.
  - Critério: Exceções de rede ou HTTP 404/500 são tratadas no estado sem propagar tela vermelha de exceção *unhandled*.
- [x] T2.3 — Garantir o carregamento dos dados do perfil do banco de dados/API toda vez que a tela `PersonScreen` for acessada.
  - Critério: `PersonScreen` executa `fetchProfile()` no `initState` via `addPostFrameCallback`, atualizando o estado do perfil a cada navegação.

## Fase 3 — Cobertura de Testes de Widget no Flutter (`flutter_test`)

- [x] T3.1 — Criar a suíte de testes de widget `mobile/test/presentation/screens/person_screen_test.dart` validando a navegação e renderização completa de `PersonScreen` sob `ProviderScope`.
  - Critério: `flutter test` no `mobile` executa com 100% dos testes verdes validando a tela de perfil sem exceções em tela.

## Checklist de fechamento da feature

- [x] Navegação para a rota `/profile` abre a tela `PersonScreen` sem tela vermelha de exceção
- [x] Todos os campos do formulário de perfil exibem e atualizam os dados de forma legível e segura
- [x] `flutter test` no `mobile` 100% verde sem falhas ou regressões
- [x] Entrada em `backlog.md` atualizada com o status correspondente

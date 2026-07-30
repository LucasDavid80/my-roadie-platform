# Plan — 009: Correção de erro de tela vermelha na área de usuários/perfil

## Visão Geral da Solução

O objetivo deste plano é eliminar o erro de tela vermelha (*Red Screen of Death*) ao acessar a área de perfil no aplicativo móvel Flutter (`mobile`).

A causa raiz decorre de incompatibilidades de propriedades de layout nos widgets da tela de perfil (ex.: uso do parâmetro `spacing` no widget `Row` do `PhotoWidget`), aliado a possíveis falhas de tratamento de listas ou valores nulos na inicialização do `UserNotifier` (Riverpod) ao assistir o estado sem dados ou durante o parse dos campos no `InfoWidget`.

A solução estabilizará os widgets de apresentação (`PhotoWidget`, `InfoWidget`, `PersonScreen`), garantirá a integridade imutável dos dados em `UserNotifier` (`user_controller.dart`), e adicionará testes automatizados de widget com `flutter_test`.

---

## Arquitetura & Modificações Técnicas

### 1. Refatoração nos Widgets de Apresentação (`mobile/lib/presentation/screens/person/`)

- **`PhotoWidget` (`widgets/photo_widget.dart`)**:
  - Remover a propriedade `spacing: 24.0` do widget `Row` (incompatível em determinadas compilações/versões do SDK Flutter) e substituir por espaçadores explícitos `SizedBox(width: 24)`.
  - Garantir o tratamento seguro de cores e ícones na árvore de renderização.

- **`InfoWidget` (`widgets/info_widget.dart`) e `CustomTextField` (`widgets/custom_text_field.dart`)**:
  - Garantir que os campos de entrada recebam valores válidos convertidos de `UserEntity` (evitando erro de conversão `double.tryParse` ou valores nulos).
  - Garantir o repasse seguro dos callbacks `onChanged` sem provocar chamadas a métodos nulos no notifier.

### 2. Estabilização do Estado no Riverpod (`mobile/lib/presentation/controllers/user_controller.dart`)

- **`UserNotifier`**:
  - Garantir que a inicialização no método `build()` devolva uma instância de `UserEntity` com listas de `instruments` e `styles` inicializadas como listas vazias `const []` e não nulas.
  - Implementar bloco `try/catch` seguro nos métodos `fetchProfile` e `saveProfile`, garantindo que eventuais falhas de rede ou HTTP 404/500 tratem o estado com elegância em vez de propagar uma exceção não capturada para a árvore de widgets.

### 3. Estratégia de Testes (`mobile/test/presentation/screens/person_screen_test.dart`)

- Conforme `constitution.md` §5 (testes em Flutter), criar a suíte de testes de widget para `PersonScreen`:
  1. **Teste de Renderização**: Verificar se `PersonScreen` envolve o componente em `ProviderScope` e constrói a árvore de widgets sem exceções em tela.
  2. **Teste de Interação**: Simular o preenchimento de campos e clique em "Salvar Perfil" validando o disparo do notifier e exibição da *SnackBar*.

---

## Conformidade com a Constituição (`constitution.md`)

- **§1 Stack**: Utiliza exclusivamente Flutter no aplicativo móvel.
- **§2 Arquitetura modular**: Mantém a divisão em três camadas (Clean Architecture) e o padrão de estado reativo com Riverpod (`NotifierProvider`).
- **§5 Qualidade e testes**: Garante testes automatizados no Flutter (`flutter test`), mantendo o padrão de cobertura exigido pelo projeto.
